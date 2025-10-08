"""
Authentication Service

Business logic for user authentication and token management.
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Tuple
from fastapi import HTTPException, status

from app.core.security import (
    verify_password,
    create_access_token,
    generate_refresh_token,
    get_refresh_token_expiration
)
from app.core.config import settings
from app.core.logging import get_logger
from app.db.firestore_client import (
    get_user_by_id,
    update_user,
    save_refresh_token,
    get_refresh_token,
    revoke_refresh_token
)
from app.schemas.auth import UserInDB, User

logger = get_logger(__name__)

# In-memory rate limiting (simple implementation for M1)
_login_attempts: Dict[str, list] = {}
_locked_accounts: Dict[str, datetime] = {}


# ============================================================================
# Rate Limiting
# ============================================================================

def check_rate_limit(user_id: str) -> None:
    """
    Check if user is rate limited

    Args:
        user_id: User ID to check

    Raises:
        HTTPException: If rate limit exceeded
    """
    if not settings.RATE_LIMIT_ENABLED:
        return

    # Check if account is locked
    if user_id in _locked_accounts:
        locked_until = _locked_accounts[user_id]
        if datetime.utcnow() < locked_until:
            remaining = int((locked_until - datetime.utcnow()).total_seconds())
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "RATE_LIMIT_EXCEEDED",
                    "message": f"Cuenta bloqueada temporalmente. Intente nuevamente en {remaining // 60} minutos",
                    "retryAfter": remaining
                }
            )
        else:
            # Lock expired, remove it
            del _locked_accounts[user_id]
            if user_id in _login_attempts:
                del _login_attempts[user_id]

    # Check rate limit
    now = datetime.utcnow()
    cutoff = now - timedelta(minutes=settings.RATE_LIMIT_LOCKOUT_MINUTES)

    if user_id in _login_attempts:
        # Remove old attempts
        _login_attempts[user_id] = [
            attempt for attempt in _login_attempts[user_id]
            if attempt > cutoff
        ]

        # Check if limit exceeded
        if len(_login_attempts[user_id]) >= settings.RATE_LIMIT_PER_MINUTE:
            # Lock account
            lockout_duration = timedelta(minutes=settings.RATE_LIMIT_LOCKOUT_MINUTES)
            _locked_accounts[user_id] = now + lockout_duration

            logger.warn(f"Account {user_id} locked due to too many failed attempts")

            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail={
                    "error": "RATE_LIMIT_EXCEEDED",
                    "message": f"Demasiados intentos fallidos. Cuenta bloqueada por {settings.RATE_LIMIT_LOCKOUT_MINUTES} minutos",
                    "retryAfter": settings.RATE_LIMIT_LOCKOUT_MINUTES * 60
                }
            )


def record_failed_attempt(user_id: str) -> None:
    """Record a failed login attempt"""
    if user_id not in _login_attempts:
        _login_attempts[user_id] = []
    _login_attempts[user_id].append(datetime.utcnow())


def clear_failed_attempts(user_id: str) -> None:
    """Clear failed login attempts for user"""
    if user_id in _login_attempts:
        del _login_attempts[user_id]


# ============================================================================
# Authentication
# ============================================================================

def authenticate_user(user_id: str, password: str) -> Optional[UserInDB]:
    """
    Authenticate user with credentials

    Args:
        user_id: User ID
        password: Plain text password

    Returns:
        User object if authentication successful, None otherwise

    Raises:
        HTTPException: If rate limit exceeded
    """
    # Check rate limit
    check_rate_limit(user_id)

    # Get user from database
    user_data = get_user_by_id(user_id)

    if not user_data:
        logger.info(f"Login failed: User {user_id} not found")
        record_failed_attempt(user_id)
        return None

    user = UserInDB(**user_data)

    # Check if user is blocked
    if user.bloqueado:
        logger.warn(f"Login attempt for blocked user {user_id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "ACCOUNT_BLOCKED",
                "message": "Cuenta bloqueada. Contacte al administrador"
            }
        )

    # Check if user is active
    if not user.activo:
        logger.warn(f"Login attempt for inactive user {user_id}")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "ACCOUNT_BLOCKED",
                "message": "Cuenta inactiva. Contacte al administrador"
            }
        )

    # Verify password
    if not verify_password(password, user.password_hash):
        logger.info(f"Login failed: Invalid password for user {user_id}")
        record_failed_attempt(user_id)

        # Update failed attempts in database
        update_user(user_id, {
            "intentos_fallidos": user.intentos_fallidos + 1
        })

        # Check if should block account (5 failed attempts)
        if user.intentos_fallidos + 1 >= 5:
            update_user(user_id, {
                "bloqueado": True
            })
            logger.warn(f"Account {user_id} blocked due to too many failed password attempts")

        return None

    # Authentication successful
    logger.info(f"User {user_id} authenticated successfully")

    # Clear failed attempts
    clear_failed_attempts(user_id)

    # Reset failed attempts counter in database
    if user.intentos_fallidos > 0:
        update_user(user_id, {
            "intentos_fallidos": 0
        })

    return user


def create_user_tokens(user: UserInDB) -> Tuple[str, str, int]:
    """
    Create access and refresh tokens for user

    Args:
        user: User object

    Returns:
        Tuple of (access_token, refresh_token, expires_in_seconds)
    """
    # Create access token
    token_data = {
        "sub": user.id,
        "rol": user.rol,
        "ruta": user.ruta
    }
    access_token = create_access_token(token_data)

    # Create refresh token
    refresh_token = generate_refresh_token()
    refresh_expires_at = get_refresh_token_expiration()

    # Save refresh token to database
    save_refresh_token(refresh_token, user.id, refresh_expires_at)

    logger.info(f"Tokens created for user {user.id}")

    return access_token, refresh_token, settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60


def validate_refresh_token(token: str) -> Optional[User]:
    """
    Validate refresh token and return user

    Args:
        token: Refresh token string

    Returns:
        User object if token valid, None otherwise

    Raises:
        HTTPException: If token is invalid or revoked
    """
    # Get token from database
    token_data = get_refresh_token(token)

    if not token_data:
        logger.warn("Refresh token not found")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": "INVALID_CREDENTIALS",
                "message": "Token de actualización inválido"
            }
        )

    # Check if token is revoked
    if token_data.get("revoked", False):
        logger.warn("Attempted use of revoked refresh token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": "INVALID_CREDENTIALS",
                "message": "Token de actualización revocado"
            }
        )

    # Check if token is expired
    expires_at = token_data.get("expires_at")
    # Handle both offset-aware and offset-naive datetimes
    now = datetime.utcnow()
    if expires_at.tzinfo is not None:
        # expires_at is offset-aware, make now also aware
        from datetime import timezone
        now = now.replace(tzinfo=timezone.utc)
    if now > expires_at:
        logger.warn("Refresh token expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": "INVALID_CREDENTIALS",
                "message": "Token de actualización expirado"
            }
        )

    # Get user
    user_id = token_data.get("user_id")
    user_data = get_user_by_id(user_id)

    if not user_data:
        logger.error(f"User {user_id} not found for valid refresh token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": "INVALID_CREDENTIALS",
                "message": "Usuario no encontrado"
            }
        )

    # Return user (not UserInDB, we don't need password hash)
    return User(
        id=user_data["id"],
        nombre=user_data["nombre"],
        rol=user_data["rol"]
    )
