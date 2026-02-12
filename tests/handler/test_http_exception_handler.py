import unittest
from unittest.mock import patch
from fastapi import FastAPI, HTTPException
from fastapi.testclient import TestClient
from material_ai.handler.http_exception_handler import http_exception_handler


class TestHTTPExceptionHandler(unittest.TestCase):
    def setUp(self):
        # Setup a dummy FastAPI app to trigger the handler
        self.app = FastAPI()
        self.app.add_exception_handler(HTTPException, http_exception_handler)

        @self.app.get("/test-error")
        async def error_route(status_code: int):
            raise HTTPException(status_code=status_code)

        self.client = TestClient(self.app)

    @patch("material_ai.handler.http_exception_handler._remove_cookies")
    def test_401_unauthorized_clears_cookies(self, mock_remove_cookies):
        """Tests that 401 triggers cookie removal and returns 'Unauthorized'."""
        response = self.client.get("/test-error", params={"status_code": 401})

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.text, "Unauthorized")
        mock_remove_cookies.assert_called_once()

    @patch("material_ai.handler.http_exception_handler._remove_cookies")
    def test_other_exceptions_do_not_clear_cookies(self, mock_remove_cookies):
        """Tests that status codes other than 401 do not trigger cookie removal."""
        response = self.client.get("/test-error", params={"status_code": 403})

        self.assertEqual(response.status_code, 403)
        mock_remove_cookies.assert_not_called()
