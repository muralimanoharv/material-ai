
REACT_BUILD_CMD := npm install && npm run build

PACKAGE_NAME := material_ai

install:
	@command -v uv >/dev/null 2>&1 || { echo "uv is not installed. Installing uv..."; curl -LsSf https://astral.sh/uv/0.6.12/install.sh | sh; source $HOME/.local/bin/env; }
	uv sync --dev

format:
	black .

check-format:
	black . --check --diff

.PHONY: build-ui dev prod

build-ui:
	@echo "Building UI...🚀"
	@cd src/${PACKAGE_NAME}/ui && $(REACT_BUILD_CMD)
	@echo "UI build complete.✅"

run: build-ui
	uv run uvicorn --host 0.0.0.0 --port 8080 --factory src.${PACKAGE_NAME}.app:get_app --reload

debug: build-ui
	uv run python -m debugpy --listen 0.0.0.0:5678 --wait-for-client -m uvicorn src.${PACKAGE_NAME}.app:get_app --host 0.0.0.0 --port 8080 --reload

preview:
	uv run --frozen uvicorn --host 0.0.0.0 --port 8080 --workers 1 --factory src.${PACKAGE_NAME}.app:get_app

deploy:
	@echo "Deploying to cloud run...🚀"
	cd scripts && ./deploy_crun.sh

teardown:
	@echo "Deleting all resources"
	cd scripts && ./teardown.sh

clean:
	rm -rf build/ dist/ src/*.egg-info src/${PACKAGE_NAME}/ui/dist htmlcov/ .coverage /build

build: clean build-ui
	python -m build

push: build
	twine upload dist/*

test: clean
	pytest

test-cov: clean
	pytest --cov=src/material_ai --cov-report=html

