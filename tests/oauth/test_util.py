import unittest
import httpx
from unittest.mock import Mock, patch
from json import JSONDecodeError

# Import the code to be tested
# Ensure this path matches your file/module structure
from material_ai.oauth.util import (
    response_json_or_text,
    handle_httpx_errors,
    OAuthErrorResponse,
)


class TestResponseJsonOrText(unittest.TestCase):
    """Tests the synchronous helper function."""

    def test_with_valid_json(self):
        """Should return a dictionary when response body is valid JSON."""
        mock_response = Mock(spec=httpx.Response)
        mock_response.json.return_value = {"key": "value"}
        result = response_json_or_text(mock_response)
        self.assertEqual(result, {"key": "value"})
        mock_response.json.assert_called_once()

    def test_with_invalid_json_or_text(self):
        """Should return raw text when response body is not valid JSON."""
        mock_response = Mock(spec=httpx.Response)
        mock_response.json.side_effect = JSONDecodeError("msg", "doc", 0)
        mock_response.text = "This is plain text"
        result = response_json_or_text(mock_response)
        self.assertEqual(result, "This is plain text")
        mock_response.json.assert_called_once()


#
# --- THE FIX IS HERE ---
# Changed unittest.TestCase to unittest.IsolatedAsyncioTestCase
#
class TestHandleHttpxErrorsDecorator(unittest.IsolatedAsyncioTestCase):
    """Tests the @handle_httpx_errors decorator for async functions."""

    async def test_no_error_returns_original_result(self):
        """The decorator should return the function's result when no error occurs."""
        expected_result = {"access_token": "12345"}

        @handle_httpx_errors(url="Test API")
        async def successful_api_call(self):
            return expected_result

        result = await successful_api_call(Mock())
        self.assertEqual(result, expected_result)

    @patch("material_ai.oauth.util._logger")
    async def test_handles_request_error(self, mock_logger):
        """Should catch httpx.RequestError and return a 400 response."""

        @handle_httpx_errors(url="Test API")
        async def api_call_with_request_error(self):
            raise httpx.RequestError("Connection failed", request=Mock())

        result = await api_call_with_request_error(Mock())
        self.assertIsInstance(result, OAuthErrorResponse)
        self.assertEqual(result.status_code, 400)
        self.assertEqual(result.detail, "Upstream OAuth Error")
        mock_logger.error.assert_called_once()

    @patch("material_ai.oauth.util._logger")
    async def test_handles_http_status_error_with_json_detail(self, mock_logger):
        """Should catch httpx.HTTPStatusError and use its JSON response as detail."""
        mock_response = Mock(spec=httpx.Response)
        mock_response.status_code = 403
        mock_response.json.return_value = {"error": "permission_denied"}
        error = httpx.HTTPStatusError(
            "Forbidden", request=Mock(), response=mock_response
        )

        @handle_httpx_errors(url="Test API")
        async def api_call_with_status_error(self):
            raise error

        result = await api_call_with_status_error(Mock())
        self.assertIsInstance(result, OAuthErrorResponse)
        self.assertEqual(result.status_code, 403)
        self.assertEqual(result.detail, {"error": "permission_denied"})
        mock_logger.warning.assert_called_once()

    @patch("material_ai.oauth.util._logger")
    async def test_handles_http_status_error_with_text_detail(self, mock_logger):
        """Should catch httpx.HTTPStatusError and use its text response as detail."""
        mock_response = Mock(spec=httpx.Response)
        mock_response.status_code = 502
        mock_response.json.side_effect = JSONDecodeError("msg", "doc", 0)
        mock_response.text = "Bad Gateway"
        error = httpx.HTTPStatusError(
            "Server Error", request=Mock(), response=mock_response
        )

        @handle_httpx_errors(url="Test API")
        async def api_call_with_status_error(self):
            raise error

        result = await api_call_with_status_error(Mock())
        self.assertIsInstance(result, OAuthErrorResponse)
        self.assertEqual(result.status_code, 502)
        self.assertEqual(result.detail, "Bad Gateway")
        mock_logger.warning.assert_called_once()

    @patch("material_ai.oauth.util._logger")
    async def test_handles_generic_http_error(self, mock_logger):
        """Should catch generic httpx.HTTPError and return a 500 response."""

        @handle_httpx_errors(url="Test API")
        async def api_call_with_http_error(self):
            raise httpx.HTTPError("Some generic HTTP error")

        result = await api_call_with_http_error(Mock())
        self.assertIsInstance(result, OAuthErrorResponse)
        self.assertEqual(result.status_code, 500)
        self.assertEqual(result.detail, "Internal Server Error")
        mock_logger.error.assert_called_once()

    @patch("material_ai.oauth.util._logger")
    async def test_handles_json_decode_error(self, mock_logger):
        """Should catch JSONDecodeError and return a 401 response."""

        @handle_httpx_errors(url="Test API")
        async def api_call_with_json_error(self):
            raise JSONDecodeError("msg", "doc", 0)

        result = await api_call_with_json_error(Mock())
        self.assertIsInstance(result, OAuthErrorResponse)
        self.assertEqual(result.status_code, 401)
        self.assertEqual(result.detail, "Response token JSON decode error")
        mock_logger.error.assert_called_once()

    @patch("material_ai.oauth.util._logger")
    async def test_handles_key_error(self, mock_logger):
        """Should catch KeyError and return a 401 response."""

        @handle_httpx_errors(url="Test API")
        async def api_call_with_key_error(self):
            data = {"wrong_key": "123"}
            # This line will raise a KeyError
            return data["access_token"]

        result = await api_call_with_key_error(Mock())
        self.assertIsInstance(result, OAuthErrorResponse)
        self.assertEqual(result.status_code, 401)
        self.assertEqual(result.detail, "Response token missing access_token")
        mock_logger.error.assert_called_once()


if __name__ == "__main__":
    unittest.main()
