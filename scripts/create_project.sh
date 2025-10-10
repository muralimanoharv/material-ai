#!/bin/bash
set -e

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
    wget -q https://raw.githubusercontent.com/muralimanoharv/material-ai/refs/heads/main/src/material_ai/ui/ui_config.yaml
    wget -q https://raw.githubusercontent.com/muralimanoharv/material-ai/refs/heads/main/.dockerignore
    wget -q https://raw.githubusercontent.com/muralimanoharv/material-ai/refs/heads/main/.gitignore
    wget -q https://raw.githubusercontent.com/muralimanoharv/material-ai/refs/heads/main/cloudbuild.yaml
    wget -q https://raw.githubusercontent.com/muralimanoharv/material-ai/refs/heads/main/.env.example
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
DEFAULT_PROJECT_VERSION="1.0.1"

# 1. Get Project Name and Generate Variables
read -p "§ Project Name (default: ${DEFAULT_PROJECT_NAME}): " PROJECT_NAME
PROJECT_NAME=${PROJECT_NAME:-$DEFAULT_PROJECT_NAME} # A shorter way to set default

echo "⚙️  Processing project name..."
PROJECT_NAME_SANITIZED="${PROJECT_NAME// /_}"
PROJECT_NAME_CRUN_SANTIZED="${PROJECT_NAME// /-}"
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

touch scripts/crun_env.sh
cat > scripts/crun_env.sh << EOF
export CRUN_SERVICE_ACCOUNT_NAME="${PROJECT_NAME_CRUN_SANTIZED}-crun-sa-01"
export CRUN_SERVICE_ACCOUNT="\${CRUN_SERVICE_ACCOUNT_NAME}@\${PROJECT_ID}.iam.gserviceaccount.com"
export CRUN_SERVICE="${PROJECT_NAME_CRUN_SANTIZED}-crun"
export CRUN_CONTAINER_REPO="${PROJECT_NAME_CRUN_SANTIZED}-crun-repository"
export CRUN_IMAGE="${PROJECT_NAME_CRUN_SANTIZED}"
EOF

