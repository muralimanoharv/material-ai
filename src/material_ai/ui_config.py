import pydantic
from typing import List, Optional, Dict, Any
from material_ai.agent_loader import get_agent_loader
from material_ai.ui_config_yaml import get_ui_config_yaml
from .theme import ThemeConfig


class Feedback(pydantic.BaseModel):
    value: str
    categories: Optional[List[str]]


class Language(pydantic.BaseModel):
    code: str
    label: str


class FeedbackInfo(pydantic.BaseModel):
    positive: Feedback
    negative: Feedback


class AgentInfo(pydantic.BaseModel):
    title: str
    greeting: str
    show_footer: bool
    chat_section_width: str
    feedback: FeedbackInfo


class Buttons(pydantic.BaseModel):
    stopResponse: str
    copyPrompt: str
    editPrompt: str
    thumbsUp: str
    thumbsDown: str
    redo: str
    share: str
    copyResponse: str
    addFiles: str
    selectAgent: str
    submit: str
    executeNext: str
    blueprint: str
    trace: str
    showThinking: str
    agentTrace: str
    reset: str
    reCenter: str
    uploadFile: str
    newChat: str
    signIn: str
    settingsAndHelp: str
    theme: str
    lightTheme: str
    darkTheme: str
    systemTheme: str
    health: str
    agents: str
    signOut: str
    backToRegistry: str
    interactWithAgent: str
    deployToGeminiEnterprize: str
    deployToAgentEngine: str
    deployToAgentCatalog: str


class UploadFileMenu(pydantic.BaseModel):
    logOutTitle: str
    title: str


class AgentsMenu(pydantic.BaseModel):
    title: str
    placeholder: str
    logOutTitle: str


class Drawer(pydantic.BaseModel):
    logOutTitle: str
    logOutSubTitle: str


class Footer(pydantic.BaseModel):
    title: str


class PromptInput(pydantic.BaseModel):
    placeholder: str
    logOutPlaceholder: str


class AgentTrace(pydantic.BaseModel):
    blueprintTitle: str
    traceTitle: str
    systemEventLog: str
    initiatedFuncCall: str
    receivedFuncResp: str
    event: str
    arguments: str
    executionResponse: str
    agentCore: str
    awaitingPackets: str


class LoginPage(pydantic.BaseModel):
    title: str
    subTitle: str


class AgentsPage(pydantic.BaseModel):
    title: str
    subTitle: str
    countText: str
    placeholder: str
    agentIdentityCol: str
    agentDescriptionCol: str
    agentModelCol: str
    agentStatusCol: str


class AgentInfoPage(pydantic.BaseModel):
    agentOperations: str
    documentation: str
    trace: str


class ChatPage(pydantic.BaseModel):
    negativeFeedbackTitle: str
    negativeFeedbackSubtitle: str
    other: str
    feedback: str
    placeholder: str


class Pages(pydantic.BaseModel):
    loginPage: LoginPage
    agentsPage: AgentsPage
    agentInfoPage: AgentInfoPage
    chatPage: ChatPage


class UIConfig(pydantic.BaseModel):
    """Defines the structured response for the config endpoint."""

    title: str
    greeting: str
    errorMessage: str
    stopResponse: str
    promptCopyMessage: str
    responseCopyMessage: str
    feedbackSuccessMessage: str
    feedbackNegativeMessage: str
    buttons: Buttons
    uploadFileMenu: UploadFileMenu
    drawer: Drawer
    footer: Footer
    promptInput: PromptInput
    agentsMenu: AgentsMenu
    agentTrace: AgentTrace
    languages: List[Language]
    pages: Pages
    agents: Dict[str, AgentInfo]
    theme: ThemeConfig


DEFAULT_FEEDBACK = FeedbackInfo(
    positive={"value": "GOOD", "categories": []},
    negative={
        "value": "BAD",
        "categories": [
            "Not / poorly personalized",
            "Problem with saving information",
            "Not factually correct",
            "Didn't follow instructions",
            "Offensive / Unsafe",
            "Wrong language",
        ],
    },
)


