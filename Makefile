
REACT_BUILD_CMD := npm install && npm run build
REACT_FORMAT_CMD := npm run lint && npm run format

PACKAGE_NAME := material_ai

install:
	@command -v uv >/dev/null 2>&1 || { echo "uv is not installed. Installing uv..."; curl -LsSf https://astral.sh/uv/0.6.12/install.sh | sh; source $HOME/.local/bin/env; }
	uv sync && uv pip install -e .[dev]

format:
	black .
	@for d in src/${PACKAGE_NAME}/agents/*/ui; do \
		if [ -d "$$d" ]; then \
			echo "Formatting module in $$d..."; \
			(cd "$$d" && $(REACT_FORMAT_CMD)) || exit 1; \
		fi; \
	done
	@cd src/${PACKAGE_NAME}/ui && $(REACT_FORMAT_CMD)

check-format:
	black . --check --diff

.PHONY: build-ui dev prod

build-mf:
	@echo "Building Microfrontend"
	@for d in src/${PACKAGE_NAME}/agents/*/ui; do \
		if [ -d "$$d" ]; then \
			echo "Building module in $$d..."; \
			(cd "$$d" && $(REACT_BUILD_CMD)) || exit 1; \
		fi; \
	done
	@echo "Microfrontend build complete.✅"


build-ui: build-mf
	@echo "Building UI...🚀"
	@cd src/${PACKAGE_NAME}/ui && $(REACT_BUILD_CMD)
	@echo "UI build complete.✅"

run: build-ui
	uv run uvicorn --host 0.0.0.0 --port 8080 --factory src.${PACKAGE_NAME}.app:get_app --reload

debug: build-ui
	uv run python -m debugpy --listen 0.0.0.0:5678 --wait-for-client -m uvicorn --factory src.${PACKAGE_NAME}.app:get_app --host 0.0.0.0 --port 8080 --reload

preview:
	uv run --frozen uvicorn --host 0.0.0.0 --port 8080 --workers 1 --factory src.${PACKAGE_NAME}.app:get_app

deploy: clean build-ui
	@echo "Deploying to cloud run...🚀"
	cd scripts && ./deploy_crun.sh

teardown:
	@echo "Deleting all resources"
	cd scripts && ./teardown.sh

clean:
	rm -rf build/ dist/ src/*.egg-info src/${PACKAGE_NAME}/ui/dist src/${PACKAGE_NAME}/agents/vector_agent/ui/dist htmlcov/ .coverage /build

build: clean build-ui
	PIP_INDEX_URL=https://pypi.org/simple/ python -m build

push: build
	twine upload dist/*

test: clean
	pytest

test-cov: clean
	pytest --cov=src/material_ai --cov-report=html

build-context-files:
	gcloud meta list-files-for-upload > uploaded_files.txt

