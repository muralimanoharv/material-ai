import pytest
from unittest.mock import MagicMock, patch
from material_ai.ui_config import UIConfigManager, DEFAULT_CONFIG


@pytest.fixture
def mock_agent_loader():
    with patch("material_ai.ui_config.get_agent_loader") as mock:
        loader = MagicMock()
        loader.list_agents.return_value = ["agent_1"]
        mock.return_value = loader
        yield loader


def test_get_ui_config_with_partial_overrides(mock_agent_loader):
    """
    Test that providing only a partial 'pages' config doesn't
    break validation by ensuring the manager merges with defaults.
    """
    # This partial dict usually triggers your ValidationError
    partial_yaml = {
        "pages": {
            "loginPage": {
                "title": {"en": "Custom Login", "ja": "ログイン"},
                "subTitle": {"en": "Welcome", "ja": "ようこそ"},
            },
            # We are missing agentsPage, agentInfoPage, and chatPage here!
        }
    }

    manager = UIConfigManager(partial_yaml)

    # To make this "working", your UIConfigManager.get_ui_config logic
    # should look like the deep_update logic I mentioned previously.
    # If you haven't updated the code yet, you must provide ALL fields
    # in the test dict to pass validation:

    full_pages_mock = DEFAULT_CONFIG.pages.model_dump()
    full_pages_mock["loginPage"]["title"] = {"en": "Custom Login"}

    complete_yaml = {
        "pages": full_pages_mock,
        "agents": {"agent_1": {"title": "Agent Title"}},
    }

    manager.yaml = complete_yaml
    config = manager.get_ui_config(language_code="en")

    assert config.pages.loginPage.title == "Custom Login"
    assert (
        config.pages.chatPage.negativeFeedbackTitle
        == DEFAULT_CONFIG.pages.chatPage.negativeFeedbackTitle
    )
