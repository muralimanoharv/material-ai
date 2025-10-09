#!/bin/bash

# A function to show a spinner while a command is running
show_loader() {
  local command_to_run="$1"
  local message="${2:-Loading...}"
  local spinner_chars="⣾⣽⣻⢿⡿⣟⣯⣷"
  local delay=0.1

  eval "$command_to_run" &
  local pid=$!
  tput civis # Hide cursor

  while kill -0 $pid 2>/dev/null; do
    for (( i=0; i<${#spinner_chars}; i++ )); do
      echo -ne "  [${spinner_chars:$i:1}] $message\r"
      sleep $delay
    done
  done

  wait $pid
  local exit_status=$?
  tput cnorm # Show cursor

  if [ $exit_status -eq 0 ]; then
    echo -e "  [✔] $message Done!        "
  else
    echo -e "  [✖] $message Failed.      "
  fi
  return $exit_status
}

download_template_files() {
    # URLs for the root directory
    wget -q https://raw.githubusercontent.com/muralimanoharv/material-ai/refs/heads/main/config.ini
    wget -q https://raw.githubusercontent.com/muralimanoharv/material-ai/refs/heads/main/ui_config.yaml
    wget -q https://raw.githubusercontent.com/muralimanoharv/material-ai/refs/heads/main/README.md
    wget -q https://raw.githubusercontent.com/muralimanoharv/material-ai/refs/heads/main/Dockerfile
    wget -q https://raw.githubusercontent.com/muralimanoharv/material-ai/refs/heads/main/docker-compose.yml
    wget -q https://raw.githubusercontent.com/muralimanoharv/material-ai/refs/heads/main/.dockerignore
    wget -q https://raw.githubusercontent.com/muralimanoharv/material-ai/refs/heads/main/.gitignore
    wget -q https://raw.githubusercontent.com/muralimanoharv/material-ai/refs/heads/main/cloudbuild.yaml
    wget -q https://raw.githubusercontent.com/muralimanoharv/material-ai/refs/heads/main/.env-example
    # URLs for the scripts directory
    mkdir -p scripts
    wget -q -P ./scripts https://raw.githubusercontent.com/muralimanoharv/material-ai/refs/heads/main/scripts/cloudbuild.sh
    wget -q -P ./scripts https://raw.githubusercontent.com/muralimanoharv/material-ai/refs/heads/main/scripts/setup.sh
    wget -q -P ./scripts https://raw.githubusercontent.com/muralimanoharv/material-ai/refs/heads/main/scripts/deploy_crun.sh
}


### --- SCRIPT START --- ###

echo "🚀 Material-AI Project Boilerplate Generator 🚀"
echo "-------------------------------------------------"

# --- CONFIGURATION ---
DEFAULT_PROJECT_NAME="my-awesome-agent"
# IMPORTANT: Update this path to point to your local Material-AI wheel file
MATERIAL_AI_WHL_PATH="file:/home/muralimanoharv/Documents/projects/material-ai/dist/material_ai-1.0.0-py3-none-any.whl"

# 1. Get Project Name and Generate Variables
read -p "§ Project Name (default: ${DEFAULT_PROJECT_NAME}): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-$DEFAULT_PROJECT_NAME} # A shorter way to set default

echo "⚙️  Processing project name..."
PROJECT_NAME_SANITIZED="${PROJECT_NAME// /_}"
PROJECT_NAME_SANITIZED="${PROJECT_NAME_SANITIZED//-/_}"
PROJECT_NAME_LOWERCASE="${PROJECT_NAME_SANITIZED,,}"

PROJECT_PASCAL_CASE=""
IFS='_' read -ra words <<< "$PROJECT_NAME_LOWERCASE"
for word in "${words[@]}"; do
  PROJECT_PASCAL_CASE+="${word^}"
done
unset IFS

APP_FUNCTION="${PROJECT_NAME_LOWERCASE}_app"
OAUTH_FILE_NAME="${PROJECT_NAME_LOWERCASE}_oauth"
OAUTH_CLASS_NAME="${PROJECT_PASCAL_CASE}OAuthService"
echo "✅ Variables set."

# 2. Create Directory and Download Files
echo "📁 Creating project directory: ${PROJECT_NAME_SANITIZED}"
mkdir "$PROJECT_NAME_SANITIZED"
cd "$PROJECT_NAME_SANITIZED"

show_loader "download_template_files" "Downloading template files..."

# 3. Generate Config Files
echo "📄 Generating configuration files..."

cat > Makefile << EOF
install:
	@command -v uv >/dev/null 2>&1 || { echo "uv is not installed. Installing uv..."; curl -LsSf https://astral.sh/uv/0.6.12/install.sh | sh; source \$HOME/.local/bin/env; }
	uv sync --dev

run:
	uv run uvicorn --host 0.0.0.0 --port 8080 --factory src.main:${APP_FUNCTION} --reload

debug:
	uv run python -m debugpy --listen 0.0.0.0:5678 --wait-for-client -m uvicorn src.main:${APP_FUNCTION} --host 0.0.0.0 --port 8080 --reload

deploy:
	@echo "Deploying to cloud run...🚀"
	./scripts/deploy_crun.sh

format:
	black .

check-format:
	black . --check --diff
EOF

cat > pyproject.toml << EOF
[project]
name = "${PROJECT_NAME_LOWERCASE}"
version = "1.0.0"
description = "${PROJECT_NAME}"
readme = "README.md"
requires-python = ">=3.12"
dependencies = [
    "debugpy>=1.8.1",
    "material_ai @ ${MATERIAL_AI_WHL_PATH}",
]

[tool.uv.sources]
material_ai = { type = "directory", path = "/home/muralimanoharv/Documents/projects/material-ai" }

[tool.uv.dev-dependencies]
black = ">=24.4.2"

[tool.black]
line-length = 88
exclude = '''
/(
    \.git|\.mypy_cache|\.venv|\.vscode|dist
)/
'''
EOF

echo "✅ Config files created."

# 4. Generate Source Code
echo "🐍 Generating Python source..."
mkdir -p "src/agents/${PROJECT_NAME_LOWERCASE}"

# --- Create src/__init__.py ---
touch src/__init__.py

# --- Create src/oauth_service.py ---
cat > "src/${OAUTH_FILE_NAME}.py" << EOF
from material_ai.oauth import (
    IOAuthService,
    OAuthErrorResponse,
    OAuthRedirectionResponse,
    OAuthSuccessResponse,
    OAuthUserDetail,
    SSOConfig,
    handle_httpx_errors,
)

class ${OAUTH_CLASS_NAME}(IOAuthService):

    def sso_get_redirection_url(self, sso: SSOConfig) -> OAuthRedirectionResponse:
        pass

    @handle_httpx_errors(url="https://${PROJECT_NAME_LOWERCASE}.apis.com/token")
    async def sso_get_access_token(
        self, sso: SSOConfig, authorization_code: str
    ) -> OAuthSuccessResponse | OAuthErrorResponse:
        pass

    @handle_httpx_errors(url="https://${PROJECT_NAME_LOWERCASE}.apis.com/token")
    async def sso_get_new_access_token(
        self, sso: SSOConfig, refresh_token: str
    ) -> OAuthSuccessResponse | OAuthErrorResponse:
        pass

    @handle_httpx_errors(url="https://${PROJECT_NAME_LOWERCASE}.apis.com/userinfo")
    async def sso_get_user_details(
        self, access_token: str
    ) -> OAuthUserDetail | OAuthErrorResponse:
        pass
EOF

# --- Create src/main.py ---
cat > src/main.py << EOF
import os
from material_ai import get_app
from .${OAUTH_FILE_NAME} import ${OAUTH_CLASS_NAME}

AGENT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "agents")

def ${APP_FUNCTION}():
    return get_app(
        agent_dir=AGENT_DIR,
        # oauth_service=${OAUTH_CLASS_NAME}(), # Uncomment and implement to enable SSO
        ui_config_yaml="ui_config.yaml"
    )
EOF

# --- Create src/agents/your_agent/__init__.py ---
cat > "src/agents/${PROJECT_NAME_LOWERCASE}/__init__.py" << EOF
from . import agent
EOF

# --- Create src/agents/your_agent/agent.py ---
cat > "src/agents/${PROJECT_NAME_LOWERCASE}/agent.py" << EOF
from google.adk.agents import Agent
from material_ai.oauth import oauth_user_details_context

def say_hello():
    """Greets the user."""
    return {"message": "Hi, what can I do for you today?"}

def who_am_i():
    """Gets the current user's details."""
    user_details = oauth_user_details_context.get()
    if not user_details:
        return {"error": "User is not logged in."}
    return user_details.model_dump()

root_agent = Agent(
    name="${PROJECT_NAME_LOWERCASE}",
    model="gemini-1.5-flash",
    description="A helpful agent.",
    tools=[say_hello, who_am_i],
)
EOF
echo "✅ Python source created."

# 5. Final Message
echo ""
echo "-------------------------------------------------"
echo "🎉 Success! Your new agent '$PROJECT_NAME' is ready."
echo ""
echo "Next steps:"
echo ""
echo "1. Navigate into your new project directory:"
echo "   cd ${PROJECT_NAME_SANITIZED}"
echo ""
echo "2. Install dependencies:"
echo "   make install"
echo ""
echo "3. Run the application:"
echo "   make run"
echo "-------------------------------------------------"