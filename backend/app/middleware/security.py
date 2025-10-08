"""
Security Headers Middleware

Adds security headers to all responses.
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware to add security headers"""

    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)

        # Add security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # TODO: Add CSP and HSTS in M2 after testing
        # response.headers["Content-Security-Policy"] = "default-src 'self'"
        # response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"

        return response
