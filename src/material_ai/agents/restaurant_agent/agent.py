import json
from google.adk.agents.llm_agent import Agent
from google.adk.tools.tool_context import ToolContext
from a2ui.schema.constants import VERSION_0_8, VERSION_0_9
from a2ui.schema.manager import A2uiSchemaManager
from a2ui.basic_catalog.provider import BasicCatalog
from a2ui.schema.common_modifiers import remove_strict_validation

SELECTED_VERSION = VERSION_0_8  # Use VERSION_0_9 for newer protocol


def get_restaurants(tool_context: ToolContext) -> str:
    """Call this tool to get a list of restaurants."""
    return json.dumps(
        [
            {
                "name": "Xi'an Famous Foods",
                "detail": "Spicy and savory hand-pulled noodles.",
                "imageUrl": "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                "rating": "★★★★☆",
                "infoLink": "[More Info](https://www.xianfoods.com/)",
                "address": "81 St Marks Pl, New York, NY 10003",
            },
            {
                "name": "Han Dynasty",
                "detail": "Authentic Szechuan cuisine.",
                "imageUrl": "https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                "rating": "★★★★☆",
                "infoLink": "[More Info](https://www.handynasty.net/)",
                "address": "90 3rd Ave, New York, NY 10003",
            },
            {
                "name": "RedFarm",
                "detail": "Modern Chinese with a farm-to-table approach.",
                "imageUrl": "https://images.unsplash.com/photo-1525351484163-7529414344d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                "rating": "★★★★☆",
                "infoLink": "[More Info](https://www.redfarmnyc.com/)",
                "address": "529 Hudson St, New York, NY 10014",
            },
        ]
    )


# Define your agent's role
ROLE_DESCRIPTION = (
    "You are a helpful restaurant finding assistant. Your final output MUST be a a2ui"
    " UI JSON response."
)

# Define rules for when to use which UI template
UI_DESCRIPTION = """
-   If the query is for a list of restaurants, use the restaurant data you have already received from the `get_restaurants` tool to populate the `dataModelUpdate.contents` (v0.8) or `updateDataModel.value` (v0.9+) object (e.g., for the "items" key).
-   If the number of restaurants is 5 or fewer, you MUST use the `SINGLE_COLUMN_LIST_EXAMPLE` template.
-   If the number of restaurants is more than 5, you MUST use the `TWO_COLUMN_LIST_EXAMPLE` template.
-   If the query is to book a restaurant (e.g., "USER_WANTS_TO_BOOK..."), you MUST use the `BOOKING_FORM_EXAMPLE` template.
-   If the query is a booking submission (e.g., "User submitted a booking..."), you MUST use the `CONFIRMATION_EXAMPLE` template.
"""

# Initialize the schema manager with the Basic Catalog
schema_manager = A2uiSchemaManager(
    version=SELECTED_VERSION,
    catalogs=[
        BasicCatalog.get_config(
            version=SELECTED_VERSION, examples_path=f"examples/{SELECTED_VERSION}"
        )
    ],
    schema_modifiers=[remove_strict_validation],
)

# Generate the full system prompt
A2UI_AND_AGENT_INSTRUCTION = schema_manager.generate_system_prompt(
    role_description=ROLE_DESCRIPTION,
    ui_description=UI_DESCRIPTION,
    include_schema=True,
    include_examples=True,
    validate_examples=True,
)

# A2UI_AND_AGENT_INSTRUCTION = A2UI_AND_AGENT_INSTRUCTION.replace(
#     "{expression}", "{-expression-}"
# )

root_agent = Agent(
    model="gemini-3.5-flash",
    name="restaurant_agent",
    description="An agent that finds restaurants and helps book tables using A2UI.",
    instruction=A2UI_AND_AGENT_INSTRUCTION,
    tools=[get_restaurants],
)