cat > Makefile << EOF
install:
	@command -v uv >/dev/null 2>&1 || { echo "uv is not installed. Installing uv..."; curl -LsSf https://astral.sh/uv/0.6.12/install.sh | sh; source \$HOME/.local/bin/env; }
	uv sync --dev

run:
	uv run uvicorn --host 0.0.0.0 --port 8080 --factory src.main:${APP_FUNCTION} --reload

debug:
	uv run python -m debugpy --listen 0.0.0.0:5678 --wait-for-client -m uvicorn src.main:${APP_FUNCTION} --host 0.0.0.0 --port 8080 --reload

preview:
	uv run --frozen uvicorn --host 0.0.0.0 --port 8080 --workers 1 --factory src.main:${APP_FUNCTION}

deploy:
	@echo "Deploying to cloud run...🚀"
	./scripts/deploy_crun.sh

format:
	black .

check-format:
	black . --check --diff
EOF

cat > Dockerfile << EOF
# Use an official Python runtime as a parent image
FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set the working directory in the container
WORKDIR /app

RUN apt-get update && apt-get install -y make
RUN apt-get update && apt-get install -y curl gnupg
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -

# Install Node.js and npm
RUN apt-get install -y nodejs

COPY Makefile .

# Install dependencies
# Comment --no-dev --no-editable for local development debugging
RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --frozen --no-install-project --no-dev --no-editable --verbose

# Copy the content of the local src directory to the working directory
# Comment the below line for local development hot reloading to work
COPY src/ src/

COPY config.ini .

# Make port 8080 available to the world outside this container
EXPOSE 8080

ENV PYTHONPATH="src"
ENV GENERAL_DEBUG=false
ENV CONFIG_PATH=config.ini

CMD ["make", "preview"]
EOF

cat > docker-compose.yml << EOF
services:
  ${PROJECT_NAME_LOWERCASE}:
    build: .
    networks:
      - my-project-network 
    environment:
     - SSO_CLIENT_ID=\${SSO_CLIENT_ID}
     - SSO_CLIENT_SECRET=\${SSO_CLIENT_SECRET}
     - SSO_REDIRECT_URI=\${SSO_REDIRECT_URI}
     - SSO_SESSION_SECRET_KEY=\${SSO_SESSION_SECRET_KEY}
     - CONFIG_PATH=\${CONFIG_PATH}
     - GOOGLE_GENAI_USE_VERTEXAI=\${GOOGLE_GENAI_USE_VERTEXAI}
     - GOOGLE_API_KEY=\${GOOGLE_API_KEY}
     - ADK_SESSION_DB_URL=\${ADK_SESSION_DB_URL}
    ports:
      - "8080:8080"
    volumes:
      - ./src:/app/src
      - ./config.ini:/app/config.ini

networks:
  my-project-network:
    driver: bridge
EOF

cat > pyproject.toml << EOF
[project]
name = "${PROJECT_NAME_LOWERCASE}"
version = "1.0.0"
description = "${PROJECT_NAME}"
readme = "README.md"
requires-python = ">=3.13"
dependencies = [
    "material-ai==${DEFAULT_PROJECT_VERSION}",
]

[dependency-groups]
dev = [
    "black>=25.9.0",
    "build>=1.3.0",
    "debugpy>=1.8.15",
    "twine>=6.2.0",
]

[tool.black]
# Set the maximum line length. Black defaults to 88.
line-length = 88 
# Files to skip over
exclude = '''
/(
    \.git
  | \.mypy_cache
  | \.venv
  | \.vscode
  | dist
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
    model="gemini-2.0-flash",
    description="A helpful agent.",
    tools=[say_hello, who_am_i],
)
EOF
echo "✅ Python source created."


# Create README.md

cat > README.md << EOF
<div align="center">
  
# Material AI Agent Builder

**You build the agents. We'll handle the rest.**

</div>

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python Version](https://img.shields.io/badge/python-3.9+-blue.svg)](https://www.python.org/downloads/)

**Material AI Agent Builder** provides a production-ready framework for creating sophisticated, UI-driven AI agents. It handles the complexities of authentication, session management, and UI configuration, so you can focus entirely on building powerful agent logic.

---

## 🚀 Getting Started

You can set up your development environment either locally using Python or with Docker for a more streamlined experience.

### Method 1: Local Development Environment

Follow these steps to get the project running on your local machine.

#### **1. Prerequisites**

Ensure you have the following tools installed:
* **Python** (v3.9 or higher)
* **uv** (a fast Python package installer)
* **make** (a command-line build tool)

> **Quick Install:**
> * **uv**: \`curl -LsSf https://astral.sh/uv/install.sh | sh\` (macOS/Linux) or \`powershell -c "irm https://astral.sh/uv/install.ps1 | iex"\` (Windows).
> * **make**: \`sudo apt-get update && sudo apt-get install make\` (Debian/Ubuntu) or \`brew install make\` (macOS).

#### **2. Installation & Setup**

\`\`\`bash
# 1. Create and activate a virtual environment
uv venv
source .venv/bin/activate

# 2. Install dependencies
uv sync
\`\`\`


#### **3. Configure Environment Variables**

First, copy the example environment file:

\`\`\`bash
cp .env.example .env
\`\`\`

Next, open the new \`.env\` file and add your credentials.

> **⚠️ Important for \`.env\` Configuration:**
>
>   * \`SSO_CLIENT_ID\`: The Client Id of OAuth
>   * \`SSO_CLIENT_SECRET\`: The Client Secret of OAuth
>   * \`SSO_SESSION_SECRET_KEY\`: Generate a strong, random string for this value.
>   * \`SSO_REDIRECT_URI\`: For local development, this is \`http://localhost:8080/auth\`. **Do not use \`http\` in production.**
>   * \`ADK_SESSION_DB_URL\`: The default \`sqlite\` database is for development only. Use a managed database like PostgreSQL or MySQL in production.
>   * \`GOOGLE_API_KEY\`: API key for Gemini API, Go to https://aistudio.google.com/apikey to generate API KEY


#### **4. Run the Application**

Once configured, you can run or debug the application using \`make\`.

\`\`\`bash
# Run the application normally
make run

# Or, run in debug mode
make debug
\`\`\`

  * **Application URL**: \`http://127.0.0.1:8080\`
  * **Swagger API Docs**: \`http://127.0.0.1:8080/docs\`
  * **Debug Port**: \`5678\` (Attach a remote debugger using the provided \`.vscode/launch.json\` config).


-----

### Method 2: Docker for Development 🐳

For a quick and isolated setup, use Docker Compose.

#### **1. Prerequisites**

  * **Docker** and **Docker Compose** must be installed.

#### **2. Configure Environment Variables**

Just like the local setup, you need to create and configure your \`.env\` file.

\`\`\`bash
cp .env.example .env
\`\`\`

Open the \`.env\` file and fill in your credentials.

#### **3. Build and Run**

Start the application with a single command:

\`\`\`bash
docker compose up
\`\`\`

#### **Useful Docker Commands**

  * **Run in the background:** \`docker compose up -d\`
  * **Force a rebuild of the images:** \`docker compose up --build\`
  * **Stop and remove the containers:** \`docker compose down\`

-----

## 🤖 Creating an Agent

Adding a new agent is simple. The framework uses a "convention over configuration" approach by automatically discovering agents placed in the \`src/agents/\` directory.

A place holder agent is already provided under \`src/agents/${PROJECT_NAME_LOWERCASE}/agent\`

An agent is a Python file that defines an \`Agent\` instance and the tools it can use.

\`\`\`python
# src/agents/${PROJECT_NAME_LOWERCASE}/agent.py

from google.adk.agents import Agent
from material_ai.oauth import oauth_user_details_context

def say_hello():
    """Greets the user."""
    return {"message": "Hi, what can I do for you today?"}

def who_am_i():
    """Gets the current user's details from the active session."""
    user_details = oauth_user_details_context.get()
    if not user_details:
        return {"error": "User is not logged in."}
    return user_details.model_dump()

# The framework will discover this 'root_agent' instance
root_agent = Agent(
    name="${PROJECT_NAME_LOWERCASE}",
    model="gemini-1.5-flash",
    description="A helpful agent that can greet users and identify them.",
    tools=[say_hello, who_am_i],
)
\`\`\`

The \`oauth_user_details_context\` gives you secure access to the logged-in user's details within your tools.

-----

## 🎨 Customizing the UI

All UI and theme customizations are managed in a single configuration file: \`ui_config.yaml\`. This allows you to brand the application without touching any code.

### General Configuration

You can modify high-level UI elements:

  * **\`title\` & \`greeting\`**: Change the application title and the welcome message.
  * **\`models\`**: Define the list of AI models available to the user, complete with names and taglines.
  * **\`feedback\`**: Customize the categories for user feedback.

### Theming (Light & Dark Mode)

The \`theme\` section in \`ui_config.yaml\` contains \`lightPalette\` and \`darkPalette\` objects. You can change the hex codes for:

  * **Primary Colors**: For buttons, links, and accents.
  * **Background Colors**: For the main app, cards, and side panels.
  * **Text Colors**: For headings, paragraphs, and other text elements.

> **✨ Pro Tip: Generate Themes with AI**
> Use a prompt like *"Create a professional color palette for a web app's light and dark theme. The primary color should be a shade of teal"* in Gemini to generate beautiful color schemes for your \`ui_config.yaml\` file.

-----

## 🔐 Configuring Authentication (SSO)

You can replace the default Google OAuth service with your own implementation.

1.  **Create Your Service**: Create a Python class that implements the required authentication logic. An example is available at src/${OAUTH_FILE_NAME}.py.
2.  **Register the Service**: In \`src/main.py\`, import and register your custom service when initializing the app.

\`\`\`python
# src/main.py

import os
from material_ai import get_app
# Import your custom OAuth service
from .${OAUTH_FILE_NAME} import ${OAUTH_CLASS_NAME}

AGENT_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "agents")

def ${APP_FUNCTION}():
    return get_app(
        agent_dir=AGENT_DIR,
        # Register your service here
        oauth_service=${OAUTH_CLASS_NAME}(),
        ui_config_yaml="ui_config.yaml"
    )
\`\`\`

-----

## 📦 Deployment

This project uses a \`Makefile\` command to automate deployment.

1.  **Permissions**: Make sure to run "chmod +x ./scripts/*.sh" and provide permissions to execute shell scripts
2.  **Deploy**: Run the following command to build and deploy the application:
    \`\`\`bash
    make deploy
    \`\`\`

-----

## 🤝 Contributing & Support

We welcome your contributions\! If you find a bug or have a feature request, please **[open an issue](https://github.com/muralimanoharv/material-ai/issues)** on our GitHub repository.

  * **Bug Reports**: Please include a clear title, a detailed description, and steps to reproduce the issue.
  * **Feature Requests**: Describe the problem you're solving and the desired functionality.

Thank you for helping improve Material AI\!
EOF

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