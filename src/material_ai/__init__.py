__app_name__ = "material_ai"
__version__ = "1.4.4"

from .app import get_app
from .config import get_config
from .request import FeedbackRequest, Microfrontend
from .oauth import (
    IOAuthService,
    OAuthRedirectionResponse,
    OAuthUserDetail,
    OAuthSuccessResponse,
)
from .oauth import OAuthErrorResponse, SSOConfig, handle_httpx_errors
