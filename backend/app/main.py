"""
FastAPI Main Application

Serves both API endpoints and PWA frontend (production mode).
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import os
from pathlib import Path

from app.core.config import settings
from app.core.logging import setup_logging, get_logger
from app.api import auth, health, route_planning
from app.middleware.request_id import RequestIDMiddleware
from app.middleware.security import SecurityHeadersMiddleware
from app.middleware.error_handler import (
    http_exception_handler,
    validation_exception_handler,
    generic_exception_handler
)

# Setup logging
setup_logging(log_level="DEBUG" if settings.DEBUG else "INFO")
logger = get_logger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
)

# ============================================================================
# Middleware
# ============================================================================

# Request ID middleware (first, so all requests have ID)
app.add_middleware(RequestIDMiddleware)

# Security headers middleware
app.add_middleware(SecurityHeadersMiddleware)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"],
)

# ============================================================================
# Exception Handlers
# ============================================================================

app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# ============================================================================
# API Routes
# ============================================================================

app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(route_planning.router, prefix="/api", tags=["route-planning"])

# ============================================================================
# Startup Event
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Application startup tasks"""
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.APP_ENV}")
    logger.info(f"Debug mode: {settings.DEBUG}")

    # Test database connections
    try:
        from app.db.mssql_client import test_connection as test_mssql
        from app.db.firestore_client import test_connection as test_firestore

        # Test SQL Server
        if test_mssql():
            logger.info("✓ SQL Server connection successful")
        else:
            logger.error("✗ SQL Server connection failed")

        # Test Firestore
        if test_firestore():
            logger.info("✓ Firestore connection successful")
        else:
            logger.error("✗ Firestore connection failed")

    except Exception as e:
        logger.error(f"Database connection test failed: {str(e)}")

    logger.info(f"{settings.APP_NAME} started successfully")


# ============================================================================
# Frontend Static Files (Production Only)
# ============================================================================

frontend_path = Path(settings.FRONTEND_BUILD_PATH)
if frontend_path.exists() and not settings.DEBUG:
    # Mount static assets
    app.mount(
        "/assets",
        StaticFiles(directory=frontend_path / "assets"),
        name="assets"
    )

    # Serve index.html for all other routes (SPA routing)
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        file_path = frontend_path / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_path / "index.html")

    logger.info("Frontend static files enabled")


# ============================================================================
# Run with Uvicorn
# ============================================================================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
