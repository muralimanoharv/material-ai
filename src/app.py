import threading
import logging
import os
from fastapi import FastAPI, Request, HTTPException, Response
from google.adk.cli.fast_api import get_fast_api_app
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.sessions import SessionMiddleware
from fastapi.middleware.cors import CORSMiddleware
from .config import get_config
from fastapi.staticfiles import StaticFiles
from .exec import ConfigError, UnauthorizedException
import time
import http.cookies
from .auth import _remove_cookies
from .oauth import get_oauth, OAuthErrorResponse
from . import __app_name__, __version__

_lock = threading.Lock()
_logger = logging.getLogger(__name__)
_app_instance: FastAPI | None = None
_lock = threading.Lock()

STATIC_DIR = os.path.join("material-ai-frontend", "dist")
AGENT_DIR = f"{os.path.dirname(os.path.abspath(__file__))}/agents"
ALLOWED_ORIGINS = [
    "http://localhost",
    "http://localhost:5173",
    "http://127.0.0.1",
    "http://127.0.0.1:5173",
]


class AddXAppHeaderMiddleware(BaseHTTPMiddleware):
    """Adds the X-App header, with app name and version, to all responses."""

    def __init__(self, app, app_name: str, app_version: str):
        super().__init__(app)
        self.app_name = app_name
        self.app_version = app_version

    async def dispatch(self, request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        response.headers["X-AppInfo"] = f"{self.app_name}/{self.app_version}"
        return response


class AuthMiddleware(BaseHTTPMiddleware):
    """Adds the X-App header, with app name and version, to all responses."""

    def __init__(self, app):
        super().__init__(app)

    async def dispatch(self, request, call_next):
        route = request.url.path
        EXCLUDED_PATHS = [
            "/",
            "/login",
            "/auth",
            "/icon.svg",
            "/.well-known/appspecific/com.chrome.devtools.json",
        ]
        EXCLUDED_PREFIXES = ["/assets/"]
        is_excluded_path = route in EXCLUDED_PATHS or any(
            route.startswith(prefix) for prefix in EXCLUDED_PREFIXES
        )

        if is_excluded_path:
            return await call_next(request)

        cookies_header = request.headers.get("cookie")

        try:
            if not cookies_header:
                raise UnauthorizedException()

            cookies = http.cookies.SimpleCookie()
            cookies.load(cookies_header)

            if cookies.get("refresh_token") == None:
                raise UnauthorizedException()

            if route == "/user":
                return await call_next(request)

            if cookies.get("access_token") == None:
                raise UnauthorizedException()
            if cookies.get("user_info") == None:
                raise UnauthorizedException()

            auth = get_oauth()

            access_token_cookie = cookies.get("access_token")
            oauth_response = await auth.sso_verify_access_token(
                access_token_cookie.value
            )

            if isinstance(oauth_response, OAuthErrorResponse):
                raise UnauthorizedException()

            if not oauth_response:
                raise UnauthorizedException()

            response = await call_next(request)
            return response
        except UnauthorizedException as e:
            response = Response(status_code=401)
            _remove_cookies(response)
            return response


def _setup_app(app: FastAPI) -> None:
    """
    Configures the FastAPI application with middleware, logging,
    based on the provided configuration settings. This setup is intended for use in environments
    such as GKE or similar platforms that support structured log parsing. Debug mode adjustments
    and security considerations are also applied. API routes are registered during setup.

    Args:
        app (FastAPI): The FastAPI application instance to configure.

    Raises:
        RuntimeError: If the configuration is invalid or cannot be loaded.
    """
    # If we can't configure the app, exit immediately
    try:
        config = get_config()
    except ConfigError as e:
        raise RuntimeError("Bad configuration") from e  # yes, really

    # Custom header middleware
    app.add_middleware(
        AuthMiddleware,
    )
    app.add_middleware(
        AddXAppHeaderMiddleware,
        app_name=__app_name__,
        app_version=__version__,
    )
    app.add_middleware(SessionMiddleware, secret_key=config.sso.session_secret_key)
    app.add_exception_handler(HTTPException, http_exception_cookie_clearer)

    from .api import router as core_router

    app.include_router(core_router)
    app.mount("/", StaticFiles(directory=STATIC_DIR), name="static")

    if config.general.debug:
        _logger.debug("App running in DEBUG mode")
        app.add_middleware(
            CORSMiddleware,
            allow_origins=ALLOWED_ORIGINS,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )


def get_app():
    """
    This ensures we construct only a single instance of the app.  We also prevent a
    rat's nest of circular imports by exposing only a single app factory function
    """
    global _app_instance
    with _lock:
        if _app_instance is None:
            config = get_config()
            app = get_fast_api_app(
                agent_dir=AGENT_DIR,
                web=False,
                allow_origins=ALLOWED_ORIGINS if config.general.debug else [],
            )
            _setup_app(app)
            _app_instance = app

        return _app_instance


async def http_exception_cookie_clearer(request: Request, exc: HTTPException):
    """
    Catches any HTTPException. If the status code is 401 (Unauthorized),
    it clears authentication cookies before returning the error response.
    """
    # If the exception is a 401 Unauthorized, clear the cookies
    if exc.status_code == 401:
        # Create a standard JSON response for the 401 error
        response = Response(
            status_code=401,
        )
        _remove_cookies(response)
        return response

    # For all other HTTPExceptions, fall back to the default behavior
    return Response(
        status_code=exc.status_code,
    )
