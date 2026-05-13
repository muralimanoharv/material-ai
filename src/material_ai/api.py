import os
import logging
from typing import Optional
import psutil
from pathlib import Path
from material_ai.agent_loader import get_agent_loader
from .app import get_endpoint_function
from google.adk.cli.adk_web_server import Session
from google.adk.agents import LlmAgent, BaseAgent
from datetime import datetime, timezone
from fastapi import APIRouter, Header, Response, Request, Cookie, status, Depends, Query
from fastapi.responses import FileResponse, RedirectResponse
from .exec import UnauthorizedException
from .request import FeedbackRequest, Microfrontend, UIBug
from .app import STATIC_DIR
from . import __version__, __app_name__
import json
from .config import get_config
from .auth import (
    remove_token,
    get_redirection_url,
    get_user_details,
    on_callback,
    verify_user_details,
    get_oauth_service,
    get_ui_configuration,
    get_feedback_handler,
    get_mirco_frontend,
)
from .auth import IOAuthService, FeedbackHandler, get_user
from .oauth import OAuthUserDetail
from .response import UserSuccessResponse, HealthResponse, History, HistoryResponse
from .response import Agent, AgentResponse, List, Tool
from .ui_config import UIConfig, UIConfigManager

_logger = logging.getLogger(__name__)
router = APIRouter()
START_TIME = datetime.now(timezone.utc)


@router.get(
    "/",
    summary="Serve Frontend Application",
    description="Serves the main index.html file, which is the entry point for the web UI.",
    responses={
        200: {
            "description": "The main HTML page of the application.",
        }
    },
)
def root(request: Request):
    if "session_initialized" not in request.session:
        request.session["session_initialized"] = True
    return FileResponse(
        path=os.path.join(STATIC_DIR, "index.html"), media_type="text/html"
    )


@router.post(
    "/feedback",
    summary="Submit User Feedback",
    description="Receives and logs feedback sent from the user interface.",
    status_code=status.HTTP_200_OK,
)
async def feedback(
    feedback: FeedbackRequest,
    feedback_handler: FeedbackHandler = Depends(get_feedback_handler),
):
    _logger.info(f"INFO: SUCCESS: Feedback received from UI {feedback}")
    response = await feedback_handler(feedback)
    return response


@router.get(
    "/logout",
    summary="Log Out User and Invalidate Session",
    description="Revokes the user's refresh token with the provider and clears session cookies from the browser.",
    status_code=status.HTTP_200_OK,
    tags=["oauth"],
    responses={
        200: {
            "description": "Logout successful. Response includes headers to clear authentication cookies.",
        }
    },
)
async def logout(
    refresh_token: str | None = Cookie(None),
    access_token: str | None = Cookie(None),
    oauth_service: IOAuthService = Depends(get_oauth_service),
):
    """
    Terminates the user's session.
    """
    # Here we logout the user and remove cookies
    response = Response(status_code=200)
    await remove_token(response, refresh_token, oauth_service, access_token)
    return response


@router.get(
    "/login",
    summary="Initiate OAuth 2.0 Login Flow",
    description="Redirects the user to the OAuth provider's authorization page and sets a CSRF token.",
    tags=["oauth"],
    responses={
        307: {
            "description": "Redirects to the OAuth provider. The 'Location' header contains the authorization URL."
        }
    },
)
async def login(
    request: Request,
    oauth_service: IOAuthService = Depends(get_oauth_service),
    redirect: str | None = Query(default=None),
):
    """
    Redirects the user to OAuth 2.0 server for authentication.
    """
    # Generate a secure state token
    state, redirect_url = get_redirection_url(oauth_service)
    request.session["oauth_state"] = state
    if redirect:
        request.session["redirect"] = redirect
    _logger.debug(
        f"DEBUG: Redirecting to OAuth provider with oauth_state token with value: {state}, redirect: {redirect}"
    )
    return RedirectResponse(url=redirect_url)


