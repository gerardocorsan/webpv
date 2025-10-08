"""
Error Handler Middleware

Standardizes error responses across the application.
"""

from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logging import get_logger

logger = get_logger(__name__)


async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """
    Handler for HTTPException

    Formats error response according to API spec
    """
    # If detail is already a dict (from our services), use it
    if isinstance(exc.detail, dict):
        return JSONResponse(
            status_code=exc.status_code,
            content=exc.detail
        )

    # Otherwise, create standard error response
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTP_ERROR",
            "message": str(exc.detail)
        }
    )


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handler for validation errors

    Formats validation errors according to API spec
    """
    # Extract field errors
    details = {}
    for error in exc.errors():
        field = ".".join(str(loc) for loc in error["loc"] if loc != "body")
        details[field] = error["msg"]

    logger.warn(f"Validation error: {details}")

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "error": "VALIDATION_ERROR",
            "message": "Datos de entrada inválidos",
            "details": details
        }
    )


async def generic_exception_handler(request: Request, exc: Exception):
    """
    Handler for unhandled exceptions

    Returns 500 error with generic message
    """
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "INTERNAL_ERROR",
            "message": "Error interno del servidor. Intente nuevamente"
        }
    )
