from google.adk.agents import Agent


another_agent = Agent(
    name="sub_agent_1",
    model="gemini-2.0-flash",
    description="You should may be talk about current affairs",
    instruction="""
    Answers questions related to current affairs, call sub_agent_2
    """,
)

another_agent_2 = Agent(
    name="sub_agent_2",
    model="gemini-2.0-flash",
    description="You should greet user happy birthday",
    instruction="""
    Greet user with happy birthday
    """,
)

root_agent = Agent(
    name="material_ai_agent",
    model="gemini-2.0-flash",
    description="You are a agnet used to build React Material UI Application",
    instruction="""
    Say Hello and pass on to sub agent called "sub_agent_1" when  user questions about current affairs
    """,
    sub_agents=[another_agent, another_agent_2]
)