@router.get(
    "/user",
    summary="Get Authenticated User's Details",
    description="Retrieves user info from a cache cookie or refreshes it using a refresh token cookie.",
    response_model=UserSuccessResponse,
    tags=["oauth"],
    responses={
        401: {"description": "Unauthorized. The refresh_token cookie is missing."},
    },
)
async def user(
    response: Response,
    user_details: str | None = Cookie(
        None, description="Cached user details as a JSON string."
    ),
    refresh_token: str | None = Cookie(
        None, description="Required refresh token for authentication."
    ),
    oauth_service: IOAuthService = Depends(get_oauth_service),
):
    """
    Handles user detail retrieval based on session cookies.
    """
    if not refresh_token:
        raise UnauthorizedException()

    if user_details is not None:
        verified_user_details = verify_user_details(user_details)
        if verified_user_details is None:
            raise UnauthorizedException()
        return UserSuccessResponse(
            user_response=OAuthUserDetail(**json.loads(verified_user_details))
        )

    return await get_user_details(response, refresh_token, oauth_service)


@router.get(
    "/auth",
    summary="Handle OAuth 2.0 Provider Callback",
    description="Validates the state and exchanges the authorization code for an access token.",
    tags=["oauth"],
    responses={
        302: {
            "description": "Successful Authentication. The user is redirected to the frontend application with a session cookie."
        },
        403: {
            "description": "CSRF Detected. The 'state' parameter is invalid or missing."
        },
    },
)
async def callback(
    request: Request,
    code: str = Query(default=None),
    state: str = Query(default=None),
    error: str = Query(default=None),
    error_description: str = Query(default=None),
    oauth_service: IOAuthService = Depends(get_oauth_service),
):
    """
    Handles the callback from OAuth2.0 after user authentication.
    """
    if error:
        return {
            "error": error,
            "error_description": error_description,
        }
    stored_state = request.session.get("oauth_state")
    redirect = request.session.get("redirect")
    if not stored_state or stored_state != state:
        _logger.error(
            f"ERROR: Session missmatch stored state: {stored_state}, not same as state: {state}"
        )
        return Response(status_code=403)
    return await on_callback(code, oauth_service, redirect)


@router.get(
    "/api/health",
    summary="Get service health and system information",
    response_model=HealthResponse,
    tags=["Monitoring"],
)
async def health_check():
    """
    Provides a detailed health status of the service, including uptime and
    current system resource utilization (CPU, Memory, Disk).
    """
    config = get_config()
    # 1. Calculate Uptime
    uptime_delta = datetime.now(timezone.utc) - START_TIME

    # 2. Get System Metrics using psutil
    memory_info = psutil.virtual_memory()
    disk_info = psutil.disk_usage("/")

    system_data = {
        "cpu_percent_used": psutil.cpu_percent(),
        "memory": {
            "total": f"{memory_info.total / (1024**3):.2f} GB",
            "available": f"{memory_info.available / (1024**3):.2f} GB",
            "percent_used": memory_info.percent,
        },
        "disk": {
            "total": f"{disk_info.total / (1024**3):.2f} GB",
            "used": f"{disk_info.used / (1024**3):.2f} GB",
            "free": f"{disk_info.free / (1024**3):.2f} GB",
            "percent_used": disk_info.percent,
        },
    }

    return HealthResponse(
        status="ok",
        uptime=str(uptime_delta),
        system=system_data,
        debug=config.general.debug,
        appName=__app_name__,
        version=__version__,
    )


@router.get(
    "/config",
    summary="Get ui config information",
    response_model=UIConfig,
    tags=["Configuration"],
)
async def config(
    accept_language: Optional[str] = Header("en", alias="Accept-Language"),
    ui_configuration: UIConfigManager = Depends(get_ui_configuration),
):
    return ui_configuration.get_ui_config(language_code=accept_language)


@router.get(
    "/apps/{app_name}/history",
    summary="Get session history",
    response_model=HistoryResponse,
)
async def history(app_name: str, user: OAuthUserDetail = Depends(get_user)):
    list_sessions = get_endpoint_function("list_sessions")
    get_session = get_endpoint_function("get_session")

    def get_title(session_instance: Session) -> str:
        try:
            text_content = session_instance.events[0].content.parts[0].text
            return text_content
        except (IndexError, AttributeError):
            return "..."

    sessions: list[Session] = await list_sessions(app_name, user.sub)
    sessions.sort(key=lambda s: s.last_update_time, reverse=True)
    history = []
    for session in sessions:
        session_instance: Session = await get_session(app_name, user.sub, session.id)
        history.append(
            History(
                id=session.id,
                title=get_title(session_instance),
                last_update_time=session.last_update_time * 1000,
                app_name=session.app_name,
            )
        )

    return HistoryResponse(history=history)


