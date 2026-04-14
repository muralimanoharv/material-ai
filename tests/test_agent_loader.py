import pytest
from unittest.mock import MagicMock, patch
from material_ai import agent_loader


@pytest.fixture(autouse=True)
def reset_singleton():
    """Manually resets the singleton state before each test."""
    agent_loader._agent_loader = None
    yield


def test_get_agent_loader_uninitialized_raises_error():
    """Ensures RuntimeError is raised if accessed before init."""
    with pytest.raises(RuntimeError, match="AgentLoader has not been initialized"):
        agent_loader.get_agent_loader()


def test_init_agent_loader_success():
    """Tests successful initialization and subsequent retrieval."""
    mock_dir = "/path/to/agents"

    with patch("material_ai.agent_loader.AgentLoader") as MockLoader:
        instance = agent_loader.init_agent_loader(mock_dir)

        # Verify initialization call
        MockLoader.assert_called_once_with(mock_dir)
        assert agent_loader.get_agent_loader() == instance


def test_singleton_double_checked_locking():
    """Ensures that multiple init calls return the same instance and only call constructor once."""
    mock_dir = "/path/to/agents"

    with patch("material_ai.agent_loader.AgentLoader") as MockLoader:
        # First call
        first_instance = agent_loader.init_agent_loader(mock_dir)
        # Second call
        second_instance = agent_loader.init_agent_loader(mock_dir)

        assert first_instance is second_instance
        # Constructor should only be called once
        MockLoader.assert_called_once()


def test_init_agent_loader_thread_safety_structure():
    """Verifies that the lock is actually acquired during initialization."""
    with patch.object(agent_loader, "_lock") as mock_lock:
        with patch("material_ai.agent_loader.AgentLoader"):
            agent_loader.init_agent_loader("dir")
            # Verify the lock was used as a context manager
            assert mock_lock.__enter__.called
            assert mock_lock.__exit__.called


def test_get_agent_loader_returns_correct_instance():
    """Confirms get_agent_loader returns the same object created by init."""
    mock_instance = MagicMock()
    agent_loader._agent_loader = mock_instance

    assert agent_loader.get_agent_loader() is mock_instance
