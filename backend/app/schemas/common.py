"""
Common Pydantic Schemas

Shared models used across the application.
"""

from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime


class ApiError(BaseModel):
    """Standard API error response"""
    error: str
    message: str
    details: Optional[Dict[str, str]] = None
    retryAfter: Optional[int] = None


class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str
    version: str
    timestamp: str
