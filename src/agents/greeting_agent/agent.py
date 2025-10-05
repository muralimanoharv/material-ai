from google.adk.agents import Agent


def say_hello():
    return {"description": "Hi, what can I do for you today?"}


# Define the agent itself, giving it a name and description.
# The agent will automatically use the tools you provide in the list.
root_agent = Agent(
    name="greeting_agent",
    model="gemini-2.0-flash",
    description="An agent that can greet users.",
    instruction="""
    Use say_hello tool to greet user
    """,
    tools=[say_hello],
)
