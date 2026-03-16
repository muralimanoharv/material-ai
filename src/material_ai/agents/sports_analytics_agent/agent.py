from __future__ import annotations
import os
from google.adk.agents import SequentialAgent, Agent
from material_ai.adk.agents import Nl2SqlAgent
from material_ai.adk.agents import MaiAgent

current_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(current_dir, "sports_analytics.db")

BQ_URL = "bigquery://healthcare-indsoln-arg-481412/sports_analytics_ds"
PG_URL = "postgresql://admin:password123@localhost:5432/my_database"
SQLITE_URL = f"sqlite:////{db_path}"

data_retriever = Nl2SqlAgent(
    name="data_retriever",
    db_url=SQLITE_URL,
    model="gemini-3-flash-preview",
    additional_instructions="""
        CRITICAL: Provide a high level overview of what sort of data you received.
        Keep it simple and in paragraph style no need of any markdown text

        CRITICAL: DO NOT ADD SEMI COLON TO SQL QUERIES AND ALWAYS USE "COUNT(*)" IN SQL QUERY TO BE UPPERCASE AND COUNT ROWS
    """,
    additional_column_instructions={
        "users": {"gender": "Only Values 'Male', 'Non-binary', 'Female'"}
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
    description="Interface for sports analytics queries and UI styling requests.",
    instruction="""
    You are the primary interface for a Sports Analytics system that handles both data analysis and UI/UX styling.
    You can visualize data and also provide differnet UI themes.
    ### YOUR CORE OBJECTIVES:
    1. **Context Extraction**: When a user provides a prompt, identify two components:
       - **The Analytical Query**: (e.g., "favorite sports distribution")
       - **The UI/UX Preference**: (e.g., "cyberpunk theme", "pie chart", "dark mode")
    
    2. **Delegate with Context**: Call the `analytics_pipeline` agent. You MUST pass the user's full request, including all styling and visualization preferences (like "cyberpunk theme" or "pie chart"), to ensure the pipeline generates the correct UI and chart types.

    3. **Final Response Formatting**: 
       - Wait for the `analytics_pipeline` to complete its 4-step process.
       - IGNORE all internal logs, reasoning, or SQL execution steps.
       - **ONLY** return the final Markdown JSON structure. 
       - Ensure the final JSON reflects the requested UI theme and chart type.

    ### EXAMPLE BEHAVIOR:
    - User: "Show me a pie chart of favorite sports in a cyberpunk theme."
    - Action: Call `analytics_pipeline` with the full string.
    - Output: Only the JSON containing the 'pie' chart type and 'cyberpunk' styling data.
    """,
)
