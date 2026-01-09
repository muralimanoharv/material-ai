from google.adk.agents import LlmAgent
from typing import List, Dict, Any
from .db import DatabaseService
from .base import TableSchema


class Nl2SqlAgent(LlmAgent):
    def __init__(
        self,
        name: str,
        db_url: str,
        model: str,
        description: str = "",
        additional_column_instructions: Dict[str, Dict[str, str]] = {},
        additional_instructions: str = "",
    ):
        db_service = DatabaseService(db_url)

        async def get_tables() -> List[str]:
            """
            Retrieves a list of all table names available in the database.

            Returns:
                List[str]: A list of strings containing the names of all tables.
            """
            tables = await db_service.list_available_tables()
            return tables

        async def get_schema(table_name: str) -> TableSchema:
            """
            Provides the detailed column structure for a specific table.

            Args:
                table_name (str): The exact name of the table to inspect.

            Returns:
                TableSchema: A Pydantic model containing the table name,
                        column metadata (including Enums), and join hints.
            """
            schema: TableSchema = await db_service.get_table_schema(table_name)
            for table in additional_column_instructions:
                if table != schema.table_name:
                    continue
                for column in schema.columns:
                    if column.name in additional_column_instructions[table]:
                        column.additional_instructions = additional_column_instructions[
                            table
                        ][column.name]

            return schema

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
            return results

        discovery_instruction = f"""
        You are an expert SQL Data Analyst. To answer any user query accurately, 
        you MUST follow this strict 4-step sequence:



        STEP 1: DISCOVER TABLES
        - Call `get_tables` to list all available tables in the database.
        - If there are no tables go back to parent agent and inform you were not able to 
          find any tables
        
        STEP 2: CORRELATE & SELECT
        - Analyze the user's query and the table list to identify which table 
          is most relevant. For example, if they ask about fans, correlate 
          that to the 'attendees' table.

        STEP 3: INSPECT SCHEMA
        - Call `get_schema` for the selected table to see its exact columns and data types. Never guess a column name.
        ### SCHEMA ADHERENCE RULES:
        1. **Value Mapping**: For every column in your WHERE clause, check the 'allowed_values' list in the schema. You MUST use one of those specific values. If there is no allowed_values simply query directly from the table.
        2. **Relational Joins**: If a query requires data from multiple tables, look at the 'join_hints' section. Use the exact 'join_condition' provided to link the tables.
        3. **Column Verification**: Never guess a column name. Only use names found in the 'columns' list of the schema.

        STEP 4: GENERATE & EXECUTE
        - Write a valid SQLite query using the verified schema.
        - Call the `query` method to execute it and return the results.

        CRITICAL: Only respond after you got the resutls from `query` method, Do 
        not return any response in between, If you got any error you can go back to root agent and inform the same

        {additional_instructions}
        """

        super().__init__(
            name=name,
            model=model,
            instruction=discovery_instruction,
            description=description,
            tools=[get_tables, get_schema, query],
        )
