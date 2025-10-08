"""
Authentication Endpoints

Handles user login, logout, and token refresh.
"""

from fastapi import APIRouter, HTTPException, status

from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    User
)
from app.services.auth_service import (
    authenticate_user,
    create_user_tokens,
    validate_refresh_token
)
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Login endpoint

    Authenticates user and returns JWT tokens.

    Args:
        request: Login credentials

    Returns:
        LoginResponse with tokens and user data

    Raises:
        HTTPException: 400 (validation), 401 (invalid credentials),
                      403 (blocked), 429 (rate limit), 500 (server error)
    """
    logger.info(f"Login attempt for user {request.id}")

    # Validate credentials
    # (Rate limiting and account lockout handled in auth_service)
    user = authenticate_user(request.id, request.password)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": "INVALID_CREDENTIALS",
                "message": "Credenciales inválidas"
            }
        )

    # Create tokens
    access_token, refresh_token, expires_in = create_user_tokens(user)

    # Build response
    response = LoginResponse(
        token=access_token,
        refreshToken=refresh_token,
        expiresIn=expires_in,
        user=User(
            id=user.id,
            nombre=user.nombre,
            rol=user.rol
        )
    )

    logger.info(f"Login successful for user {user.id}")

    return response


@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_token(request: RefreshTokenRequest):
    """
    Refresh token endpoint

    Validates refresh token and issues new access token.

    Args:
        request: Refresh token request

    Returns:
        RefreshTokenResponse with new access token

    Raises:
        HTTPException: 401 (invalid token), 500 (server error)
    """
    logger.info("Refresh token request")

    # Validate refresh token and get user
    user = validate_refresh_token(request.refreshToken)

    # Create new access token (keep same refresh token)
    from app.schemas.auth import UserInDB
    from app.db.firestore_client import get_user_by_id

    # Get full user data for token creation
    user_data = get_user_by_id(user.id)
    user_db = UserInDB(**user_data)

    access_token, _, expires_in = create_user_tokens(user_db)

    response = RefreshTokenResponse(
        token=access_token,
        expiresIn=expires_in
    )

    logger.info(f"Token refreshed for user {user.id}")

    return response
