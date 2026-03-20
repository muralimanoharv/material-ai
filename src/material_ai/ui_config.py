import pydantic
import threading
import logging
import pathlib
import yaml
from typing import List, Optional, Dict, Any
from .theme import ThemeConfig


class Feedback(pydantic.BaseModel):
    value: str
    categories: Optional[List[str]]


class FeedbackInfo(pydantic.BaseModel):
    positive: Feedback
    negative: Feedback


class AgentInfo(pydantic.BaseModel):
    title: str
    greeting: str
    show_footer: bool
    chat_section_width: str
    feedback: FeedbackInfo


class UIConfig(pydantic.BaseModel):
    """Defines the structured response for the config endpoint."""

    title: str
    greeting: str
    errorMessage: str
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
_config_instance: UIConfig | None = None
_lock = threading.Lock()
_logger = logging.getLogger(__name__)


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


def get_ui_config(ui_config_yaml, agents: list[str]) -> UIConfig:
    global _config_instance
    with _lock:
        if _config_instance is None:
            if ui_config_yaml is None:
                _config_instance = get_default_ui_config(agents)
                return _config_instance
            config_path = pathlib.Path(ui_config_yaml)
            if not config_path.exists() or not config_path.is_file():
                msg = f"WARNING: Config file not found at {config_path}"
                _logger.warning(msg)
                _config_instance = get_default_ui_config(agents)
                return _config_instance
            try:
                with open(config_path, "r") as file:

                    loaded_config: Dict[str, Any] = yaml.safe_load(file)
                    agents_map: Dict[str, AgentInfo] = {}

                    for agent in agents:
                        agent_config = loaded_config.get("agents", {}).get(agent, {})
                        agents_map[agent] = AgentInfo(
                            title=agent_config.get("title", DEFAULT_CONFIG.title),
                            greeting=agent_config.get(
                                "greeting", DEFAULT_CONFIG.greeting
                            ),
                            show_footer=agent_config.get("show_footer", True),
                            chat_section_width=agent_config.get(
                                "chat_section_width", "760px"
                            ),
                            feedback=agent_config.get("feedback", DEFAULT_FEEDBACK),
                        )

                    _config_instance = UIConfig(
                        title=loaded_config.get("title", DEFAULT_CONFIG.title),
                        greeting=loaded_config.get("greeting", DEFAULT_CONFIG.greeting),
                        errorMessage=loaded_config.get(
                            "errorMessage", DEFAULT_CONFIG.errorMessage
                        ),
                        theme=loaded_config.get("theme", DEFAULT_CONFIG.theme),
                        agents=agents_map,
                    )
            except Exception as e:
                msg = f"WARNING: Error loading ui configuration: {e}"
                _logger.warning(msg, exc_info=e)
                _config_instance = DEFAULT_CONFIG
    return _config_instance
