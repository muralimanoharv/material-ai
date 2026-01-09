import abc
import logging
from sqlalchemy import create_engine, text, Engine, inspect
from typing import List, Dict, Any
from .base import ColumnSchema, JoinHint, TableSchema


# Configure service-specific logger
logger = logging.getLogger("sports_analytics.db_service")


class DatabaseService(abc.ABC):
    """
    Service for interacting with a relational database.

    This class provides high-level tools for database discovery and data
    retrieval, intended for use by autonomous AI agents.
    """

    engine: Engine = None

    def __init__(self, db_url: str):
        """
        Initializes the database connection engine.

        Args:
            db_url (str): The database connection URL (e.g., 'sqlite:///data.db').
        """
        self.engine = create_engine(db_url)
        logger.info(f"DatabaseService initialized with URL: {db_url}")

    async def execute_sql_query(self, sql_query: str) -> List[Dict[str, Any]]:
        """
        Executes a raw SQL SELECT query and returns the dataset.

        Args:
            sql_query (str): A valid SQLite SELECT statement.
                             Must not contain destructive commands.

        Returns:
            List[Dict[str, Any]]: A list of rows where each row is a dictionary
                                  mapping column names to values.
        """
        logger.info(f"Executing SQL Query: {sql_query}")
        try:
            with self.engine.connect() as connection:
                result = connection.execute(text(sql_query))
                columns = result.keys()
                data = [dict(zip(columns, row)) for row in result.fetchall()]

                logger.info(f"Query successful. Rows returned: {len(data)}")
                return data
        except Exception as e:
            logger.error(f"SQL Execution Error: {str(e)} | Query: {sql_query}")
            return [{"error": f"Failed to execute query: {str(e)}"}]

    async def list_available_tables(self) -> List[str]:
        """
        Retrieves a list of all table names available in the database.

        Returns:
            List[str]: A list of strings containing the names of all tables.
        """
        logger.info("Attempting to list all available tables...")
        try:
            inspector = inspect(self.engine)
            tables = inspector.get_table_names()
            logger.info(f"Tables found: {tables}")
            return tables
        except Exception as e:
            logger.error(f"Error listing tables: {str(e)}")
            return [f"Error listing tables: {str(e)}"]

    async def get_table_schema(self, table_name: str) -> TableSchema:
        """
        Reflects the database at runtime to provide a detailed schema.

        No predefined SQLAlchemy models are required. This method inspects
        the live database to extract columns, types, and constraints.

        Args:
            table_name (str): The exact name of the SQL table to inspect.

        Returns:
            TableSchema: A Pydantic model containing the table name,
                        column metadata (including Enums), and join hints.
        """
        try:
            # 1. Initialize the inspector on your engine
            inspector = inspect(self.engine)

            # 2. Extract column metadata
            columns = inspector.get_columns(table_name)
            columns_data = []

            for col in columns:
                # Dynamically identify allowed values (Enums/Constraints)
                # Note: Reflection for CheckConstraints varies by DB dialect
                allowed = None
                if "options" in col:  # Some dialects store Enum options here
                    allowed = col["options"]

                columns_data.append(
                    ColumnSchema(
                        name=col["name"],
                        type=str(col["type"]),
                        nullable=col.get("nullable", True),
                        allowed_values=allowed,
                        instruction=(
                            f"Restrict values to {allowed}" if allowed else None
                        ),
                    )
                )

            # 3. Extract Foreign Key relations for Joins
            fks = inspector.get_foreign_keys(table_name)
            join_hints = []
            for fk in fks:
                referenced_table = fk["referred_table"]
                # Map local columns to remote columns
                for local, remote in zip(
                    fk["constrained_columns"], fk["referred_columns"]
                ):
                    join_hints.append(
                        JoinHint(
                            local_column=local,
                            referenced_table=referenced_table,
                            referenced_column=remote,
                            join_condition=f"{table_name}.{local} = {referenced_table}.{remote}",
                        )
                    )

            # 4. Return as Pydantic for the LLM
            schema = TableSchema(
                table_name=table_name, columns=columns_data, join_hints=join_hints
            )
            return schema

        except Exception as e:
            return f"Error reflecting table '{table_name}': {str(e)}"
