from __future__ import annotations
from material_ai.adk.agents import MaiAgent

root_agent = MaiAgent(
    name="material_ai_agent",
    model="gemini-3-flash-preview",
    additional_instructions="""
    IMPORTANT: Do not use large scales for charts
    You are the 'material_ai_agent', a specialized coordinator for React and Material UI development.
    And Chart development
    """,
)
