## Greeting Agent Documentation

The Greeting Agent is a Python-based implementation using the Google ADK (Agent Development Kit). It is designed to handle basic greetings, retrieve user identity information via OAuth, manage time-delayed responses, and generate CSV artifacts.

---

### Core Functionality

This agent is equipped with several specialized tools to handle specific user intents:

*   **Standard Greeting:** Responds to general hellos and inquiries.
*   **Identity Retrieval:** Accesses user details through the `oauth_user_details_context`.
*   **Artifact Generation:** Creates and saves a sample CSV file containing ID, Name, and Role data.
*   **Delayed Response:** Simulates a 10-second wait before responding when prompted with specific keywords.
*   **Error Simulation:** Includes a dedicated tool to test error handling and exceptions.

---

### Tool Definitions

| Function | Trigger / Description |
| :--- | :--- |
| `say_hello` | Standard greeting tool. |
| `who_am_i` | Fetches authenticated user details. |
| `create_csv` | Generates `my-csv.csv` and saves it to the tool context. |
| `say_hi_10_after_seconds` | Pauses execution for 10 seconds before replying. |
| `throw_error` | Raises an exception for debugging purposes. |

---

### Configuration and Instructions

The agent uses the `gemini-3-flash-preview` model. Its system instructions prioritize:
1.  **Direct Tool Mapping:** Specific phrases trigger specific tool calls.
2.  **Output Format:** The agent is instructed to provide simple text responses without Markdown formatting.

---

### Usage Example

To initialize the agent, ensure you have the required `google.adk` and `material_ai` dependencies installed and configured with appropriate credentials.

```python
# The root_agent instance is ready to handle queries such as:
# "Hi there!" -> Calls say_hello
# "Who am I?" -> Calls who_am_i
# "Generate a csv file" -> Calls create_csv
```