DEFAULT_CONFIG = UIConfig(
    title="Gemini",
    greeting="What should we do today?",
    errorMessage="Some error has occured, Please try again later",
    stopResponse="You stopped this response",
    promptCopyMessage="Prompt copied",
    responseCopyMessage="Copied to clipboard",
    feedbackSuccessMessage="Thank you! Your feedback helps make Agent better for everyone",
    feedbackNegativeMessage="Thank you for helping improve Agent",
    buttons={
        "stopResponse": "Stop Response",
        "copyPrompt": "Copy prompt",
        "editPrompt": "Edit prompt",
        "thumbsUp": "Good response",
        "thumbsDown": "Bad response",
        "redo": "Redo",
        "share": "Share & export",
        "copyResponse": "Copy response",
        "addFiles": "Add files",
        "selectAgent": "Select Agent",
        "submit": "Submit",
        "executeNext": "Execute Next",
        "blueprint": "Blueprint",
        "trace": "Trace",
        "showThinking": "Show Thinking",
        "agentTrace": "Agent Trace",
        "reset": "Reset",
        "reCenter": "Recenter",
        "uploadFile": "Upload File",
        "newChat": "New Chat",
        "signIn": "Sign In",
        "signOut": "Sign out",
        "settingsAndHelp": "Settings & Help",
        "theme": "Theme",
        "lightTheme": "Light",
        "darkTheme": "Dark",
        "systemTheme": "System",
        "health": "Health",
        "agents": "Agents",
        "backToRegistry": "Back to Registry",
        "interactWithAgent": "Interact with Agent",
        "deployToGeminiEnterprize": "Deploy to Gemini Enterprize (Coming Soon)",
        "deployToAgentEngine": "Deploy to Agent Engine (Coming Soon)",
        "deployToAgentCatalog": "Deploy to Agent Catalog (Coming Soon)",
    },
    uploadFileMenu={
        "logOutTitle": "Sign in to upload files",
        "title": "Upload Files",
    },
    agentsMenu={
        "title": "Choose your agent",
        "placeholder": "Search agents...",
        "logOutTitle": "Sign in to select agents",
    },
    drawer={
        "logOutTitle": "Sign in to start saving your chats",
        "logOutSubTitle": "Once you're signed in, you can access your recent chats here.",
    },
    footer={"title": "Gemini can make mistakes, so double-check it"},
    promptInput={
        "logOutPlaceholder": "Sign in to ask Gemini",
        "placeholder": "Ask Gemini",
    },
    agentTrace={
        "blueprintTitle": "Blueprint",
        "traceTitle": "Trace",
        "systemEventLog": "System Event Log",
        "initiatedFuncCall": "Initiated Function Call",
        "receivedFuncResp": "Received Function Response",
        "event": "Event",
        "arguments": "Arguments",
        "executionResponse": "Execution Response",
        "agentCore": "Agent Core",
        "awaitingPackets": "Awaiting execution packets...",
    },
    pages={
        "chatPage": {
            "other": "Other",
            "feedback": "Feedback",
            "placeholder": "Provide additional feedback",
            "negativeFeedbackTitle": "What went wrong?",
            "negativeFeedbackSubtitle": "Your feedback helps make Agent better for everyone.",
        },
        "loginPage": {"title": "Meet Gemini", "subTitle": "your personal AI assistant"},
        "agentInfoPage": {
            "agentOperations": "Agent Operations",
            "documentation": "Documentation",
            "trace": "Trace",
        },
        "agentsPage": {
            "title": "Agent Catalog",
            "subTitle": "Agent Registry Dashboard",
            "countText": "Agents",
            "placeholder": "Search registry by identity, description, or model engine...",
            "agentIdentityCol": "Agent Identity",
            "agentDescriptionCol": "Description",
            "agentModelCol": "Model",
            "agentStatusCol": "Status",
        },
    },
    languages=[
        {"code": "en", "label": "English"},
    ],
    agents={},
    theme={
        "lightPalette": {
            "mode": "light",
            "primary": {
                "main": "#1a73e8",
            },
            "background": {
                "default": "#ffffff",
                "paper": "#f0f4f9",
                "card": "#f0f4f9",
                "cardHover": "#dde3ea",
                "history": "#d3e3fd",
            },
            "text": {
                "primary": "#07080aff",
                "secondary": "#1b1c1d",
                "tertiary": "#575b5f",
                "h5": "#1f1f1f",
                "selected": "#0842a0",
                "tagline": "#9a9b9c",
            },
            "tooltip": {
                "background": "#1b1c1d",
                "text": "#e8eaed",
            },
        },
        "darkPalette": {
            "mode": "dark",
            "primary": {
                "main": "#8ab4f8",
            },
            "background": {
                "default": "#1b1c1d",
                "paper": "#333537",
                "card": "#282a2c",
                "cardHover": "#3d3f42",
                "history": "#1f3760",
            },
            "text": {
                "primary": "#fff",
                "secondary": "#9aa0a6",
                "tertiary": "#a2a9b0",
                "h5": "#e3e3e3",
                "selected": "#d3e3fd",
                "tagline": "#747775",
            },
            "tooltip": {
                "background": "#fff",
                "text": "#1b1c1d",
            },
        },
    },
)


