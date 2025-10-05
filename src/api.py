import os
import logging
from fastapi import APIRouter, Response, Request, Cookie, status
from fastapi.responses import FileResponse, RedirectResponse, HTMLResponse
from .request import FeedbackRequest
from .app import STATIC_DIR
import json
from .auth import (
    remove_token,
    get_redirection_url,
    get_user_details,
    on_callback,
    verify_user_details,
)
from .oauth import OAuthUserDetail
from .response import UserSuccessResponse

_logger = logging.getLogger(__name__)
router = APIRouter()


@router.get(
    "/",
    summary="Serve Frontend Application",
    description="Serves the main index.html file, which is the entry point for the web UI.",
    response_class=HTMLResponse,
    responses={
        200: {
            "description": "The main HTML page of the application.",
        }
    },
)
def root():
    return FileResponse(
        path=os.path.join(STATIC_DIR, "index.html"), media_type="text/html"
    )


@router.post(
    "/feedback",
    summary="Submit User Feedback",
    description="Receives and logs feedback sent from the user interface.",
    status_code=status.HTTP_200_OK,
)
def feedback(feedback: FeedbackRequest):
    _logger.info(f"SUCCESS: Feedback received from UI {feedback}")
    return Response(status_code=200)


@router.get(
    "/logout",
    summary="Log Out User and Invalidate Session",
    description="Revokes the user's refresh token with the provider and clears session cookies from the browser.",
    status_code=status.HTTP_200_OK,
    responses={
        200: {
            "description": "Logout successful. Response includes headers to clear authentication cookies.",
        }
    },
)
async def logout(refresh_token: str | None = Cookie(None)):
    """
    Terminates the user's session.
    """
    response = Response(status_code=200)
    await remove_token(response, refresh_token)
    return response


@router.get(
    "/login",
    summary="Initiate OAuth 2.0 Login Flow",
    description="Redirects the user to the OAuth provider's authorization page and sets a CSRF token.",
    responses={
        307: {
            "description": "Redirects to the OAuth provider. The 'Location' header contains the authorization URL."
        }
    },
)
async def login(request: Request):
    """
    Redirects the user to OAuth 2.0 server for authentication.
    """
    # Generate a secure state token
    state, redirect_url = get_redirection_url()
    request.session["oauth_state"] = state
    return RedirectResponse(url=redirect_url)


@router.get(
    "/user",
    summary="Get Authenticated User's Details",
    description="Retrieves user info from a cache cookie or refreshes it using a refresh token cookie.",
    response_model=UserSuccessResponse,
    responses={
        401: {"description": "Unauthorized. The refresh_token cookie is missing."},
    },
)
async def user(
    response: Response,
    user_details: str | None = Cookie(
        None, description="Cached user details as a JSON string."
    ),
    refresh_token: str | None = Cookie(
        None, description="Required refresh token for authentication."
    ),
):
    """
    Handles user detail retrieval based on session cookies.
    """
    if refresh_token is None:
        return Response(status_code=401)

    if user_details is not None:
        user_details = verify_user_details(user_details)
        return UserSuccessResponse(
            user_response=OAuthUserDetail(**json.loads(user_details))
        )

    return await get_user_details(response, refresh_token)


@router.get(
    "/auth",
    summary="Handle OAuth 2.0 Provider Callback",
    description="Validates the state and exchanges the authorization code for an access token.",
    responses={
        302: {
            "description": "Successful Authentication. The user is redirected to the frontend application with a session cookie."
        },
        403: {
            "description": "CSRF Detected. The 'state' parameter is invalid or missing."
        },
    },
)
async def callback(request: Request, code: str, state: str):
    """
    Handles the callback from OAuth2.0 after user authentication.
    """
    stored_state = request.session.get("oauth_state")
    if not stored_state or stored_state != state:
        return Response(status_code=403)

    return await on_callback(code)
