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


class GoogleOAuthService(IOAuthService):

    def __init__(self):
        self.client = None

    def sso_get_redirection_url(self, sso: SSOConfig) -> OAuthRedirectionResponse:
        state = secrets.token_urlsafe(16)

        params = {
            "response_type": "code",
            "client_id": sso.client_id,
            "redirect_uri": sso.redirect_uri,
            "scope": sso.scope,
            "state": state,
            "access_type": "offline",
            "prompt": "consent",
        }

        query_string = urllib.parse.urlencode(params)

        base_url = "https://accounts.google.com/o/oauth2/v2/auth"
        redirection_url = f"{base_url}?{query_string}"

        return OAuthRedirectionResponse(redirection_url=redirection_url, state=state)

    @handle_httpx_errors(url="https://oauth2.googleapis.com/token")
    async def sso_get_access_token(
        self, sso: SSOConfig, authorization_code: str
    ) -> OAuthSuccessResponse | OAuthErrorResponse:
        url = "https://oauth2.googleapis.com/token"

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
            id_token=id_token,
            user_detail=user_detail,
            expires_in=expires_in,
        )

    @handle_httpx_errors(url="https://oauth2.googleapis.com/token")
    async def sso_get_new_access_token(
        self, sso: SSOConfig, refresh_token: str
    ) -> OAuthSuccessResponse | OAuthErrorResponse:

        url = "https://oauth2.googleapis.com/token"
        token_payload = {
            "client_id": sso.client_id,
            "client_secret": sso.client_secret,
            "scope": sso.scope,
            "refresh_token": refresh_token,
            "grant_type": "refresh_token",
        }
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
        id_token = token_data.get("id_token")
        user_detail = await self.sso_get_user_details(access_token)

        if isinstance(user_detail, OAuthErrorResponse):
            return user_detail

        return OAuthSuccessResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user_detail=user_detail,
            expires_in=expires_in,
            id_token=id_token,
        )

    @handle_httpx_errors(url="https://www.googleapis.com/oauth2/v3/userinfo")
    async def sso_get_user_details(
        self, access_token: str
    ) -> OAuthUserDetail | OAuthErrorResponse:
        url = "https://www.googleapis.com/oauth2/v3/userinfo"

        headers = {"Authorization": f"Bearer {access_token}"}

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers)
            response.raise_for_status()

        user_details = response.json()
        user_detail = OAuthUserDetail(**user_details)

        return user_detail

    @handle_httpx_errors(url="https://oauth2.googleapis.com/revoke")
    async def sso_revoke_refresh_token(
        self, refresh_token: str, access_token: str
    ) -> None | OAuthErrorResponse:
        url = "https://oauth2.googleapis.com/revoke"

        params = {"token": refresh_token}

        async with httpx.AsyncClient() as client:
            response = await client.post(url, params=params)
            response.raise_for_status()

        _logger.info("INFO: Token successfully revoked.")

    async def sso_verify_id_token(
        self, sso: SSOConfig, id_token: str
    ) -> OAuthUserDetail | OAuthErrorResponse:
        jwks_url = "https://www.googleapis.com/oauth2/v3/certs"
        jwks_client = self.get_client(jwks_url)
        try:
            signing_key = jwks_client.get_signing_key_from_jwt(id_token)
            data: dict[str, str] = jwt.decode(
                id_token,
                signing_key.key,
                algorithms=["RS256"],
                audience=sso.client_id,
                issuer="https://accounts.google.com",
            )

            return OAuthUserDetail(
                sub=data.get("sub"),
                name=data.get("name"),
                email=data.get("email"),
                email_verified=data.get("email_verified", False),
                picture=data.get("picture", ""),
                given_name=data.get("given_name"),
                family_name=data.get("family_name"),
            )
        except jwt.PyJWTError as e:
            _logger.error(f"ERROR: Token validation failed:{e}", exc_info=e)
            return OAuthErrorResponse(status_code=401, detail="Invalid token")

    def get_client(self, jwks_url: str) -> PyJWKClient:
        if self.client == None:
            self.client = PyJWKClient(jwks_url)
        return self.client
