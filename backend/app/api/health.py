"""
Health Check Endpoint

Simple endpoint to verify API is running.
"""

from fastapi import APIRouter
from datetime import datetime

from app.schemas.common import HealthCheckResponse
from app.core.config import settings

router = APIRouter()


@router.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """
    Health check endpoint

    Returns:
        HealthCheckResponse with status, version, and timestamp
    """
    return HealthCheckResponse(
        status="healthy",
        version=settings.APP_VERSION,
        timestamp=datetime.utcnow().isoformat() + "Z"
    )
