## Vector Space Specialist Agent

This agent is a mathematical visualization tool designed to map linguistic relationships into a 2D coordinate system. It leverages Pydantic for strict schema validation, ensuring that every response is a structured `VectorGraph` ready for frontend rendering.

---

### Core Functionality

The `vector_agent` acts as a bridge between semantic meaning and geometric representation. It performs three primary tasks:

1.  **Semantic Embedding:** Projects words onto a 2D plane ($[0.0, 1.0]$) where Euclidean distance correlates with semantic similarity.
2.  **Graph Generation:** Identifies nodes (words) and establishes connections (relationships) based on user queries.
3.  **Strict JSON Output:** Uses a defined `output_schema` to guarantee that every response contains valid `nodes` and `connections` arrays.

---

### Data Models

The agent utilizes **Pydantic** models to enforce the following structure:

*   **Node:** Represents a word in space with `x`, `y` coordinates and a `label`.
*   **Connection:** Defines a relationship between two coordinates. It uses an alias to support the reserved keyword `from` in the JSON output.
*   **VectorGraph:** The root container holding lists of all nodes and their respective connections.

---

### Mapping Logic

The agent follows specific behavioral rules to maintain spatial consistency:

*   **Proximity Rules:** Synonyms or related concepts (e.g., "Apple" and "Banana") are assigned numerically close coordinates.
*   **Relationship Mapping:** When asked for similarities or distances, the agent dynamically populates the `connections` list to visually link the relevant nodes.
*   **Top-N Analysis:** For "related words" queries, it draws a star-graph pattern from the target word to its nearest neighbors.

---

### Implementation Details

| Property | Value |
| :--- | :--- |
| **Model** | `gemini-2.0-flash` |
| **Output Format** | Structured JSON (via `output_schema`) |
| **Coordinate Space** | 2D Float ($0.0$ to $1.0$) |
| **Validation** | Pydantic v2 |

---

### Usage Example

To interact with the agent, provide prompts that require spatial reasoning:
*   *"Map the relationship between 'King', 'Queen', 'Man', and 'Woman'."*
*   *"Show me the 3 closest words to 'Quantum Physics' in a 2D space."*