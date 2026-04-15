import pytest
import yaml
from unittest.mock import patch, mock_open
from material_ai import ui_config_yaml as ucy


@pytest.fixture(autouse=True)
def reset_globals():
    """Resets the global state before every test case."""
    ucy._yaml_instance = None
    ucy._tried_loading = False
    yield


def test_get_ui_config_yaml_none_input():
    """Verifies that passing None marks loading as tried and returns None."""
    result = ucy.get_ui_config_yaml(None)
    assert result is None
    assert ucy._tried_loading is True


def test_get_ui_config_yaml_file_not_found():
    """Tests behavior when the provided path is not a valid file."""
    with patch("pathlib.Path.is_file", return_value=False):
        result = ucy.get_ui_config_yaml("non_existent.yaml")
        assert result is None
        assert ucy._tried_loading is True


def test_get_ui_config_yaml_success():
    """Tests successful loading and parsing of a YAML file."""
    mock_data = {"title": "Gemini", "theme": "dark"}
    yaml_content = yaml.dump(mock_data)

    with patch("pathlib.Path.is_file", return_value=True):
        with patch("builtins.open", mock_open(read_data=yaml_content)):
            result = ucy.get_ui_config_yaml("config.yaml")
            assert result == mock_data
            assert ucy._tried_loading is True


def test_get_ui_config_yaml_exception_handling():
    """Tests that exceptions during file reading return None and don't crash."""
    with patch("pathlib.Path.is_file", return_value=True):
        with patch("builtins.open", side_effect=Exception("Read Error")):
            result = ucy.get_ui_config_yaml("corrupt.yaml")
            assert result is None
            assert ucy._tried_loading is True


def test_singleton_behavior():
    """Ensures the file is only read once even if called multiple times."""
    mock_data = {"key": "value"}
    with patch("pathlib.Path.is_file", return_value=True):
        with patch(
            "builtins.open", mock_open(read_data=yaml.dump(mock_data))
        ) as mocked_file:
            # First call
            first_result = ucy.get_ui_config_yaml("config.yaml")
            # Second call
            second_result = ucy.get_ui_config_yaml("config.yaml")

            assert first_result == second_result == mock_data
            # open should only be called once due to _tried_loading flag
            mocked_file.assert_called_once()


def test_thread_safety_structure():
    """Checks if the lock is utilized during the first load."""
    with patch.object(ucy, "_lock") as mock_lock:
        ucy.get_ui_config_yaml(None)
        assert mock_lock.__enter__.called
