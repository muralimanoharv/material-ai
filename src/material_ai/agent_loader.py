import threading
from google.adk.cli.fast_api import AgentLoader

# Private globals
_agent_loader: AgentLoader | None = None
_lock = threading.Lock()


def get_agent_loader() -> AgentLoader:
    """Returns the existing loader. Raises an error if not initialized."""
    if _agent_loader is None:
        raise RuntimeError(
            "AgentLoader has not been initialized. Call init_agent_loader first."
        )
    return _agent_loader


def init_agent_loader(agent_dir: str) -> AgentLoader:
    """
    Thread-safe initialization of the AgentLoader singleton.
    Once called, the object is preserved for all threads.
    """
    global _agent_loader

    # "Double-checked locking" pattern for performance
    if _agent_loader is None:
        with _lock:
            # Check again inside the lock to be sure another thread didn't beat us
            if _agent_loader is None:
                _agent_loader = AgentLoader(agent_dir)

    return _agent_loader
