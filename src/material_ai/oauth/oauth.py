import threading
from .interface import IOAuthService
from .google_oauth import GoogleOAuthService
from .azure_oauth import AzureOAuthService
from .schema import IssuerType, SSOConfig

_lock = threading.Lock()
_oauth_instance: IOAuthService | None = None


def get_oauth(sso: SSOConfig) -> IOAuthService:
    global _oauth_instance
    with _lock:
        if _oauth_instance is None:
            match sso.issuer:
                case IssuerType.GOOGLE:
                    _oauth_instance = GoogleOAuthService()
                case IssuerType.AZURE:
                    _oauth_instance = AzureOAuthService()
                case _:
                    raise ValueError(f"Unknown issuer type: {sso.issuer}")
        return _oauth_instance
