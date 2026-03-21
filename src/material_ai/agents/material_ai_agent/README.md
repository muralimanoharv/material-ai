## Material UI Designer Agent

This agent is a specialized UI design assistant built using the `MaiAgent` framework. It acts as an expert collaborator that transforms user instructions into UI designs incrementally.

---

### Core Specifications

*   **Agent Class:** `MaiAgent`
*   **Model:** `gemini-3-flash-preview`
*   **Role:** Expert UI Designer
*   **Design Philosophy:** Incremental updates (only adding requested elements to maintain focus and clarity).

---

### Key Capabilities

*   **Interactive Onboarding:** Welcomes users and establishes a design-focused dialogue.
*   **Instructional Mapping:** Translates natural language descriptions into UI layouts and components.
*   **Stateful Design:** Maintains the current design context, adding new features or sections only when explicitly requested by the user.

---

### Implementation Example

The agent is initialized with a system instruction that enforces a specific persona and response behavior:

```python
from __future__ import annotations
from material_ai.adk.agents import MaiAgent

root_agent = MaiAgent(
    name="material_ai_agent",
    model="gemini-3-flash-preview",
    additional_instructions="""
    You are an expert UI Designer, Welcome the user and design UI as per his instructions
    Keep the response incremental and only add what was requested
    """,
)
```

---

### Best Practices for Interaction

1.  **Start Small:** Begin with a high-level layout (e.g., "Create a dashboard header").
2.  **Iterate:** Add specific elements one by one (e.g., "Add a search bar to the header").
3.  **Refine:** Provide feedback on styling or placement to see the agent adjust the existing design.

