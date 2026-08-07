import logging
from typing import Optional
from material_ai.oauth.interface import IOAuthService
from material_ai.oauth.schema import (
    OAuthRedirectionResponse,
    OAuthSuccessResponse,
    OAuthErrorResponse,
    SSOConfig,
    OAuthUserDetail,
)
from material_ai.app import get_app

_logger = logging.getLogger(__name__)

MOCK_USER = OAuthUserDetail(
    sub="mock_user_id",
    name="Mock User",
    given_name="Mock",
    family_name="User",
    picture="https://placehold.co/96x96",
    email="mockuser@example.com",
    email_verified=True,
    language="en",
)


class MockOAuthService(IOAuthService):
    """
    Mock OAuth Service that bypasses external SSO providers during local/CI testing.
    """

    def sso_get_redirection_url(self, sso: SSOConfig) -> OAuthRedirectionResponse:
        _logger.debug("MockOAuthService: Generating redirection url")
        return OAuthRedirectionResponse(
            redirection_url=f"{sso.redirect_uri}?code=mock_code&state=mock_state",
            state="mock_state",
        )

    async def sso_get_access_token(
        self, sso: SSOConfig, authorization_code: str
    ) -> OAuthSuccessResponse | OAuthErrorResponse:
        _logger.debug("MockOAuthService: Exchanging authorization code")
        return OAuthSuccessResponse(
            access_token="mock_access_token",
            refresh_token="mock_refresh_token",
            id_token="mock_id_token",
            user_detail=MOCK_USER,
            expires_in=3600,
        )

    async def sso_get_new_access_token(
        self, sso: SSOConfig, refresh_token: str
    ) -> OAuthSuccessResponse | OAuthErrorResponse:
        _logger.debug("MockOAuthService: Getting new access token")
        return OAuthSuccessResponse(
            access_token="mock_access_token",
            refresh_token="mock_refresh_token",
            id_token="mock_id_token",
            user_detail=MOCK_USER,
            expires_in=3600,
        )

    async def sso_get_user_details(
        self, sso: SSOConfig, access_token: str
    ) -> OAuthUserDetail | OAuthErrorResponse:
        _logger.debug("MockOAuthService: Retrieving user details")
        return MOCK_USER

    async def sso_revoke_refresh_token(
        self, refresh_token: str, access_token: str
    ) -> None | OAuthErrorResponse:
        _logger.debug("MockOAuthService: Revoking tokens")
        return None

    async def sso_verify_id_token(
        self, sso: SSOConfig, id_token: str
    ) -> OAuthUserDetail | OAuthErrorResponse:
        _logger.debug("MockOAuthService: Verifying id token")
        return MOCK_USER


def get_test_app():
    """
    Factory function for launching the FastAPI app with the mock auth service during testing.
    """
    return get_app(oauth_service=MockOAuthService())
