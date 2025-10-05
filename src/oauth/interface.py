from abc import ABC, abstractmethod
from .schema import OAuthRedirectionResponse, OAuthSuccessResponse, OAuthErrorResponse
from .schema import SSOConfig, OAuthUserDetail


class IOAuthService(ABC):
    """
    Abstract Base Class (Interface) defining the contract for any
    OAuth 2.0 or OpenID Connect service implementation (e.g., Google, GitHub).

    Any concrete class inheriting from IOAuthService must implement all
    abstract methods to handle the complete OAuth flow, including
    redirection, callback processing, and user detail retrieval.
    """

    @abstractmethod
    def sso_get_redirection_url(self, sso: SSOConfig) -> OAuthRedirectionResponse:
        pass

    @abstractmethod
    async def sso_get_access_token(
        self, sso: SSOConfig, authorization_code: str
    ) -> OAuthSuccessResponse | OAuthErrorResponse:
        pass

    @abstractmethod
    async def sso_get_new_access_token(
        self, sso: SSOConfig, refresh_token: str
    ) -> OAuthSuccessResponse | OAuthErrorResponse:
        pass

    @abstractmethod
    async def sso_get_user_details(
        self, sso: SSOConfig, access_token: str
    ) -> OAuthUserDetail | OAuthErrorResponse:
        pass

    @abstractmethod
    async def sso_revoke_refresh_token(
        self, refresh_token: str
    ) -> None | OAuthErrorResponse:
        pass

    @abstractmethod
    async def sso_verify_access_token(
        self, access_token: str
    ) -> bool | OAuthErrorResponse:
        pass
