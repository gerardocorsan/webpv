"""
Request ID Middleware

Adds unique request ID to each request for tracking.
"""

import uuid
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from app.core.logging import set_request_context, clear_request_context


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Middleware to add request ID to each request"""

    async def dispatch(self, request: Request, call_next):
        # Generate request ID
        request_id = str(uuid.uuid4())

        # Add to request state
        request.state.request_id = request_id

        # Set in logging context
        set_request_context(request_id=request_id)

        # Call next middleware/route
        response: Response = await call_next(request)

        # Add request ID to response headers
        response.headers["X-Request-ID"] = request_id

        # Clear logging context
        clear_request_context()

        return response
