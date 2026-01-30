import secrets
import httpx
import logging
import urllib.parse
from .interface import IOAuthService
from .schema import OAuthRedirectionResponse, OAuthUserDetail, OAuthSuccessResponse
from .schema import OAuthErrorResponse, SSOConfig
from .util import handle_httpx_errors

_logger = logging.getLogger(__name__)

SCOPE = "openid profile email User.Read offline_access"


class AzureOAuthService(IOAuthService):

    def sso_get_redirection_url(self, sso: SSOConfig) -> OAuthRedirectionResponse:
        state = secrets.token_urlsafe(16)

        params = {
            "client_id": sso.client_id,
            "response_type": "code",
            "redirect_uri": sso.redirect_uri,
            "response_mode": "query",
            "scope": SCOPE,
            "state": state,
        }

        query_string = urllib.parse.urlencode(params)

        tenant = sso.tenant_id
        base_url = f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize"
        redirection_url = f"{base_url}?{query_string}"

        return OAuthRedirectionResponse(redirection_url=redirection_url, state=state)

    @handle_httpx_errors(
        url="https://login.microsoftonline.com/<tenant>/oauth2/v2.0/token"
    )
    async def sso_get_access_token(
        self, sso: SSOConfig, authorization_code: str
    ) -> OAuthSuccessResponse | OAuthErrorResponse:
        tenant = sso.tenant_id
        url = f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"
        token_payload = {
            "code": authorization_code,
            "client_id": sso.client_id,
            "scope": SCOPE,
            "client_secret": sso.client_secret,
            "redirect_uri": sso.redirect_uri,
            "grant_type": "authorization_code",
        }
        _logger.debug(f"DEBUG: Requesting access token from {url}")

        async with httpx.AsyncClient() as client:
            response = await client.post(url, data=token_payload)
            response.raise_for_status()

        token_data = response.json()
        if "error" in token_data:
            return OAuthErrorResponse(
                status_code=400, detail=token_data.get("error_description")
            )
        access_token = token_data.get("access_token")
        expires_in = token_data.get("expires_in")
        refresh_token = token_data.get("refresh_token")
        user_detail = await self.sso_get_user_details(access_token)
        if isinstance(user_detail, OAuthErrorResponse):
            return user_detail

        return OAuthSuccessResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user_detail=user_detail,
            expires_in=expires_in,
        )

    @handle_httpx_errors(url="https://oauth2.googleapis.com/token")
    async def sso_get_new_access_token(
        self, sso: SSOConfig, refresh_token: str
    ) -> OAuthSuccessResponse | OAuthErrorResponse:
        tenant = sso.tenant_id
        url = f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"

        token_payload = {
            "refresh_token": refresh_token,
            "client_id": sso.client_id,
            "scope": SCOPE,
            "client_secret": sso.client_secret,
            "redirect_uri": sso.redirect_uri,
            "grant_type": "refresh_token",
        }
        _logger.debug(f"DEBUG: Requesting access token from {url}")

        async with httpx.AsyncClient() as client:
            response = await client.post(url, data=token_payload)
            response.raise_for_status()

        token_data = response.json()
        if "error" in token_data:
            return OAuthErrorResponse(
                status_code=400, detail=token_data.get("error_description")
            )
        access_token = token_data.get("access_token")
        expires_in = token_data.get("expires_in")
        refresh_token = token_data.get("refresh_token")
        user_detail = await self.sso_get_user_details(access_token)
        if isinstance(user_detail, OAuthErrorResponse):
            return user_detail

        return OAuthSuccessResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user_detail=user_detail,
            expires_in=expires_in,
        )

    @handle_httpx_errors(url="https://graph.microsoft.com/v1.0/me")
    async def sso_get_user_details(
        self, access_token: str
    ) -> OAuthUserDetail | OAuthErrorResponse:
        url = "https://graph.microsoft.com/v1.0/me?$select=id,displayName,givenName,surname,mail,userPrincipalName"

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()

        user_details = response.json()
        user_detail = OAuthUserDetail(
            sub=user_details.get("id"),
            name=user_details.get("displayName"),
            given_name=user_details.get("givenName"),
            family_name=user_details.get("surname"),
            picture="",
            email=user_details.get("mail"),
            email_verified=True,
        )

        return user_detail

    @handle_httpx_errors(url="https://oauth2.googleapis.com/revoke")
    async def sso_revoke_refresh_token(
        self, refresh_token: str, access_token: str
    ) -> None | OAuthErrorResponse:
        url = "https://graph.microsoft.com/v1.0/me/revokeSignInSessions"
        headers = {"Authorization": f"Bearer {access_token}"}

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers)
            response.raise_for_status()

        _logger.info("INFO: Token successfully revoked.")

    @handle_httpx_errors(url="https://graph.microsoft.com/v1.0/me?")
    async def sso_verify_access_token(
        self, access_token: str
    ) -> bool | OAuthErrorResponse:
        url = "https://graph.microsoft.com/v1.0/me?$select=id,displayName,givenName,surname,mail,userPrincipalName"

        headers = {
            "Authorization": f"Bearer {access_token}",
            "Accept": "application/json",
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()
            return response.status_code == 200
