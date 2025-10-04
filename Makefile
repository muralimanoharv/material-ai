
REACT_BUILD_CMD := npm install && npm run build

install:
	@command -v uv >/dev/null 2>&1 || { echo "uv is not installed. Installing uv..."; curl -LsSf https://astral.sh/uv/0.6.12/install.sh | sh; source $HOME/.local/bin/env; }
	uv sync --dev

.PHONY: build-ui dev prod

build-ui:
	@echo "Building UI...🚀"
	@cd material-ai-frontend && $(REACT_BUILD_CMD)
	@echo "UI build complete.✅"

run: build-ui
	uv run uvicorn --host 0.0.0.0 --port 8000 --factory src.app:get_app --reload

debug: build-ui
	uv run python -m debugpy --listen 0.0.0.0:5678 --wait-for-client -m uvicorn src.main:get_app --host 0.0.0.0 --port 8000 --reload