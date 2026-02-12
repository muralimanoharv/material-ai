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
