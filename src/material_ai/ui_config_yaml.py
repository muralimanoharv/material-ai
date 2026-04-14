import threading
import logging
import pathlib
import yaml
from typing import Any, Optional

_yaml_instance: Any = None
_tried_loading: bool = False
_lock = threading.Lock()
_logger = logging.getLogger(__name__)


def get_ui_config_yaml(ui_config_yaml: Optional[str]) -> Any:
    global _yaml_instance, _tried_loading

    if _tried_loading:
        return _yaml_instance

    with _lock:
        if _tried_loading:
            return _yaml_instance

        if not ui_config_yaml:
            _tried_loading = True
            return None

        config_path = pathlib.Path(ui_config_yaml)

        if not config_path.is_file():
            _logger.warning(f"Config file not found: {config_path}")
        else:
            try:
                with open(config_path, "r", encoding="utf-8") as file:
                    _yaml_instance = yaml.safe_load(file)
            except Exception as e:
                _logger.warning(f"Error loading ui configuration: {e}", exc_info=True)

        _tried_loading = True
        return _yaml_instance
