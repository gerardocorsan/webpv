"""
Authentication Endpoints

Handles user login, logout, and token refresh.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Literal

router = APIRouter()


# Request/Response models
class LoginRequest(BaseModel):
    id: str
    password: str
    rememberMe: bool = True


class User(BaseModel):
    id: str
    nombre: str
    rol: Literal["asesor", "supervisor"]


class LoginResponse(BaseModel):
    token: str
    refreshToken: str
    expiresIn: int
    user: User


class RefreshTokenRequest(BaseModel):
    refreshToken: str


class RefreshTokenResponse(BaseModel):
    token: str
    expiresIn: int


# Mock users (replace with database lookup)
MOCK_USERS = {
    "A012345": {
        "id": "A012345",
        "password": "demo123",  # In production: hash passwords!
        "nombre": "Juan Pérez",
        "rol": "asesor",
    },
    "A067890": {
        "id": "A067890",
        "password": "test456",
        "nombre": "María González",
        "rol": "supervisor",
    },
}


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Login endpoint"""

    # Validate credentials (MOCK - replace with real auth)
    user = MOCK_USERS.get(request.id)

    if not user or user["password"] != request.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # TODO: Generate real JWT tokens
    mock_token = f"mock-jwt-token-{user['id']}"
    mock_refresh_token = f"mock-refresh-token-{user['id']}"

    return LoginResponse(
        token=mock_token,
        refreshToken=mock_refresh_token,
        expiresIn=3600,
        user=User(
            id=user["id"],
            nombre=user["nombre"],
            rol=user["rol"]
        )
    )


@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_token(request: RefreshTokenRequest):
    """Refresh token endpoint"""

    # TODO: Validate refresh token and generate new access token
    if not request.refreshToken.startswith("mock-refresh-token"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    return RefreshTokenResponse(
        token=f"new-mock-token-{request.refreshToken}",
        expiresIn=3600
    )
