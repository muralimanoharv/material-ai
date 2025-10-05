from fastapi import Response, HTTPException
from fastapi.responses import RedirectResponse
from typing import Tuple
from .config import get_config
from .response import UserSuccessResponse
from .oauth import get_oauth, OAuthErrorResponse, OAuthSuccessResponse


def _set_oauth_token_cookies(response: Response, oauth_response: OAuthSuccessResponse):
    response.set_cookie(
        key="access_token",
        value=oauth_response.access_token,
        httponly=True,
        secure=False,
        expires=oauth_response.expires_in,
        samesite="lax",
    )
    response.set_cookie(
        key="refresh_token",
        value=oauth_response.refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
    )
    response.set_cookie(
        key="user_info",
        value=oauth_response.user_detail.model_dump_json(),
        httponly=True,
        secure=False,
        expires=oauth_response.expires_in,
        samesite="lax",
    )


def _remove_cookies(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    response.delete_cookie("user_info")


async def remove_token(response: Response, refresh_token: str) -> Response:
    if refresh_token == None:
        _remove_cookies(response)
        return
    auth = get_oauth()
    oauth_response = await auth.sso_revoke_refresh_token(refresh_token)
    if isinstance(oauth_response, OAuthErrorResponse):
        raise HTTPException(status_code=500)
    _remove_cookies(response)
    return response


def get_redirection_url() -> Tuple[str, str]:
    config = get_config()
    auth = get_oauth()
    response = auth.sso_get_redirection_url(sso=config.sso)
    return (response.state, response.redirection_url)


async def get_user_details(
    response: Response, refresh_token: str
) -> UserSuccessResponse:

    config = get_config()
    auth = get_oauth()
    oauth_response = await auth.sso_get_new_access_token(config.sso, refresh_token)

    if isinstance(oauth_response, OAuthErrorResponse):
        raise HTTPException(status_code=500)

    oauth_success_response: OAuthSuccessResponse = oauth_response

    _set_oauth_token_cookies(response, oauth_success_response)

    return UserSuccessResponse(user_response=oauth_success_response.user_detail)


async def on_callback(authorization_code: str) -> Response:
    config = get_config()
    auth = get_oauth()

    oauth_response = await auth.sso_get_access_token(config.sso, authorization_code)

    if isinstance(oauth_response, OAuthErrorResponse):
        raise HTTPException(status_code=500)

    response = RedirectResponse(url="/", status_code=302)

    _set_oauth_token_cookies(response, oauth_response)

    return response
