# Material AI


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
* **Extensible Custom Functionality 🛠️:** Our framework introduces an extensible backend layer, allowing you to easily add custom business logic and integrate with other internal or third-party APIs.
* **Robust Session Management & Authorization 👤:** Material AI includes a sophisticated system for managing user sessions and a granular authorization layer to define roles and permissions, ensuring only authorized users can interact with the application.

-----

## 🚀 Setting Up Locally

Follow these steps to get your local development environment running.

### Prerequisites

Make sure you have the following installed on your system:

  * **Python** (version 3.9 or higher)
  * **uv** (a fast Python package installer)

If you don't have `uv`, you can install it quickly. On macOS and Linux, run `curl -LsSf https://astral.sh/uv/install.sh | sh`. For Windows, use `powershell -c "irm https://astral.sh/uv/install.ps1 | iex"`.

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

    ```bash
    uv sync
    ```

4.  **Set up environment variables:**
    Create a file named `.env` in the root of the project by copying the example file:

    ```bash
    cp .env.example .env
    ```

    Open the newly created `.env` file and fill in the required values. It will look like this:

    ```ini
    # Single Sign-On (SSO) Configuration
    SSO_CLIENT_ID="YOUR_SSO_CLIENT_ID"
    SSO_CLIENT_SECRET="YOUR_SSO_CLIENT_SECRET"
    SSO_REDIRECT_URI="http://127.0.0.1:8000/auth"

    # Session Management
    SSO_SESSION_SECRET_KEY="GENERATE_A_STRONG_RANDOM_SECRET_KEY"

    # Application Configuration
    CONFIG_PATH="config.ini"
    ```

5.  **Run the application:**

    ```bash
    make run
    ```

    The application should now be running on `http://127.0.0.1:8000`.

5.  **Debug the application:**

    ```bash
    make debug
    ```

    The application should now be running on `http://127.0.0.1:8000`.


-----

## 🤖 Creating Your First Agent

Adding new agents to Material AI is designed to be simple and intuitive, following a "convention over configuration" approach.

### The `agents` Directory

To create a new agent, all you need to do is **add a new Python file inside the `src/agents/<agent_name>/agent.py` directory**.

Material AI automatically scans this directory on startup. Any valid agent definition it finds will be dynamically loaded and displayed in the UI, with no manual registration or configuration files needed. This allows you to focus purely on building your agent's logic.

### Example Agent

Here is a simple example of what an agent file might look like. You could save this as `src/agents/greeting_agent/agent.py`:

Make sure to provide necessary environment variables for ADK under `src/agents/greeting_agent/.env`

```ini
GOOGLE_GENAI_USE_VERTEXAI=FALSE/TRUE
GOOGLE_API_KEY=
```

```python
# src/agents/greeting_agent/agent.py

from google.adk.agents import Agent

def say_hello():
    return {
        "description": "Hi, what can I do for you today?"
    }

# Define the agent itself, giving it a name and description.
# The agent will automatically use the tools you provide in the list.
root_agent = Agent(
    name="greeting_agent",
    model="gemini-2.0-flash",
    description="An agent that can greet users.",
    instruction="""
    Use say_hello tool to greet user
    """,
    tools=[say_hello],
)
```

Make sure to expose agent under `__init__.py` under `src/agents/greeting_agent/__init__.py`

```python
from . import agent
```

Once you save this file, the next time you run the application, a new "Greeting Agent" will automatically appear in the UI, ready to be used.

---

## 🐞 Reporting Issues and Feature Requests

We welcome your contributions! If you encounter a bug or have an idea for a new feature, the best way to let us know is by opening an issue on our GitHub repository.

All bug reports and enhancement requests can be raised directly on the **[GitHub Issues page](https://github.com/muralimanoharv/material-ai/issues)**.

* **For Bug Reports:** When reporting a bug, please include a clear title, a detailed description of the problem, steps to reproduce it, and what you expected to happen.
* **For Feature Requests:** If you're proposing an enhancement, please describe the problem you're trying to solve and provide a clear explanation of the desired functionality.

We appreciate you taking the time to help improve Material AI!
