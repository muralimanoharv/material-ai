import time
from starlette.middleware.base import BaseHTTPMiddleware

EXCLUDED_UI_ASSETS = [
    "/",
    "/icon.svg",
    "/favicon.ico",
    "/.well-known/appspecific/com.chrome.devtools.json",
    "/gemini.svg",
]
EXCLUDED_PREFIXES = ["/assets/"]


class AddXAppHeaderMiddleware(BaseHTTPMiddleware):
    """Adds the X-App header, with app name and version, to all responses."""

    def __init__(self, app, app_name: str, app_version: str):
        super().__init__(app)
        self.app_name = app_name
        self.app_version = app_version

    async def dispatch(self, request, call_next):
        route = request.url.path
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        response.headers["X-AppInfo"] = f"{self.app_name}/{self.app_version}"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "no-referrer-when-downgrade"

        is_excluded_path = route in EXCLUDED_UI_ASSETS or any(
            route.startswith(prefix) for prefix in EXCLUDED_PREFIXES
        )
        if is_excluded_path:
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        return response
