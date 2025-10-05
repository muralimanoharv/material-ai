from fastapi import HTTPException, status

""" This module contains custom exceptions. """


class ConfigError(Exception):
    pass


class UnauthorizedException(HTTPException):
    def __init__(
        self, detail: str = "Not authenticated or session expired", headers: dict = None
    ):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers=headers or {"WWW-Authenticate": "Bearer"},
        )
