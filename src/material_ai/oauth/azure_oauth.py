import secrets
import httpx
import logging
import jwt
from jwt import PyJWKClient
import urllib.parse
from .interface import IOAuthService
from .schema import OAuthRedirectionResponse, OAuthUserDetail, OAuthSuccessResponse
from .schema import OAuthErrorResponse, SSOConfig
from .util import handle_httpx_errors

_logger = logging.getLogger(__name__)


class AzureOAuthService(IOAuthService):

    def __init__(self):
        self.client = None

    def sso_get_redirection_url(self, sso: SSOConfig) -> OAuthRedirectionResponse:
        state = secrets.token_urlsafe(16)

        params = {
            "client_id": sso.client_id,
            "response_type": "code",
            "redirect_uri": sso.redirect_uri,
            "response_mode": "query",
            "scope": sso.scope,
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
            "scope": sso.scope,
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
        id_token = token_data.get("id_token")
        user_detail = await self.sso_verify_id_token(sso, id_token)
        if isinstance(user_detail, OAuthErrorResponse):
            return user_detail

        return OAuthSuccessResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user_detail=user_detail,
            expires_in=expires_in,
            id_token=id_token,
        )

    @handle_httpx_errors(
        url="https://login.microsoftonline.com/tenant/oauth2/v2.0/token"
    )
    async def sso_get_new_access_token(
        self, sso: SSOConfig, refresh_token: str
    ) -> OAuthSuccessResponse | OAuthErrorResponse:
        tenant = sso.tenant_id
        url = f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"

        token_payload = {
            "refresh_token": refresh_token,
            "client_id": sso.client_id,
            "scope": sso.scope,
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
        id_token = token_data.get("id_token")
        user_detail = await self.sso_verify_id_token(sso, id_token)
        if isinstance(user_detail, OAuthErrorResponse):
            return user_detail

        return OAuthSuccessResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user_detail=user_detail,
            expires_in=expires_in,
            id_token=id_token,
        )

    async def sso_get_user_details(
        self, access_token: str
    ) -> OAuthUserDetail | OAuthErrorResponse:
        pass

    @handle_httpx_errors(url="https://graph.microsoft.com/v1.0/me/revokeSignInSessions")
    async def sso_revoke_refresh_token(
        self, refresh_token: str, access_token: str
    ) -> None | OAuthErrorResponse:
        url = "https://graph.microsoft.com/v1.0/me/revokeSignInSessions"
        headers = {"Authorization": f"Bearer {access_token}"}

        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers)
            response.raise_for_status()

        _logger.info("INFO: Token successfully revoked.")

    async def sso_verify_id_token(
        self, sso: SSOConfig, id_token: str
    ) -> OAuthUserDetail | OAuthErrorResponse:
        jwks_url = (
            f"https://login.microsoftonline.com/{sso.tenant_id}/discovery/v2.0/keys"
        )
        issuer = f"https://login.microsoftonline.com/{sso.tenant_id}/v2.0"
        jwks_client = self.get_client(jwks_url)
        EXPECTED_AUDIENCE = [sso.client_id]
        try:
            signing_key = jwks_client.get_signing_key_from_jwt(id_token)

            data: dict[str, str] = jwt.decode(
                id_token,
                signing_key.key,
                algorithms=["RS256"],
                audience=EXPECTED_AUDIENCE,
                issuer=issuer,
            )
            email = (
                data.get("email")
                or data.get("preferred_username")
                or data.get("upn")
                or ""
            )

            return OAuthUserDetail(
                sub=data.get("oid"),
                name=data.get("name"),
                email=email,
                email_verified=True,
                picture=data.get("picture", ""),
                given_name=data.get("name").split(" ")[0],
                family_name=data.get("name").split(" ")[-1],
            )

        except jwt.PyJWTError as e:
            _logger.error(f"ERROR: Token validation failed:{e}", exc_info=e)
            return OAuthErrorResponse(status_code=401, detail="Invalid token")

    def get_client(self, jwks_url: str) -> PyJWKClient:
        if self.client == None:
            self.client = PyJWKClient(jwks_url)
        return self.client
