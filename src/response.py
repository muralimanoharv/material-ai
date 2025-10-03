import pydantic
from .internal import UserDetail
from typing import Any


class UserSuccessResponse(pydantic.BaseModel):
    """Response for a successful user login.

    Attributes:
        user_response: Contains details about the logged-in user.
    """
    user_response: UserDetail


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