def get_default_ui_config(agents: list[str]):
    default_config = DEFAULT_CONFIG.model_copy()
    agents_map: Dict[str, AgentInfo] = {}
    for agent in agents:
        agents_map[agent] = AgentInfo(
            title=default_config.title,
            greeting=default_config.greeting,
            show_footer=True,
            chat_section_width="760px",
            feedback=DEFAULT_FEEDBACK,
        )
    default_config.agents = agents_map
    return default_config


class UIConfigManager:
    def __init__(self, yaml: Dict[str, Any]):
        self.yaml = yaml

    def get_ui_config(self, language_code: str, default_lang="en") -> UIConfig:

        def resolve_i18n(data) -> Dict[str, Any]:
            # Case 1: If it's a dictionary, it might be an i18n object or a nested config section
            if isinstance(data, dict):
                # Check if this specific dict looks like an i18n object (e.g., has 'en' or 'ja')
                # We check if the requested language_code is a key here
                if language_code in data and data[language_code] is not None:
                    return data[language_code]

                # Fallback: if language_code not found, try the default language (en)
                if default_lang in data:
                    return data[default_lang]

                # If it's not an i18n object but a nested section, recurse into its children
                return {k: resolve_i18n(v) for k, v in data.items()}

            # Case 2: If it's a list, recurse into elements
            elif isinstance(data, list):
                return [resolve_i18n(item) for item in data]

            # Case 3: It's a primitive (string, int, etc.), return as is
            return data

        agents = get_agent_loader().list_agents()
        formatted_config: Dict[str, Any] = resolve_i18n(self.yaml)
        if not formatted_config:
            return get_default_ui_config(agents=agents)

        agents_map: Dict[str, AgentInfo] = {}

        for agent in agents:
            agent_config = formatted_config.get("agents", {}).get(agent, {})
            agents_map[agent] = AgentInfo(
                title=agent_config.get("title", ""),
                greeting=agent_config.get(
                    "greeting",
                    formatted_config.get("greeting", DEFAULT_CONFIG.greeting),
                ),
                show_footer=agent_config.get("show_footer", True),
                chat_section_width=agent_config.get("chat_section_width", "760px"),
                feedback=agent_config.get("feedback", DEFAULT_FEEDBACK),
            )

        return UIConfig(
            title=formatted_config.get("title", DEFAULT_CONFIG.title),
            greeting=formatted_config.get("greeting", DEFAULT_CONFIG.greeting),
            errorMessage=formatted_config.get(
                "errorMessage", DEFAULT_CONFIG.errorMessage
            ),
            stopResponse=formatted_config.get(
                "stopResponse", DEFAULT_CONFIG.stopResponse
            ),
            promptCopyMessage=formatted_config.get(
                "promptCopyMessage", DEFAULT_CONFIG.promptCopyMessage
            ),
            responseCopyMessage=formatted_config.get(
                "responseCopyMessage", DEFAULT_CONFIG.responseCopyMessage
            ),
            feedbackSuccessMessage=formatted_config.get(
                "feedbackSuccessMessage", DEFAULT_CONFIG.feedbackSuccessMessage
            ),
            feedbackNegativeMessage=formatted_config.get(
                "feedbackNegativeMessage", DEFAULT_CONFIG.feedbackNegativeMessage
            ),
            buttons=formatted_config.get("buttons", DEFAULT_CONFIG.buttons),
            uploadFileMenu=formatted_config.get(
                "uploadFileMenu", DEFAULT_CONFIG.uploadFileMenu
            ),
            agentsMenu=formatted_config.get("agentsMenu", DEFAULT_CONFIG.agentsMenu),
            drawer=formatted_config.get("drawer", DEFAULT_CONFIG.drawer),
            footer=formatted_config.get("footer", DEFAULT_CONFIG.footer),
            promptInput=formatted_config.get("promptInput", DEFAULT_CONFIG.promptInput),
            agentTrace=formatted_config.get("agentTrace", DEFAULT_CONFIG.agentTrace),
            pages=formatted_config.get("pages", DEFAULT_CONFIG.pages),
            languages=formatted_config.get("languages", DEFAULT_CONFIG.languages),
            theme=formatted_config.get("theme", DEFAULT_CONFIG.theme),
            agents=agents_map,
        )


def get_ui_config(ui_config_yaml: str) -> UIConfigManager:
    return UIConfigManager(yaml=get_ui_config_yaml(ui_config_yaml))
