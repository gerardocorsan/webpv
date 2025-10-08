"""
Authentication Pydantic Schemas

Models for authentication requests and responses.
"""

from pydantic import BaseModel, Field
from typing import Literal, Optional


class LoginRequest(BaseModel):
    """Login request payload"""
    id: str = Field(..., min_length=6, max_length=10, description="User ID")
    password: str = Field(..., min_length=1, description="User password")
    rememberMe: bool = Field(default=True, description="Remember user session")


class User(BaseModel):
    """User data"""
    id: str
    nombre: str
    rol: Literal["asesor", "supervisor", "admin"]


class UserInDB(User):
    """User data stored in database (includes password hash and route)"""
    password_hash: str
    ruta: str  # Route code (e.g., '001')
    activo: bool = True
    bloqueado: bool = False
    intentos_fallidos: int = 0


class LoginResponse(BaseModel):
    """Login response"""
    token: str
    refreshToken: str
    expiresIn: int
    user: User


class RefreshTokenRequest(BaseModel):
    """Refresh token request"""
    refreshToken: str


class RefreshTokenResponse(BaseModel):
    """Refresh token response"""
    token: str
    expiresIn: int
