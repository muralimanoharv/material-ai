from __future__ import annotations
from google.adk.agents import SequentialAgent, Agent
from google.adk.tools import AgentTool
from material_ai.adk.agents.nl2sql import Nl2SqlAgent
from material_ai.adk.tools import MaiAgent


data_retriever = Nl2SqlAgent(
    name="data_retriever",
    db_url="sqlite:///pro_sports_analytics.db",
    model="gemini-2.0-flash",
    additional_instructions="""
        CRITICAL: Provide a high level overview of what sort of data you received.
    """,
    additional_column_instructions={
        "attendees": {
            "gender": "Only Values 'F' & 'M' are allowed, 'F' for Female, 'M' for Male."
        }
    },
    description="Specialist for querying the sports database and retrieving attendee analytics.",
)

ui_formatter = MaiAgent(
    name="ui_formatter",
    model="gemini-3-flash-preview",
    additional_instructions="""
    You are a Senior UI Architect. Your goal is to take raw sports data and describe a clean, professional layout for a React dashboard. 

    ### LAYOUT ARCHITECTURE:
    1. **Header Section:** Start with a dedicated top area for the title. The title should be prominent, bold, and clearly describe the data being shown (e.g., "Attendance Overview").
    2. **Grid Layout:** Organize the main content into a structured grid that adapts to different screen sizes. Ensure there is generous spacing between every item in the grid to avoid a cluttered look.
    3. **Information Cards:** Represent each data point inside an individual container. 
       - Place the category or label (like the City name) at the top in a smaller, subtle font.
       - Place the primary value (the number) in a much larger, high-contrast font directly below it.
    4. **Visual Depth:** Give each container a subtle shadow or border to make it stand out from the background.
    5. You also have access to charts, based on data recived decide what type of chart makes sense and output the same

    ### Important Rules:
    1. Either produce a chart or boxes, DO NOT ADD BOTH OF THEM

    ### STYLE & ELEGANCE:
    - Focus on a "Metric Card" aesthetic where the data is the hero.
    - Use clear spacing and alignment to create a strong visual hierarchy.
    - If no data is available, show a clear and helpful notification message instead of an empty screen.
    """,
)

# 3. Configure the Root Agent
analytics_pipeline = SequentialAgent(
    name="sports_analytics_pipeline",
    sub_agents=[data_retriever, ui_formatter],
    description="Chains SQL retrieval and MUI component generation.",
)

root_agent = Agent(
    name="sports_analytics_agent",
    model="gemini-3-flash-preview",
    sub_agents=[analytics_pipeline],
    description="The main interface for sports analytics queries.",
    instruction="""
    You are the public interface for the Sports Analytics system.
    
    ### YOUR TOOLBOX:
    You have access to a tool named `analytics_pipeline`. 
    This tool handles the entire process of fetching data and generating UI.

    ### YOUR JOB:
    1. **Delegate**: When the user asks a question, immediately call `analytics_pipeline`.
    2. **Passthrough**: Wait for `analytics_pipeline` to finish.
    3. **Filter**: 
       - The `analytics_pipeline` might return intermediate logs or thoughts. IGNORE THEM.
       - You must **ONLY** return the final Markdown JSON structure provided by the pipeline.
    """,
)
