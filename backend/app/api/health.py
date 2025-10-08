"""
Health Check Endpoint

Simple endpoint to verify API is running.
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "message": "webpv backend is running"
    }
