# Material AI
*You build the agents. We'll handle the rest.*

## Material-AI Project Generator 🚀

To create a new project, open your terminal, and run the command below. This will download the interactive setup script, make it executable, and then launch it.

[//]: # ( x-release-please-start-version )

```bash
curl -O https://raw.githubusercontent.com/muralimanoharv/material-ai/refs/tags/v1.2.0/scripts/create_project.sh && \
chmod +x ./create_project.sh && \
./create_project.sh && \
rm ./create_project.sh
```
[//]: # (x-release-please-end)
-----
Follow the on-screen prompts to generate your new project directory.



## Current Challenges with the Agent Development Kit (ADK)

While the Google Agent Development Kit (ADK) is a powerful tool for rapidly building and prototyping conversational agents, several challenges emerge when transitioning from a development environment to a live, production-grade application for enterprise customers. These challenges include:

1.  **Enterprise Authentication:** Standard ADK deployments lack a straightforward way to integrate with diverse customer SSO (Single Sign-On) systems, making secure, enterprise-wide adoption difficult.
2.  **A Production-Ready User Interface:** The default web UI is designed primarily for testing and development. It is not intended for a polished, customer-facing experience and lacks the rich design and features that end-users expect from a modern application.
3.  **Bespoke Custom Functionality:** Implementing custom business logic—such as systems to capture LLM feedback, integrate with internal enterprise APIs, or fetch user-specific data—requires significant effort outside the core ADK framework.
4.  **Robust Session Management & Authorization:** The ADK does not provide built-in, enterprise-grade mechanisms for managing user sessions or defining granular, role-based authorization rules. These are critical for security, control, and personalization in any multi-user environment.

## Introducing Material AI: The Solution

**Material AI** is a comprehensive framework built to solve these exact challenges. It enhances the ADK by providing the necessary layers for security, user experience, and custom functionality, turning your agent prototypes into secure, scalable, and enterprise-ready AI applications.

### Focus on What Matters: Building Great Agents

Material AI is designed for a **streamlined developer experience**. The framework is incredibly easy to set up and handles all the difficult engineering challenges for you. Complexities like creating a rich user interface, configuring SSO, managing user sessions, and implementing authorization are all handled **out-of-the-box**.

This allows your developers to bypass these hurdles and focus exclusively on what they do best: **building amazing and impactful agents using the ADK.**

### Features at a Glance

* **Enterprise-Ready Authentication 🔐:** Material AI comes with a built-in, configurable authentication module that seamlessly integrates with customer infrastructure and simplifies the process of setting up SSO.
* **A Rich, Gemini-like User Interface ✨:** Material AI delivers a modern, intuitive, and production-ready UI inspired by the Google Gemini app, providing a professional and engaging front-end for your agents.
* **User Interface Customization🎨:** Customize User Interface seamlessly as per customer's requirement.
* **Extensible Custom Functionality 🛠️:** Our framework introduces an extensible backend layer, allowing you to easily add custom business logic and integrate with other internal or third-party APIs.
* **Robust Session Management & Authorization 👤:** Material AI includes a sophisticated system for managing user sessions and a granular authorization layer to define roles and permissions, ensuring only authorized users can interact with the application.
* **NEW: Agent UI (MAI):** The world is moving to AI agents, so why are we still using UI built for humans alone? MAI (Material Agent Interface) bridges the gap between agentic intelligence and user experience. By dynamically generating UI workflows on the fly, MAI ensures your interface is as adaptive and intelligent as the AI powering it
* **NEW: Agentic Library:** Why build what’s already been perfected? The mateiral_ai agentic library is the foundation for the next generation of AI. It moves the industry from 'custom-coded' to 'component-based' development. Use our library of pre-built agents as your base class, then inherit and scale—turning months of development into minutes, some examples include out of box Nl2Sql Agent.
* **NEW: Microfrontend:** Break free from the 'chat bubble' constraint. While Material Agent Interface (MAI) offers powerful out-of-the-box components, its true strength lies in its Microfrontend Architecture. This allows you to inject custom, agent-specific UI flows dynamically. Whether your agent requires a data grid, a creative canvas, or a bespoke dashboard, you can orchestrate the exact interface the task demands, ensuring the UI is as specialized as the agent itself.
* **NEW: Enhacing UI to show thinking:** Experience the "brain" of your agent in real-time. MAI now supports Native Thinking Tracks, allowing users to follow an agent’s logic as it unfolds. Instead of staring at a loading spinner, users see the agent’s internal monologue and decision-making process. This builds trust and provides immediate context on how the final answer is being constructed.
* **NEW: Production Ready Deployment Using Terraform:** Skip the manual cloud configuration. With our new Terraform Deployment Suite, you can spin up a production-ready environment for your agents in minutes. We’ve baked security directly into the code using PoLP (Principle of Least Privilege) architecture, automatically configuring isolated environments and scoped permissions so you can focus on building agents, not managing infrastructure.

-----

## 🚀 Latest Features

### 1. Material Agent Interface (MAI)
The UI Layer for the Agentic Era.

While the world migrates toward Agentic AI, the User Interface has remained a static bottleneck. Material Agent Interface (MAI) bridges this gap, introducing a Generative UI framework that evolves alongside your agents.

Whether you are building intelligent dashboards, complex data analyzers, or context-aware workflows, MAI ensures the interface reflects the agent’s reasoning. By fusing the proven design language of Material UI with the adaptive power of Generative AI, MAI delivers exactly what the user needs, exactly when they need it.

#### Getting Started
```python
from material_ai.adk.agents import MaiAgent

# Define the User Intake Agent
onboarding_agent = MaiAgent(
    name="user_onboarding_agent",
    model="gemini-3-flash-preview",
    system_prompt="""
    Role: Onboarding Specialist.
    Workflow:
    1. Check if 'name' and 'age' are provided in the context.
    2. If missing: Render a Material UI Form to collect Name and Age.
    3. If provided: Generate a warm greeting saying "Hello [Name], welcome to the platform!"
    4. Style: Use clean, centered Material UI components.
    """
)
```
And that's it you will see MAI creating seameless user interfaces on the fly.


### 2. 📚 The Agentic Library: Built-in Specialized Agents

The **Agentic Library** allows developers to bypass the boilerplate of building common AI workflows. Instead of writing complex logic from scratch, you can import, inherit, and extend pre-built, production-ready agents.

#### The `Nl2SqlAgent` (Natural Language to SQL)

The `Nl2SqlAgent` is a high-performance, dynamic engine designed to bridge the gap between human language and structured data. It doesn't just "write" queries; it orchestrates a full data-retrieval lifecycle.

* **Multi-Database Support:** Out-of-the-box compatibility with SQLite, MySQL, PostgreSQL, and Google BigQuery.
* **Automated Schema Discovery:** Uses a recursive tool-calling chain to fetch table lists, map schemas, and identify foreign key relationships automatically.
* **Metadata Injection:** Allows developers to provide "hints" (column metadata) to help the agent understand specific business logic or constrained values.
* **Safe Execution:** Validates, builds, and executes the query, returning processed results directly to your UI.

#### Getting Started: Querying Your Data

```python
from material_ai.adk.agents import Nl2SqlAgent

# Initialize the data specialist
data_retriever = Nl2SqlAgent(
    name="Sports_Analytics_Expert",
    model="gemini-3-flash-preview",
    db_url="bigquery://sample_project/sports_dataset", 
    description="Specialist for querying the sports database and retrieving attendee analytics.",
    
    # Custom business logic for specific columns
    additional_column_instructions={
        "users": {"gender": "Strictly use values: 'Male', 'Non-binary', 'Female'"}
    },
    
    # Fine-tuning the output style
    additional_instructions="""
        - Provide a high-level paragraph summary of the retrieved data.
        - Ensure SQL keywords like COUNT(*) are uppercase.
        - Omit semicolons from the final SQL generated.
    """
)

```

### 🧩 3. Microfrontend Architecture: UI Without Limits

In the agentic era, a "chat bubble" isn't always the right interface. Sometimes an agent needs a specialized dashboard, a creative canvas, or a complex data grid. MAI’s **Microfrontend Architecture** gives you total creative freedom while keeping the heavy lifting of the backend under the hood.

#### Why Microfrontends?

* **Beyond the Chatbot:** Break away from standard message threads and build interfaces tailored specifically to your agent's unique output.
* **Enterprise-Ready Infrastructure:** You build the UI; we handle the **Authentication, Authorization, and Deployment**.
* **Runtime Dynamism:** Interfaces are loaded on-the-fly. The platform detects and injects your custom UI the moment the agent is called.
* **Zero Re-invention:** Use MAI’s core components as building blocks within your own custom React project.

#### How It Works

MAI treats your agent’s folder as a standalone micro-app. At runtime, the system scans for a pre-built bundle and mounts it directly into the dashboard.

##### Quick Start: Injecting Your Custom UI

1. Navigate to your agent's directory: `agents/<your_agent>/ui/`.
2. Develop your interface using your preferred React setup.
3. **Build** your project to generate a distribution file.
4. MAI automatically looks for `dist/index.js` and renders it when the agent is active.

> **Pro Tip:** Check out the `src/material_ai/agents/vector_agent/ui` folder for a reference implementation of a custom UI flow.


## 🚀 Setting Up Locally

Follow these steps to get your local development environment running.

### Prerequisites

Make sure you have the following installed on your system:

  * **Python** (version 3.9 or higher)
  * **uv** (a fast Python package installer)
  * **make** (a fast command line interface)
  * **nodejs** (https://nodejs.org/en)

If you don't have `uv`, you can install it quickly. On macOS and Linux, run `curl -LsSf https://astral.sh/uv/install.sh | sh`. For Windows, use `powershell -c "irm https://astral.sh/uv/install.ps1 | iex"`.

If you don't have `make`, you can install it quickly. On macOS and Linux, run `apt-get update && apt-get install -y make`.

-----

### Installation Steps

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/muralimanoharv/material-ai.git
    cd material-ai
    ```

2.  **Create and activate a virtual environment:**

    ```bash
    # Create the virtual environment
    uv venv

    # Activate it (the command differs by shell)
    source .venv/bin/activate
    ```

3.  **Install the dependencies:**

    ### 🛠️ Prerequisites: SSL Certificate Setup (macOS)

    If you are running this project on **macOS**, you may encounter an `SSL: CERTIFICATE_VERIFY_FAILED` error when the application tries to connect to external services (like Google OAuth or APIs).

    This happens because Python on macOS does not use the system’s default root certificates. To fix this, you must run the certificate installation script bundled with Python:

    ```bash
    /Applications/Python\ 3.14/Install\ Certificates.command
    ```

    ```bash
    uv sync
    ```

4.  **Set up environment variables:**
    By default, the application is configured to use **Google OAuth** for SSO. Before running the app, you will need to set up an **OAuth 2.0 Client ID** in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) to get your credentials.

    You will also need GEMINI API KEY Go to https://aistudio.google.com/apikey to generate API KEY

    Create a file named `.env` in the root of the project by copying the example file:

    ```bash
    cp .env.example .env
    ```

    Open the newly created `.env` file and fill in the required values. It will look like this:

    ```ini
    # Single Sign-On (SSO) Configuration
    SSO_ISSUER="google/azure"
    SSO_CLIENT_ID="YOUR_SSO_CLIENT_ID"
    SSO_CLIENT_SECRET="YOUR_SSO_CLIENT_SECRET"

    # WARNING: This configuration is for local development ONLY.
    # For production, this MUST be updated to a public, HTTPS-enabled URL.
    # SSO redirects over non-secure (http) connections are a security risk.
    SSO_REDIRECT_URI="http://localhost:8080/auth"
    SSO_SCOPE="YOUR_SSO_CLIENT_SCOPE"

    # Session Management
    SSO_SESSION_SECRET_KEY="GENERATE_A_STRONG_RANDOM_SECRET_KEY"

    # Application Configuration
    CONFIG_PATH="config.ini"

    # Google Configuration
    GOOGLE_GENAI_USE_VERTEXAI=FALSE
    GOOGLE_API_KEY="YOUR_GEMINI_API_KEY"

    # WARNING: This configuration uses a local file-based database suitable only for development.
    # DO NOT use this in a production environment. Use a managed database instead.
    ADK_SESSION_DB_URL="sqlite:///./my_agent_data.db"

    ```

5.  **Run the application:**

    ```bash
    make run
    ```

    The application should now be running on `http://127.0.0.1:8080`.
    Access swagger API docs on `http://127.0.0.1:8080/docs`.

5.  **Debug the application:**

    In order to debug you need to first create vscode debug config under `.vscode/launch.json`
    ```json
    {
        "version": "0.2.0",
        "configurations": [
        
            {
                "name": "Python Debugger: Remote Attach",
                "type": "debugpy",
                "request": "attach",
                "connect": {
                    "host": "localhost",
                    "port": 5678
                },
                "pathMappings": [
                    {
                        "localRoot": "${workspaceFolder}",
                        "remoteRoot": "."
                    }
                ]
            }
        ]
    }
    ```

    ```bash
    make debug
    ```

    The application should now be running on `http://127.0.0.1:8080` and debug port running on `http://127.0.0.1:5678`.

    Attach python remote debugger using vscode debug tools

---
## Docker for Development 🐳

If you are like me lazy to install all dependencies, don't worry we got you covered

### Prerequisites

* You must have **Docker** and **Docker Compose** installed on your system.
* You have cloned this repository.

### Setup Instructions

**1. Configure Environment Variables**

The application requires environment variables to run. We've included an example file to get you started.

First, copy the example `.env` file:
```bash
cp .env.example .env
````

Next, open the newly created `.env` file and fill in the required values.

**2. Build and Run the Application**

Once your `.env` file is configured, you can start the application with a single command:

```bash
docker compose up
```

This command will build the necessary Docker images and start all the services. You can add the `-d` flag to run the containers in the background (detached mode).

### Useful Docker Commands

  * **Run in the background:**
    ```bash
    docker compose up -d
    ```
  * **Force a rebuild of the images:**
    ```bash
    docker compose up --build
    ```
  * **Stop and remove the containers:**
    ```bash
    docker compose down
    ```
-----

## 🤖 Creating Your First Agent

Adding new agents to Material AI is designed to be simple and intuitive, following a "convention over configuration" approach.

### The `agents` Directory

To create a new agent, all you need to do is **add a new Python file inside the `src/material_ai/agents/<agent_name>/agent.py` directory**.

Material AI automatically scans this directory on startup. Any valid agent definition it finds will be dynamically loaded and displayed in the UI, with no manual registration or configuration files needed. This allows you to focus purely on building your agent's logic.

### Example Agent

Here is a simple example of what an agent file might look like. You could save this as `src/material_ai/agents/greeting_agent/agent.py`:

Make sure to provide necessary environment variables for ADK

```ini
GOOGLE_GENAI_USE_VERTEXAI=FALSE/TRUE
GOOGLE_API_KEY="YOUR_GEMINI_API_KEY"
```
Go to https://aistudio.google.com/apikey to generate API KEY

```python
# src/material_ai/agents/greeting_agent/agent.py

from google.adk.agents import Agent
from material_ai.oauth import oauth_user_details_context

def say_hello():
    return {
        "description": "Hi, what can I do for you today?"
    }

def who_am_i():
    user_details = oauth_user_details_context.get() # Get user details like uid, email, full name etc...
    return user_details


# Define the agent itself, giving it a name and description.
# The agent will automatically use the tools you provide in the list.
root_agent = Agent(
    name="greeting_agent",
    model="gemini-2.0-flash",
    description="An agent that can greet users.",
    instruction="""
    Use say_hello tool to greet user, If user asks about himself use who_am_i tool
    """,
    tools=[say_hello, who_am_i],
)
```

Since Material AI takes care of authentication & authorization you can easily retrieve user information. 

We can use this information to do validations, authorizations and also maybe send email or push notifications.

Make sure to expose agent under `__init__.py` under `src/material_ai/agents/greeting_agent/__init__.py`

```python
from . import agent
```

Once you save this file, the next time you run the application, a new "Greeting Agent" will automatically appear in the UI, ready to be used.

---

Excellent. This is a critical section for developers looking to adapt your project. Here is the "Configuring SSO" section for your README, written based on the details you provided.

-----

## 🔐 Configuring Single Sign-On (SSO)

Material AI is built to be flexible, allowing you to use the default Google SSO/Azure AD for quick setups or integrate a custom SSO provider for specific customer needs.

### Default Configuration

By default, Material AI uses **Google OAuth 2.0** for authentication. For most use cases, especially local development, you simply need to update your `.env` file with the correct Google OAuth / Azure AD credentials.

The source code for Google SSO is available for reference in `src/material_ai/oauth/google_oauth.py`.

The source code for Azure AD is available for reference in `src/material_ai/oauth/azure_oauth.py`.

Use env variable `SSO_ISSUER=google` if you want Google OAuth
use env variable `SSO_ISSUER=azure` if you want Azure AD

### Adding a Custom SSO Provider

For customer deployments that require integration with a different identity provider (e.g., Okta, Amazon), Material AI provides a streamlined, one-time setup process. This is designed to be easy for developers.

Follow these two steps to add a new SSO provider:

#### 1\. Implement the `IOAuthService` Interface

First, create a new class for your SSO provider (e.g., `CustomOAuthService`). This class **must** implement the `IOAuthService` interface to ensure it's compatible with the application's authentication flow.

You can find the interface definition, which outlines all the required methods you need to implement, in the following file:
`src/material_ai/oauth/interface.py`

Here is a basic skeleton for what your custom service class would look like:

```python
# src/material_ai/oauth/custom_oauth.py

from .interface import IOAuthService

class CustomOAuthService(IOAuthService):
    """
    Custom SSO implementation.
    """
    # You must implement all methods defined in the IOAuthService interface,
    # such as sso_get_redirection_url(), sso_get_access_token(), sso_get_new_access_token(), etc.
    ...

```

#### 2\. Register Your New Service

Next, you need to tell Material AI to use your new service. Open the file `src/material_ai/oauth/oauth.py` and modify the `get_oauth()` function to instantiate your custom class instead of the default `GoogleOAuthService`.

```python
# src/material_ai/oauth/oauth.py
# Import your new custom service here
from .custom_oauth import CustomOAuthService 

def get_oauth() -> IOAuthService:
    global _oauth_instance
    with _lock:
        if _oauth_instance is None:
            # Replace the default service with your new implementation
            _oauth_instance = CustomOAuthService()
            
        return _oauth_instance
```

Once this change is made, the entire application will use your custom SSO provider for all authentication workflows.

---

## 🎨 Customizing the User Interface

Material AI's front end is designed to be easily customized and white-labeled to meet specific customer requirements. You can adjust core application settings and visual themes by modifying two key files.

### 1. General Application Configuration

For high-level UI customizations, you can modify the configuration object in the following file:
`src/material_ai/ui/ui_config.yaml`

This file allows you to easily change key aspects of the user experience. A high-level overview of what you can customize includes:

* **Application Title & Text:** Update the main `title` of the application, the initial `greeting` message on the chat screen, and other default text strings.
* **Agent specific UI Configuration:** 
    * `agents:<agent>:title`: Agent specific title (Default = main.title)
    * `agents:<agent>:greeting`: Agent specific greeting message (Default = main.greeting)
    * `agents:<agent>:show_footer`: If you want to show the footer component (Default = True)
    * `agents:<agent>:chat_section_width`: Amount of chat section width (Default = 760px)
    * `agents:<agent>:feedback`: Configure the `feedback` options, such as the categories presented to users when they provide a negative rating.    
     
### 2. Customizing Themes (Light & Dark Mode)

To align the application's look and feel with customer branding, you can customize the color palettes in this file:
`src/material_ai/ui/ui_config.yaml`

This file defines the `lightPalette` and `darkPalette` under theme property used for the application's light and dark modes. You can easily change the color values for various UI elements, including:

* Primary colors (for buttons and accents)
* Background and paper colors
* Text colors for different headings and paragraphs

This allows you to create a completely bespoke visual experience based on customer UX preferences.

### ✨ Pro Tip: Generating Themes with AI
Struggling to come up with the perfect color scheme? You can **use Gemini to create beautiful color palettes** for the application.

For example, try a prompt like: *"Create a professional color palette for a web application's light and dark theme. The primary color should be a shade of teal."* You can then use the suggested hex codes in your `themes.js` file.

---

## Deployment 🚀
This repository contains a production-ready Terraform configuration to deploy a containerized application to **Google Cloud Run**. The architecture is built on the **Principle of Least Privilege (PoLP)**, ensuring that no broad permissions are granted and no existing cloud infrastructure is modified.
### Key Features

* **Isolated Identity:** Creates a dedicated Service Account for the Cloud Run service with zero inherited permissions.
* **Immutable & Idempotent:** Ensures that `terraform destroy` returns your GCP environment to its exact original state without leaving "orphan" permissions or modified shared resources.
* **Zero Side-Effects:** Does not modify the default Compute Engine service account or existing IAM roles.

This project is deployed using a `Makefile` command that automates the build and deployment process.

### 1\. Provide Appropriate Permissions
Make sure to run `chmod +x ./scripts` and provide permissions to execute shell scripts


### 2\. Deploy the Application

Once your `.env` file is configured, run the following command to build and deploy the application:

```bash
make deploy
```

### 3\. Teardown the Application

Once your `.env` file is configured, run the following command to teardown the application:

```bash
make teardown
```

This will ensure your cloud environment is returned to its original state:

### 4\. Steps to add additional roles to cloud run service account
In order to add additional permissions to cloud run service account you
can modify the crun roles under `scripts/main.tf -> sa_permissions`

### 4\. Steps to add additional environment variables to cloud run
In order to add additional environment variables you will have to modify `scripts/main.tf` to
pass these env variables to cloud run in below format
```bash
variable "custom_env_variable" { type = string }
env {
        name  = "NAME OF ENV"
        value = var.custom_env_variable
}
```
Next modify `scripts/deploy_crun.sh` to pass this env variable to terraform
```bash
./terraform apply \
  -var="custom_env_variable=hello world"
```
 
---
## 🐞 Reporting Issues and Feature Requests

We welcome your contributions! If you encounter a bug or have an idea for a new feature, the best way to let us know is by opening an issue on our GitHub repository.

All bug reports and enhancement requests can be raised directly on the **[GitHub Issues page](https://github.com/muralimanoharv/material-ai/issues)**.

* **For Bug Reports:** When reporting a bug, please include a clear title, a detailed description of the problem, steps to reproduce it, and what you expected to happen.
* **For Feature Requests:** If you're proposing an enhancement, please describe the problem you're trying to solve and provide a clear explanation of the desired functionality.

We appreciate you taking the time to help improve Material AI!
