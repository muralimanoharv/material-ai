from google.adk.agents import LlmAgent
from typing import List, Dict, Any
from typing import Optional, Mapping
from pydantic import RootModel
from .db import DatabaseService
from .base import TableSchema


class Nl2SqlAgent(LlmAgent):
    """
    A specialized Nl2SQL Agent
    """

    def __init__(
        self,
        name: str,
        db_url: str,
        model: str,
        description: str = "",
        limit: int = 1000,
        additional_column_instructions: Dict[str, Dict[str, str]] = {},
        additional_instructions: str = "",
        agent_kwargs: Optional[Mapping[str, Any]] = {},
    ):
        db_service = DatabaseService(db_url)

        async def get_tables() -> List[str] | str:
            """
            Retrieves a list of all table names available in the database.

            Returns:
                List[str]: A list of strings containing the names of all tables.
            """
            tables = await db_service.list_available_tables()
            return tables

        async def get_schema(tables: List[str]) -> List[dict]:
            """
            Provides the detailed column structure for a specific table.

            Args:
                tables (List[str]): list of tables for which schema is retrieved

            Returns:
                List[dict]: A List Pydantic model containing the table name,
                        column metadata (including Enums), and join hints for each table.
            """
            schemas: List[TableSchema] = []
            for table_name in tables:
                schema: TableSchema = await db_service.get_table_schema(table_name)
                for table in additional_column_instructions:
                    if table != schema.table_name:
                        continue
                    for column in schema.columns:
                        if column.name in additional_column_instructions[table]:
                            column.additional_instructions = (
                                additional_column_instructions[table][column.name]
                            )
                schemas.append(schema)
            return schemas

        def universal_serializer(data: List[Dict[str, Any]]) -> Any:
            """
            Uses Pydantic to convert virtually any Python/Postgres type
            (UUID, Decimal, Datetime, IPAddress, etc.) into a JSON-safe format.
            """
            # RootModel(Any) creates a wrapper that can parse any structure
            return RootModel[Any](data).model_dump(mode="json")

        async def query(sql_query: str) -> List[Dict[str, Any]]:
            """
            Executes a raw SQL SELECT query and returns the dataset.

            Args:
                sql_query (str): A valid SQLite SELECT statement.
                                Must not contain destructive commands.

            Returns:
                List[Dict[str, Any]]: A list of rows where each row is a dictionary
                                    mapping column names to values.
            """
            results = await db_service.execute_sql_query(sql_query)
            return universal_serializer(results)

        discovery_instruction = f"""
        You are an expert SQL Data Analyst. To answer any user query accurately, 
        you MUST follow this strict 4-step sequence:

        STEP 1: DISCOVER TABLES
        - Call `get_tables` to list all available tables in the database.
        - If there are no tables go back to parent agent and inform you were not able to 
          find any tables
        
        STEP 2: RETRIEVE SCHEMA
        - Take the full list of table names identified in STEP 1.
        - Pass this entire list as an argument to the 'get_schema' tool to retrieve the definitions for all relevant tables in a single call.
        - Analyze the returned schema to identify column names, data types, and primary/foreign key relationships.
        - Use these structural details to determine how to join tables and filter data for the user's specific request.
            ### SCHEMA ADHERENCE RULES:
            1. **Value Mapping**: For every column in your WHERE clause, check the 'allowed_values' list in the schema. You MUST use one of those specific values. If there is no allowed_values, query directly from the table.
            2. **Relational Joins**: If a query requires data from multiple tables, look at the 'join_hints' section. Use the exact 'join_condition' provided to link the tables.
            3. **Column Verification**: Never guess a column name. Only use names found in the 'columns' list of the schema.
            
        STEP 3: IDENTIFY RELEVANT TABLES & LOGIC
        - Review the user's request alongside the full schema retrieved in STEP 2.
        - Identify exactly which tables contain the necessary data to answer the query.
        - Determine the logical path for the query: decide if joins are required (based on 'join_hints'), which columns to select, and which filters to apply (based on 'allowed_values').
        - Formulate a plan for the SQL structure before moving to execution. 
        
        STEP 4: GENERATE & EXECUTE
        - Write a valid SQL query using the verified schema.
        - Call the `query` method to execute it and return the results.

        CRITICAL: Only respond after you got the resutls from `query` method, Do 
        not return any response in between, If you got any error you can go back to root agent and inform the same

        CRITICAL: Always Use this "{limit}" FOR any query, we never ever want to query more than this.
        IMPORTANT: WE ALWAYS WANT TO ADD LIMIT CLAUSE TO QUERY AS MENTIONED ABOVE WHATSOEVER
        {additional_instructions}
        """

        super().__init__(
            name=name,
            model=model,
            instruction=discovery_instruction,
            description=description,
            tools=[get_tables, get_schema, query],
            **agent_kwargs,
        )
