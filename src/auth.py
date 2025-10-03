import requests
import secrets
from fastapi import Response
from typing import Tuple
from .config import get_config
from .response import UserSuccessResponse
from .internal import UserDetail
from .exec import UserResponseError, AuthorizationError

def get_user(access_token: str) -> UserDetail:
    user_info_url = "https://www.googleapis.com/oauth2/v3/userinfo"
    user_info_response = requests.get(
                user_info_url, 
                headers= {
                    "Authorization": f"Bearer {access_token}"
                }
    )
    user_info = user_info_response.json()
    return UserDetail(**user_info)


def set_oauth_token_cookies(response: Response, token_data):
    response.set_cookie(
        key="access_token",
        value=token_data.get('access_token'),
        httponly=True,
        secure=False ,
        expires=token_data.get('expires_in'), 
        samesite="lax",
    )
    response.set_cookie(
        key="refresh_token",
        value=token_data.get('refresh_token'),
        httponly=True,
        secure=False , 
        samesite="lax",
    )
    response.set_cookie(
        key="user_info",
        value=token_data.get('user_info'),
        httponly=True,
        secure=False,
        expires=token_data.get('expires_in'),  
        samesite="lax",
    )


def delete_oauth_token_cookies(response: Response):
    response.delete_cookie("access_token")
    response.delete_cookie("refresh_token")
    response.delete_cookie("user_info")


def do_oauth_login() -> Tuple[str, str]:
    state = secrets.token_urlsafe(16)
    # Construct authorization URL
    scope = "openid email profile"
    config = get_config()
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"response_type=code&"
        f"client_id={config.sso.client_id}&"
        f"redirect_uri={config.sso.redirect_uri}&"
        f"scope={scope}&"
        f"state={state}&"
        f"access_type=offline&"
        f"prompt=consent"
    )
    return (state, auth_url)


def get_user_details(response: Response, 
                     refresh_token: str) -> UserSuccessResponse | UserResponseError:
    
    config = get_config()
    token_url = "https://oauth2.googleapis.com/token"
    token_payload = {
        "client_id": config.sso.client_id,
        "client_secret": config.sso.client_secret,
        "refresh_token": refresh_token,
        "grant_type": "refresh_token",
    }
    token_response = requests.post(token_url, data=token_payload)
    token_data = token_response.json()

    if "error" in token_data:
        return UserResponseError(status_code=400, detail=token_data.get("error_description"))
    
    access_token = token_data.get('access_token')
    user_detail = get_user(access_token)

    token_data["user_info"] = user_detail.model_dump_json()
    token_data["refresh_token"] = refresh_token

    set_oauth_token_cookies(response, token_data)
    return UserSuccessResponse(user_response=user_detail)

def on_callback(response: Response, code: str) -> AuthorizationError:
    config = get_config()
    token_url = "https://oauth2.googleapis.com/token"
    token_payload = {
        "code": code,
        "client_id": config.sso.client_id,
        "client_secret": config.sso.client_secret,
        "redirect_uri": config.sso.redirect_uri,
        "grant_type": "authorization_code",
    }

    token_response = requests.post(token_url, data=token_payload)
    token_data = token_response.json()
    if "error" in token_data:
        return AuthorizationError(status_code=400, detail=token_data.get("error_description"))
    access_token = token_data.get("access_token")
    user_info = get_user(access_token)
    token_data["user_info"] = user_info.model_dump_json()
    set_oauth_token_cookies(response, token_data)
    return response


