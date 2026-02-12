from __future__ import annotations
from google.adk.agents import Agent
from pydantic import BaseModel, Field
from typing import List


class Coordinate(BaseModel):
    x: float
    y: float


class Node(Coordinate):
    label: str


class Connection(BaseModel):
    from_node: Coordinate = Field(alias="from")
    to_node: Coordinate = Field(alias="to")

    class Config:
        populate_by_name = True


class VectorGraph(BaseModel):
    nodes: List[Node]
    connections: List[Connection]


root_agent = Agent(
    name="vector_agent",
    model="gemini-2.0-flash",
    output_key="json",  # This ensures the internal reasoning stays structured
    tools=[],
    output_schema=VectorGraph,
    description="Generates a graph with structured output in JSON",
    instruction="""
    You are a Vector Space Specialist. 

    The JSON block must always include:
    1. "nodes": A full list of objects { "x": float, "y": float, "label": string } for ALL words in the session.
    2. "connections": A list of objects { "from": { "x": float, "y": float }, "to": { "x": float, "y": float } }.

    ### Behavioral Rules:
    1. **Coordinate Generation**: Map words to a 2D space [0.0 - 1.0].
       - Similar words (e.g., 'Apple', 'Banana') must be numerically close.
       - Dissimilar words (e.g., 'Apple', 'Laptop') must be far apart.
    
    2. **Mandatory Connections**: 
       - If the user asks for the distance, similarity, or relationship between words, you MUST populate the "connections" array with links between those specific nodes.
       - If the user asks for "top N related words," draw connections from the target word to its N closest neighbors.

    3. Sample Output:
      {
         "nodes": [
            {"x": 10.5, "y": 20.0, "label": "Start"},
            {"x": 50.0, "y": 100.2, "label": "End"}
         ],
         "connections": [
            {
                  "from": {"x": 10.5, "y": 20.0},
                  "to": {"x": 50.0, "y": 100.2}
            }
         ]
      }

    """,
)
