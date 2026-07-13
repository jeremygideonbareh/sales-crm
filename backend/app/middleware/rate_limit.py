import time
from collections import defaultdict
from fastapi import Request, HTTPException
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, max_requests: int = 5, window_seconds: int = 60):
        super().__init__(app)
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests: dict[str, list[float]] = defaultdict(list)

    async def dispatch(self, request: Request, call_next) -> Response:
        if request.url.path == "/api/auth/login":
            ip = request.client.host if request.client else "unknown"
            now = time.time()
            window_start = now - self.window_seconds
            self.requests[ip] = [t for t in self.requests[ip] if t > window_start]
            if len(self.requests[ip]) >= self.max_requests:
                raise HTTPException(
                    status_code=429,
                    detail="Too many login attempts. Please try again later.",
                )
            self.requests[ip].append(now)

        return await call_next(request)
