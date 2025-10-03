from .internal import StatusCodeAndDetail



""" This module contains custom exceptions. """
class ConfigError(Exception):
    pass

class UserResponseError(StatusCodeAndDetail):
    """Response for a failed user login, including a status code and detail."""
    pass

class AuthorizationError(StatusCodeAndDetail):
    """Response for a failed user login, including a status code and detail."""
    pass