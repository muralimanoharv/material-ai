import os
import logging
from fastapi import APIRouter, Response, Request, Cookie, status
from fastapi.responses import FileResponse, RedirectResponse
from .request import FeedbackRequest
from .app import STATIC_DIR
import json
from .auth import remove_token, get_redirection_url, get_user_details, on_callback
from .oauth import OAuthUserDetail
from .response import UserSuccessResponse

_logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/")
def root():
    return FileResponse(path=os.path.join(STATIC_DIR, "index.html"), media_type='text/html')

@router.post("/feedback")
def feedback(feedback: FeedbackRequest):
    _logger.info(f"SUCCESS: Feedback received from UI {feedback}")
    return Response(status_code=200)


@router.get("/logout", status_code=status.HTTP_200_OK)
async def logout(refresh_token: str | None = Cookie(None)):
    response = Response(status_code=200)
    await remove_token(response, refresh_token)
    return response 


@router.get("/login")
async def login(request: Request):
    """
    Redirects the user to OAuth 2.0 server for authentication.
    """
    # Generate a secure state token
    state, redirect_url = get_redirection_url()
    request.session["oauth_state"] = state
    return RedirectResponse(url=redirect_url)



@router.get("/user",)
async def user(response: Response, 
               user_info: str | None = Cookie(None), 
               refresh_token: str | None = Cookie(None)):
    
    if refresh_token == None:
        return Response(status_code=401)
    
    if user_info != None:
        return UserSuccessResponse(user_response=OAuthUserDetail(**json.loads(user_info)))
    
    # Token has expired we need to regenerate token
    return await get_user_details(response, refresh_token)
    



@router.get("/auth",)
async def callback(request: Request, code: str, state: str):
    """
    Handles the callback from OAuth2.0 after user authentication.
    """
    stored_state = request.session.get("oauth_state")
    if not stored_state or stored_state != state:
        return Response(status_code=403)
    
    
    return await on_callback(code)


