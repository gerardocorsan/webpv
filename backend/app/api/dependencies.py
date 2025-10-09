"""
API Dependencies

Shared dependencies for API endpoints.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError

from app.core.security import verify_token
from app.core.logging import get_logger, set_request_context
from app.db.firestore_client import get_user_by_id
from app.schemas.auth import User, UserInDB

logger = get_logger(__name__)

# OAuth2 scheme for Bearer token
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> UserInDB:
    """
    Get current authenticated user from JWT token

    Args:
        credentials: HTTP Authorization credentials (Bearer token)

    Returns:
        User object

    Raises:
        HTTPException: If token is invalid or user not found
    """
    token = credentials.credentials

    # Verify token
    try:
        payload = verify_token(token)
    except JWTError as e:
        logger.warn(f"Invalid JWT token: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": "INVALID_CREDENTIALS",
                "message": "Token de autenticación inválido"
            },
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Extract user ID from token
    user_id: str = payload.get("sub")
    if not user_id:
        logger.error("Token missing 'sub' claim")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": "INVALID_CREDENTIALS",
                "message": "Token de autenticación inválido"
            },
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Get user from database
    user_data = get_user_by_id(user_id)
    if not user_data:
        logger.error(f"User {user_id} from valid token not found in database")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": "INVALID_CREDENTIALS",
                "message": "Usuario no encontrado"
            },
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create User object
    user = UserInDB(**user_data)

    # Set user in logging context
    set_request_context(user_id=user.id)

    return user


async def get_current_active_user(
    current_user: UserInDB = Depends(get_current_user)
) -> UserInDB:
    """
    Get current user and verify they are active

    Args:
        current_user: Current user from token

    Returns:
        User object

    Raises:
        HTTPException: If user is inactive or blocked
    """
    if not current_user.activo:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "ACCOUNT_BLOCKED",
                "message": "Cuenta inactiva"
            }
        )

    if current_user.bloqueado:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "ACCOUNT_BLOCKED",
                "message": "Cuenta bloqueada"
            }
        )

    return current_user