def get_agent(agent: BaseAgent) -> Agent:
    def format_agent_name(name: str):
        """
        Converts snake_case (greeting_agent) to Title Case (Greeting Agent).
        """
        if not name:
            return ""
        return name.replace("_", " ").title()

    model = ""
    if isinstance(agent, LlmAgent):
        model = agent.model
    tools: List[Tool] = []
    sub_agents: List[Agent] = []
    if hasattr(agent, "tools") and agent.tools:
        for tool in agent.tools:
            if callable(tool):
                tools.append(
                    Tool(name=tool.__name__, description=tool.__doc__, type="tool")
                )
            else:
                tool_name = getattr(tool, "name", str(tool))
                tool_desc = getattr(tool, "description", str(tool))
                tools.append(Tool(name=tool_name, description=tool_desc, type="tool"))
    if hasattr(agent, "sub_agents") and agent.sub_agents:
        for sub_agent in agent.sub_agents:
            sub_agents.append(get_agent(sub_agent))

    return Agent(
        id=agent.name,
        type="agent",
        model=model,
        name=format_agent_name(agent.name),
        description=agent.description,
        status="active",
        tools=tools,
        sub_agents=sub_agents,
    )


@router.get(
    "/agents",
    summary="Get list of active agents",
)
async def agents():
    agent_loader = get_agent_loader()
    if not agent_loader:
        return []
    agents: List[Agent] = []

    for agent in agent_loader.list_agents():
        base_agent = agent_loader.load_agent(agent)
        agents.append(get_agent(base_agent))

    return AgentResponse(agents=agents)


@router.get(
    "/apps/{app_name}/ui",
)
async def get_agent_ui(app_name: str):
    agent_loader = get_agent_loader()
    if not agent_loader:
        return Response(status_code=404, content="Agent directory not found")

    for agent in agent_loader.list_agents():
        if agent == app_name:
            AGENT_UI_PATH = f"{agent_loader.agents_dir}/{app_name}/ui/dist"
            if not os.path.exists(f"{AGENT_UI_PATH}/index.js"):
                return Response(status_code=404, content="Agent ui not found")

            return FileResponse(
                path=os.path.join(AGENT_UI_PATH, "index.js"),
                media_type="application/javascript",
            )

    return Response(status_code=404, content="Agent ui not found")


@router.get(
    "/apps/{app_name}/readme",
)
async def get_agent_readme(
    app_name: str,
    language: str = Query(
        default="en",
        description="The language code for the readme (e.g., 'en', 'ja', 'hi')",
    ),
):
    agent_loader = get_agent_loader()
    if not agent_loader:
        return Response(status_code=404, content="Agent directory not found")

    for agent in agent_loader.list_agents():
        if agent == app_name:
            AGENT_UI_PATH = f"{agent_loader.agents_dir}/{app_name}"
            if os.path.exists(f"{AGENT_UI_PATH}/README_{language}.md"):
                return FileResponse(
                    path=os.path.join(AGENT_UI_PATH, f"README_{language}.md"),
                    media_type="text/markdown",
                )

            if not os.path.exists(f"{AGENT_UI_PATH}/README.md"):
                return Response(status_code=404, content="Agent readme not found")

            return FileResponse(
                path=os.path.join(AGENT_UI_PATH, "README.md"),
                media_type="text/markdown",
            )

    return Response(status_code=404, content=f"Agent readme not found")


@router.get("/micro_frontend/{ui}")
async def get_ui(ui: str, micro_frontend: Microfrontend = Depends(get_mirco_frontend)):
    file_path_str: str | None = getattr(micro_frontend, ui, None)

    if not file_path_str:
        return Response(
            status_code=404,
            content=f"UI component '{ui}' not configured in microfrontend",
        )

    file_path = Path(file_path_str).resolve()

    if not file_path.is_file():
        return Response(
            status_code=404,
            content=f"JavaScript file for '{ui}' not found at {file_path_str}",
        )

    return FileResponse(path=file_path, media_type="application/javascript")


@router.post("/ui_render_bug")
async def ui_render_bug(bug: UIBug):
    _logger.error(f"UIRenderError: {bug.model_dump_json()}")
    return Response(status_code=200)
