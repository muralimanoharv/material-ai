## Sports Analytics Pipeline Agent

This sophisticated agent architecture uses a **Sequential Pipeline** to bridge the gap between raw database records and high-fidelity UI components. It automates the entire flow from natural language querying to professional dashboard design.

---

### System Architecture

The agent is composed of three specialized layers:

1.  **Data Retriever (`Nl2SqlAgent`)**:
    *   **Engine**: Connects to a SQLite sports database.
    *   **Logic**: Converts natural language into optimized SQL. 
    *   **Constraints**: Enforces specific casing for aggregations (e.g., `COUNT(*)`) and provides high-level data summaries in plain text.

2.  **UI Formatter (`MaiAgent`)**:
    *   **Role**: Senior UI Architect.
    *   **Function**: Transforms raw data into structured React dashboard layouts.
    *   **Design Tokens**: Implements a "Metric Card" aesthetic with a strong focus on visual hierarchy, grid spacing, and conditional rendering (Charts vs. Info Boxes).

3.  **Orchestrator (`SequentialAgent` & `Agent`)**:
    *   **Pipeline**: Chains the retriever and formatter so data flows seamlessly from SQL output to UI input.
    *   **Context Extraction**: The root agent parses user intent to identify both the analytical query and the desired aesthetic theme (e.g., "Cyberpunk", "Dark Mode").

---

### Key Technical Features

*   **Multi-Database Support:** Configured for BigQuery, PostgreSQL, and SQLite.
*   **Domain-Specific Constraints:** Includes specialized logic for user data, such as strictly defined gender categories.
*   **Intelligent Visualization:** Automatically decides between charts or metric boxes based on the data structure and user preference.
*   **Clean Output:** The root agent is strictly instructed to suppress internal logs and SQL reasoning, returning only the final JSON structure for the UI.

---

### Example Interaction

> **User:** "Show me the distribution of favorite sports as a pie chart in a dark mode theme."

**The Pipeline Process:**
1.  `data_retriever` queries `sports_analytics.db` for sport counts.
2.  `ui_formatter` receives the counts and designs a Dark Mode layout with a `pie` chart.
3.  `root_agent` delivers the final Markdown JSON for your frontend to render.

---

### Configuration Summary

| Component | Responsibility |
| :--- | :--- |
| **Model** | `gemini-3-flash-preview` |
| **Primary Tool** | `Nl2SqlAgent` (SQL Generation) |
| **UI Framework** | Material UI / React Design Patterns |
| **Output Type** | Structured JSON for Dashboard Rendering |

