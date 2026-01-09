from sqlalchemy.orm import DeclarativeBase
import json
from pydantic import BaseModel
from typing import List, Optional


class ColumnSchema(BaseModel):
    name: str
    type: str
    nullable: bool
    allowed_values: Optional[List[str]] = None
    instruction: Optional[str] = None
    additional_instructions: Optional[str] = None


class JoinHint(BaseModel):
    local_column: str
    referenced_table: str
    referenced_column: str
    join_condition: str


class TableSchema(BaseModel):
    table_name: str
    columns: List[ColumnSchema]
    join_hints: List[JoinHint]


class Nl2SqlBase(DeclarativeBase):
    """Base class for declarative class definitions with LLM-optimized schema generation."""

    @classmethod
    def generate_llm_schema(cls) -> TableSchema:
        """
        Generates a Pydantic TableSchema including column types, Enums,
        and Foreign Key join conditions for LLM grounding.

        Returns:
            TableSchema: A validated Pydantic model containing table metadata.
        """
        table = cls.__table__

        # 1. Process Columns and Value Constraints
        columns_data = []
        for column in table.columns:
            # Handle Enums for the M/F mapping logic
            enums = getattr(column.type, "enums", None)

            columns_data.append(
                ColumnSchema(
                    name=column.name,
                    type=str(column.type),
                    nullable=column.nullable,
                    allowed_values=list(enums) if enums else None,
                    instruction=(
                        f"Use only values from {list(enums)} for this column."
                        if enums
                        else None
                    ),
                )
            )

        # 2. Process Relational Constraints (Joins)
        join_hints_data = []
        for fk in table.foreign_keys:
            join_hints_data.append(
                JoinHint(
                    local_column=fk.parent.name,
                    referenced_table=fk.column.table.name,
                    referenced_column=fk.column.name,
                    join_condition=f"{table.name}.{fk.parent.name} = {fk.column.table.name}.{fk.column.name}",
                )
            )

        return TableSchema(
            table_name=table.name, columns=columns_data, join_hints=join_hints_data
        )
