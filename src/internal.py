import pydantic
from typing import Any

class StatusCodeAndDetail(pydantic.BaseModel):
    """Represents a model for status codes and corresponding details.

    Used to encapsulate a status code and additional detail information.
    Primarily intended for scenarios where a status response with optional
    details needs to be represented.

    Attributes:
        status_code (int): The numerical status code typically following standard protocol or custom definitions.
        detail (str | dict[Any, Any]): The detailed information associated with the status code. Can be a string
            or a dictionary containing additional contextual data.
    """
    status_code: int
    detail: str | dict[Any, Any]

class UserDetail(pydantic.BaseModel):
    sub: str
    name: str
    given_name: str
    family_name: str
    picture: str
    email: str
    email_verified: bool