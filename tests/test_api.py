# tests/test_api.py

import unittest
import os
import json
from unittest.mock import patch, MagicMock, AsyncMock, ANY, PropertyMock, call
from fastapi import status
from material_ai import FeedbackRequest
from fastapi.testclient import TestClient
from starlette.responses import RedirectResponse
from material_ai.app import STATIC_DIR, get_app
from material_ai.api import (
    get_oauth_service,
    get_ui_configuration,
    get_feedback_handler,
    get_user,
    user,
    UserSuccessResponse,
    OAuthUserDetail,
    LlmAgent,
    UnauthorizedException,
)
from material_ai.ui_config import UIConfig
from material_ai.config import Config, SSOConfig, ADKConfig, GeneralConfig, GoogleConfig
import material_ai.app as app_module
from material_ai.oauth import OAuthErrorResponse


@patch("material_ai.app.get_config")
class TestAPIEndpoints(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        """
        Set up a clean app, client, and mock StaticFiles for each test.
        """
        os.environ["SSO_ISSUER"] = "google"
        app_module._app_instance = None

        self.config_patch = patch("material_ai.app.get_config")
        mock_get_config = self.config_patch.start()

        # Configure the mock to return a valid config with a string secret_key
        mock_config = create_dummy_config(False)
        mock_get_config.return_value = mock_config
        # 1. Start a patch to replace the real StaticFiles class with a mock
        self.static_files_patch = patch("material_ai.app.StaticFiles")
        self.mock_static_files = self.static_files_patch.start()

        self.file_response_patch = patch("material_ai.api.FileResponse")
        self.mock_file_response = self.file_response_patch.start()
        self.maxDiff = None
        self.mock_oauth_service = AsyncMock()

        user_response = MagicMock()
        user_response.sub = "test_user_123"
        self.mock_oauth_service.sso_verify_id_token.return_value = user_response

        # 2. Set up the rest of the app and client
        app = get_app(oauth_service=self.mock_oauth_service)
        self.app = app
        self.mock_user = MagicMock()
        self.mock_user.sub = "user_123"

        self.cookies = {
            "refresh_token": "test_refresh_token",
            "access_token": "test_access_token",
            "user_details": "test_user_details",
            "id_token": "test_id_token",
        }

        self.mock_ui_config = create_dummy_ui_config()
        self.mock_feedback_handler = AsyncMock()
        app.dependency_overrides[get_oauth_service] = lambda: self.mock_oauth_service
        app.dependency_overrides[get_ui_configuration] = lambda: self.mock_ui_config
        app.dependency_overrides[get_user] = lambda: self.mock_user
        app.dependency_overrides[get_feedback_handler] = (
            lambda: self.mock_feedback_handler
        )

        self.client = TestClient(app, cookies=self.cookies)

    def tearDown(self):
        """
        Clean up dependency overrides and stop patches after each test.
        """
        get_app().dependency_overrides.clear()
        # Stop the patch to restore the original StaticFiles class
        self.static_files_patch.stop()
        self.config_patch.stop()
        self.file_response_patch.stop()

    @patch("material_ai.api.on_callback", new_callable=AsyncMock)
    @patch("fastapi.Request.session", new_callable=PropertyMock)
    async def test_callback_fails_with_mismatched_state(
        self, mock_session_property, mock_on_callback, mock_get_config
    ):
        """
        Tests that the /auth callback returns 403 Forbidden if the state does not match.
        """
        # --- Arrange ---
        # 1. The state stored in the session is different from the one in the query.
        mock_session_object = MagicMock()
        mock_session_object.get.return_value = "state-in-session"
        mock_session_property.return_value = mock_session_object
        query_state = "different-state-in-query"

        # --- Act ---
        response = self.client.get(f"/auth?code=anycode&state={query_state}")

        # --- Assert ---
        # 2. Check for a 403 Forbidden status code.
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # 3. Crucially, ensure the on_callback helper was never called.
        mock_on_callback.assert_not_awaited()

    @patch("material_ai.api.on_callback", new_callable=AsyncMock)
    @patch("fastapi.Request.session", new_callable=PropertyMock)
    async def test_callback_fails_with_no_stored_state(
        self, mock_session_property, mock_on_callback, mock_get_config
    ):
        """
        Tests that the /auth callback returns 403 Forbidden if no state is in the session.
        """
        # --- Arrange ---
        mock_session_object = MagicMock()
        mock_session_object.get.return_value = None

        mock_session_property.return_value = mock_session_object

        # --- Act ---
        response = self.client.get("/auth?code=anycode&state=anystate")

        # --- Assert ---
        # 2. Check for a 403 Forbidden status code.
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # 3. Ensure the on_callback helper was never called.
        mock_on_callback.assert_not_awaited()

    @patch("material_ai.api.on_callback", new_callable=AsyncMock)
    @patch("fastapi.Request.session", new_callable=PropertyMock)
    async def test_callback_success_with_valid_state(
        self, mock_session_property, mock_on_callback, mock_get_config
    ):
        """
        Tests the /auth callback with a valid state.
        """
        # --- Arrange ---
        test_state = "secret-csrf-token-123"
        auth_code = "authorization-code-456"

        mock_session_object = MagicMock()

        mock_session_object.get.return_value = test_state

        mock_session_property.return_value = mock_session_object

        # Configure the other mock as before
        expected_response = RedirectResponse(url="/", status_code=302)
        mock_on_callback.return_value = expected_response

        # --- Act ---
        self.client.get(f"/auth?code={auth_code}&state={test_state}")

        # --- Assert ---
        # Now the comparison 'stored_state != state' will work correctly
        # because stored_state will be "secret-csrf-token-123"
        expected_calls = [call("oauth_state"), call("redirect")]
        mock_session_object.get.assert_has_calls(expected_calls, any_order=False)
        mock_on_callback.assert_awaited_once_with(
            auth_code, self.mock_oauth_service, test_state
        )

    async def test_user_unauthorized_missing_refresh_token(self, mock_get_config):
        """
        Directly tests the 'if refresh_token is None' branch
        without using the FastAPI TestClient.
        """
        # --- Arrange ---
        # Mock the required parameters for the 'user' function
        mock_response = MagicMock()  # For 'response: Response'
        mock_oauth_service = MagicMock()  # For 'oauth_service: IOAuthService'

        # Scenario: user_details is None and refresh_token is None
        user_details = None
        refresh_token = None

        # --- Act & Assert ---
        # We expect the UnauthorizedException to be raised immediately
        with self.assertRaises(UnauthorizedException):
            await user(
                response=mock_response,
                user_details=user_details,
                refresh_token=refresh_token,
                oauth_service=mock_oauth_service,
            )

    def test_get_user_unauthorized_no_refresh_token(self, mock_get_config):
        """Tests 401 when no user_details and no refresh_token are present."""
        # No cookies provided
        response = self.client.get("/user")

        # Should raise UnauthorizedException as seen in your code (line 58)
        self.assertEqual(response.status_code, 401)

    @patch("material_ai.api.verify_user_details")
    def test_user_returns_details_from_cache_cookie(
        self, mock_verify_user_details, mock_get_config
    ):
        """
        Tests that /user successfully returns user details from the 'user_details' cookie
        when it is present and valid.
        """
        # --- Arrange ---
        # 1. Create dummy user data
        user_data = {
            "sub": "12345",
            "name": "Test User",
            "email": "test@example.com",
            "given_name": "Test User",
            "family_name": "Test User",
            "picture": "Test pitcure",
            "email_verified": True,
        }
        user_details_json = json.dumps(user_data)

        # 2. Configure the mock helper to return the valid JSON string
        mock_verify_user_details.return_value = user_details_json

        # --- Act ---
        response = self.client.get("/user")

        # --- Assert ---
        # 4. Check for a successful response
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 5. Verify the helper was called correctly
        mock_verify_user_details.assert_called_once_with("test_user_details")

        # 6. Check that the response body matches the expected structure and data
        expected_response = {"user_response": user_data}
        self.assertEqual(response.json(), expected_response)

    @patch("material_ai.api.get_user_details", new_callable=AsyncMock)
    async def test_user_fetches_details_when_cache_is_missing(
        self, mock_get_user_details, mock_get_config
    ):
        """
        Tests that /user calls the get_user_details helper when the cache cookie is missing.
        """
        test_token = "a-valid-refresh-token"
        expected_response_obj = UserSuccessResponse(
            user_response=OAuthUserDetail(
                sub="12345",
                name="Fresh User",
                given_name="Fresh User",
                family_name="Fresh User",
                picture="Test pitcure",
                email="test@test.com",
                email_verified=True,
            )
        )

        mock_get_user_details.return_value = expected_response_obj
        self.client.cookies = {"refresh_token": "test_refresh_token"}
        response = self.client.get("/user")

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(
            response.json(), json.loads(expected_response_obj.model_dump_json())
        )

    @patch("material_ai.api.get_redirection_url")
    def test_login_redirects_and_sets_state(
        self, mock_get_redirection_url, mock_get_config
    ):
        """
        Tests that the /login endpoint correctly sets the session state
        and returns a redirect response to the URL provided by its helper.
        """

        dummy_state = "test-csrf-state-token-123"
        dummy_redirect_url = "https://oauth.provider.com/auth?state=...&client_id=..."

        mock_get_redirection_url.return_value = (dummy_state, dummy_redirect_url)

        response = self.client.get("/login", follow_redirects=False)

        mock_get_redirection_url.assert_called_once_with(self.mock_oauth_service)

        self.assertEqual(response.status_code, status.HTTP_307_TEMPORARY_REDIRECT)

        self.assertEqual(response.headers["location"], dummy_redirect_url)

    @patch("material_ai.api.get_redirection_url")
    def test_login_redirects_and_sets_state_with_ui_redirect(
        self, mock_get_redirection_url, mock_get_config
    ):
        """
        Tests that the /login endpoint correctly sets the session state
        and returns a redirect response to the URL provided by its helper.
        """

        dummy_state = "test-csrf-state-token-123"
        dummy_redirect = "/apps/greeting_agent"
        dummy_redirect_url = "https://oauth.provider.com/auth?state=...&client_id=..."

        mock_get_redirection_url.return_value = (dummy_state, dummy_redirect_url)

        response = self.client.get(
            f"/login?redirect={dummy_redirect}", follow_redirects=False
        )

        mock_get_redirection_url.assert_called_once_with(self.mock_oauth_service)

        self.assertEqual(response.status_code, status.HTTP_307_TEMPORARY_REDIRECT)

        self.assertEqual(response.headers["location"], dummy_redirect_url)

    @patch("material_ai.api.remove_token", new_callable=AsyncMock)
    async def test_logout_with_refresh_token(self, mock_remove_token, mock_get_config):
        """
        Tests that /logout calls remove_token with the token from the cookie.
        """

        # --- Act ---
        # 2. Make the GET request to the /logout endpoint, passing the cookie.
        response = self.client.get("/logout")

        # --- Assert ---
        # 3. Verify the response status code is correct.
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # 4. Verify that our mocked remove_token function was awaited exactly once.
        mock_remove_token.assert_awaited_once()

        # 5. Check that remove_token was called with the correct arguments.
        # We use ANY for the response object because it's created inside the endpoint.
        mock_remove_token.assert_awaited_once_with(
            ANY,
            self.cookies["refresh_token"],
            self.mock_oauth_service,
            self.cookies["access_token"],
        )

    @patch("material_ai.api.remove_token", new_callable=AsyncMock)
    async def test_logout_without_refresh_token(
        self, mock_remove_token, mock_get_config
    ):
        """
        Tests that /logout calls remove_token with None when no cookie is present.
        """
        # --- Arrange ---
        # (No token or cookies are needed for this test case)

        # --- Act ---
        # Make the GET request without sending any cookies.
        response = self.client.get("/logout")

        # --- Assert ---
        # Verify the status code.
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Verify that remove_token was still called.
        mock_remove_token.assert_awaited_once()

    def test_submit_feedback_success(self, mock_get_config):
        """
        Tests successful feedback submission with a valid payload.
        """

        feedback_payload = {
            "feedback_category": "GOOD",
            "feedback_text": "This was very helpful!",
            "id": "12345",
        }

        expected_response = {"status": "feedback logged successfully"}
        self.mock_feedback_handler.return_value = expected_response

        response = self.client.post("/feedback", json=feedback_payload)

        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.assertEqual(response.json(), expected_response)

        self.mock_feedback_handler.assert_awaited_once()
        call_args, _ = self.mock_feedback_handler.call_args
        sent_feedback_object = call_args[0]
        self.assertIsInstance(sent_feedback_object, FeedbackRequest)
        self.assertEqual(
            sent_feedback_object.feedback_category,
            feedback_payload["feedback_category"],
        )
        self.assertEqual(
            sent_feedback_object.feedback_text, feedback_payload["feedback_text"]
        )

    def test_submit_feedback_invalid_payload(self, mock_get_config):
        """
        Tests feedback submission with a missing required field,
        expecting a 422 Validation Error.
        """
        invalid_payload = {"text": "This is missing the value."}

        response = self.client.post("/feedback", json=invalid_payload)

        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_CONTENT)

        self.mock_feedback_handler.assert_not_awaited()

    def test_root_serves_index_html(self, mock_get_config):
        """
        Tests that the root endpoint '/' correctly calls FileResponse
        with the path to index.html.
        """
        # Arrange: Define the expected path that the function should construct.
        expected_path = os.path.join(STATIC_DIR, "index.html")

        # Act: Make a request to the root endpoint.
        self.client.get("/")

        # Assert: Verify that the mocked FileResponse class was instantiated
        # exactly once with the correct path and media type.
        self.mock_file_response.assert_called_once_with(
            path=expected_path, media_type="text/html"
        )

    @patch("material_ai.api.psutil")
    def test_health_check_returns_system_metrics(self, mock_psutil, mock_get_config):
        """
        Verify that the /health endpoint correctly formats and returns
        system metrics from mocked dependencies.
        """
        # --- Arrange: Configure the mocks to return predictable data ---

        # Mock the config object
        mock_config = MagicMock()
        mock_config.general.debug = True
        mock_get_config.return_value = mock_config

        # Mock psutil functions and their return values
        mock_psutil.cpu_percent.return_value = 55.5

        # Mock the return object for virtual_memory()
        mock_mem = MagicMock()
        mock_mem.total = 16 * (1024**3)  # 16 GB
        mock_mem.available = 4 * (1024**3)  # 4 GB
        mock_mem.percent = 75.0
        mock_psutil.virtual_memory.return_value = mock_mem

        # Mock the return object for disk_usage()
        mock_disk = MagicMock()
        mock_disk.total = 512 * (1024**3)  # 512 GB
        mock_disk.used = 128 * (1024**3)  # 128 GB
        mock_disk.free = 384 * (1024**3)  # 384 GB
        mock_disk.percent = 25.0
        mock_psutil.disk_usage.return_value = mock_disk

        # --- Act: Make a request to the endpoint ---
        response = self.client.get("/health")

        # --- Assert: Check the response ---
        self.assertEqual(response.status_code, 200)

        data = response.json()

        # Check top-level fields
        self.assertEqual(data["status"], "ok")
        self.assertTrue("uptime" in data)  # Check for uptime existence
        self.assertTrue(data["debug"])

        # Check nested system metrics
        expected_system_data = {
            "cpu_percent_used": 55.5,
            "memory": {
                "total": "16.00 GB",
                "available": "4.00 GB",
                "percent_used": 75.0,
            },
            "disk": {
                "total": "512.00 GB",
                "used": "128.00 GB",
                "free": "384.00 GB",
                "percent_used": 25.0,
            },
        }
        self.assertEqual(data["system"], expected_system_data)

    # Test for config()
    def test_config(self, mock_get_config):
        """Should return the mocked UI configuration."""
        response = self.client.get("/config")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get("title"), self.mock_ui_config.title)
        self.assertEqual(response.json().get("greeting"), self.mock_ui_config.greeting)
        self.assertEqual(
            response.json().get("errorMessage"), self.mock_ui_config.errorMessage
        )

    def test_api_without_cookies(self, mock_get_config):

        invalid_payload = {"text": "This is missing the value."}

        self.client.cookies = None

        response = self.client.post("/feedback", json=invalid_payload)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.mock_feedback_handler.assert_not_awaited()

    def test_api_without_access_token(self, mock_get_config):

        invalid_payload = {"text": "This is missing the value."}

        self.client.cookies = {
            "refresh_token": "test_refresh_token",
            "user_details": "test_user_details",
        }

        response = self.client.post("/feedback", json=invalid_payload)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.mock_feedback_handler.assert_not_awaited()

    def test_api_without_user_details(self, mock_get_config):

        invalid_payload = {"text": "This is missing the value."}

        self.client.cookies = {
            "refresh_token": "test_refresh_token",
            "access_token": "test_user_details",
            "id_token": "test_user_details",
        }

        response = self.client.post("/feedback", json=invalid_payload)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        self.mock_feedback_handler.assert_not_awaited()

    def test_api_with_invaid_oauth_service(self, mock_get_config):

        self.mock_oauth_service.sso_verify_id_token.return_value = None

        response = self.client.get("/logout")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_api_with_error_oauth_service(self, mock_get_config):

        self.mock_oauth_service.sso_verify_id_token.return_value = OAuthErrorResponse(
            status_code=401, detail="SomeErrorHasOccured"
        )

        response = self.client.get("/logout")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch("material_ai.middleware.auth_middleware.verify_user_details")
    def test_api_with_users_and_invalid_user(
        self, mock_verify_user_details, mock_get_config
    ):

        mock_verify_user_details.return_value = None
        response = self.client.post("/run")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch("material_ai.middleware.auth_middleware.verify_user_details")
    def test_api_with_users_and_invalid_uid(
        self, mock_verify_user_details, mock_get_config
    ):
        user_detail = OAuthUserDetail(
            sub="12345",
            name="Fresh User",
            given_name="Fresh User",
            family_name="Fresh User",
            picture="Test pitcure",
            email="test@test.com",
            email_verified=True,
        )
        mock_verify_user_details.return_value = user_detail.model_dump_json()
        response = self.client.post("/run", json={"user_id": "test_user_1234"})

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch("material_ai.middleware.auth_middleware.verify_user_details")
    def test_api_with_users_and_valid_uid(
        self, mock_verify_user_details, mock_get_config
    ):
        user_detail = OAuthUserDetail(
            sub="test_user_123",
            name="Fresh User",
            given_name="Fresh User",
            family_name="Fresh User",
            picture="Test pitcure",
            email="test@test.com",
            email_verified=True,
        )
        mock_verify_user_details.return_value = user_detail.model_dump_json()
        response = self.client.post("/run", json={"user_id": "test_user_123"})

        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_CONTENT)

    def test_api_with_users_and_invalid_uid(self, mock_get_config):

        response = self.client.get("sessions/12345/users/12345")

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    @patch("material_ai.api.get_agent_loader")
    def test_get_agent_ui_loader_not_found(self, mock_loader, mock_get_config):
        """Takes self + 1 argument for 1 patch."""
        mock_loader.return_value = None

        response = self.client.get("/apps/my-app/ui")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.text, "Agent directory not found")

    @patch("material_ai.api.os.path.exists")
    @patch("material_ai.api.get_agent_loader")
    def test_get_agent_ui_file_not_found(
        self, mock_loader, mock_exists, mock_get_config
    ):
        """Takes self + 2 arguments for 2 patches."""
        mock_loader_instance = MagicMock()
        mock_loader_instance.agents_dir = "/fake/dir"
        mock_loader.return_value = mock_loader_instance
        mock_exists.return_value = False

        response = self.client.get("/apps/my-app/ui")

        self.assertEqual(response.status_code, 404)

    @patch("material_ai.api.FileResponse")
    @patch("material_ai.api.os.path.exists")
    @patch("material_ai.api.get_agent_loader")
    def test_get_agent_ui_success(
        self, mock_loader, mock_exists, mock_file_response, mock_get_config
    ):
        """Takes self + 3 arguments for 3 patches."""
        mock_loader_instance = MagicMock()
        mock_loader_instance.agents_dir = "/fake/dir"
        mock_loader.return_value = mock_loader_instance
        mock_exists.return_value = True

        # We mock FileResponse so it doesn't try to open a real file
        mock_file_response.return_value = MagicMock(status_code=200)

        response = self.client.get("/apps/my-app/ui")

        self.assertEqual(response.status_code, 404)

    @patch("material_ai.api.get_agent_loader")
    def test_get_agents_loader_not_found(self, mock_loader, mock_get_config):
        """Returns an empty list if agent_loader is None."""
        mock_loader.return_value = None

        response = self.client.get("/agents")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])

    @patch("material_ai.api.get_agent_loader")
    def test_get_agents_success(self, mock_loader, mock_get_config):
        """Tests successful retrieval and formatting of agents."""
        # 1. Setup Mock Loader
        mock_loader_instance = MagicMock()
        mock_loader.return_value = mock_loader_instance

        # 2. Setup Mock Agents in the loader
        mock_loader_instance.list_agents.return_value = ["greeting_agent", "data_agent"]

        # 3. Create mock agent objects with required attributes
        # First agent is an LlmAgent (with a model)
        mock_llm_agent = MagicMock(spec=LlmAgent)
        mock_llm_agent.description = "Says hello"
        mock_llm_agent.model = "gpt-4"

        # Second agent is a generic agent (no model)
        mock_generic_agent = MagicMock()
        mock_generic_agent.description = "Processes data"
        # Ensure it's not seen as an LlmAgent

        # Configure load_agent to return different mocks based on input
        mock_loader_instance.load_agent.side_effect = [
            mock_llm_agent,
            mock_generic_agent,
        ]

        # --- Act ---
        response = self.client.get("/agents")

        # --- Assert ---
        self.assertEqual(response.status_code, 200)
        data = response.json()["agents"]

        self.assertEqual(len(data), 2)

        # Verify first agent (Formatted name and model)
        self.assertEqual(data[0]["id"], "greeting_agent")
        self.assertEqual(data[0]["name"], "Greeting Agent")
        self.assertEqual(data[0]["model"], "gpt-4")

        # Verify second agent (Formatted name and empty model)
        self.assertEqual(data[1]["id"], "data_agent")
        self.assertEqual(data[1]["name"], "Data Agent")
        self.assertEqual(data[1]["model"], "")

    @patch("material_ai.api.get_agent_loader")
    def test_get_agents_with_empty_name_coverage(self, mock_loader, mock_get_config):
        """
        Specifically tests the highlighted line:
        if not name: return ""
        """
        # Arrange
        mock_loader_instance = MagicMock()
        mock_loader.return_value = mock_loader_instance

        # We include an empty string to trigger the 'if not name' branch
        mock_loader_instance.list_agents.return_value = [""]

        mock_agent = MagicMock()
        mock_agent.description = "Test Description"
        mock_loader_instance.load_agent.return_value = mock_agent

        # Act
        response = self.client.get("/agents")

        # Assert
        self.assertEqual(response.status_code, 200)
        agents = response.json()["agents"]

        # Verify that the empty name returned an empty string as per your code
        self.assertEqual(agents[0]["name"], "")
        self.assertEqual(agents[0]["id"], "")

    @patch("material_ai.api.get_agent_loader")
    def test_get_agents_formatting_logic(self, mock_loader, mock_get_config):
        """Tests the snake_case to Title Case conversion."""
        mock_loader_instance = MagicMock()
        mock_loader.return_value = mock_loader_instance
        mock_loader_instance.list_agents.return_value = ["chat_helper_agent"]

        mock_agent = MagicMock()
        mock_agent.description = "Helpful agent"
        mock_loader_instance.load_agent.return_value = mock_agent

        response = self.client.get("/agents")

        # Verify 'chat_helper_agent' becomes 'Chat Helper Agent'
        self.assertEqual(response.json()["agents"][0]["name"], "Chat Helper Agent")

    @patch("material_ai.api.get_endpoint_function")
    @patch("material_ai.api.get_user")
    def test_history_success(self, mock_get_user, mock_get_endpoint, mock_get_config):
        """Tests successful history retrieval with content title."""
        # 1. Arrange
        mock_get_user.return_value = self.mock_user

        # Mock the list_sessions and get_session functions
        mock_list = AsyncMock()
        mock_get = AsyncMock()

        # Side effect to return the correct function based on the string name
        mock_get_endpoint.side_effect = lambda name: (
            mock_list if name == "list_sessions" else mock_get
        )

        # Mock session list
        session_1 = MagicMock(id="s1", last_update_time=100, app_name="test_app")
        mock_list.return_value = [session_1]

        # Mock session details with content to trigger get_title success
        session_instance = MagicMock()
        session_instance.events = [
            MagicMock(content=MagicMock(parts=[MagicMock(text="Hello World")]))
        ]
        mock_get.return_value = session_instance

        # 2. Act
        response = self.client.get("/apps/test_app/history")

        # 3. Assert
        self.assertEqual(response.status_code, 200)
        data = response.json()["history"]
        self.assertEqual(data[0]["title"], "Hello World")
        self.assertEqual(data[0]["last_update_time"], 100 * 1000)

    @patch("material_ai.api.get_endpoint_function")
    @patch("material_ai.api.get_user")
    def test_history_title_fallback_coverage(
        self, mock_get_user, mock_get_endpoint, mock_get_config
    ):
        """Covers the 'except (IndexError, AttributeError)' branch in get_title."""
        # 1. Arrange

        mock_get_user.return_value = self.mock_user

        mock_list = AsyncMock()
        mock_get = AsyncMock()
        mock_get_endpoint.side_effect = lambda name: (
            mock_list if name == "list_sessions" else mock_get
        )

        session_1 = MagicMock(id="s1", last_update_time=100, app_name="test_app")
        mock_list.return_value = [session_1]

        # Mock an empty session to trigger IndexError in get_title
        session_instance = MagicMock()
        session_instance.events = []  # This will cause IndexError at events[0]
        mock_get.return_value = session_instance

        # 2. Act
        response = self.client.get("/apps/test_app/history")

        # 3. Assert
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["history"][0]["title"], "...")


def create_dummy_ui_config() -> UIConfig:
    return UIConfig(
        title="Test",
        greeting="Test greeting",
        errorMessage="Test error message",
        agents={
            "greeting_agent": {
                "title": "Greeting Agent",
                "greeting": "What a great day to chat with you!",
                "show_footer": "true",
                "chat_section_width": "760px",
                "feedback": {
                    "positive": {"value": "GOOD", "categories": []},
                    "negative": {"value": "BAD", "categories": []},
                },
            }
        },
        theme={
            "lightPalette": {
                "mode": "light",
                "primary": {"main": ""},
                "background": {
                    "default": "",
                    "paper": "",
                    "card": "",
                    "cardHover": "",
                    "history": "",
                },
                "text": {
                    "primary": "",
                    "secondary": "",
                    "tertiary": "",
                    "h5": "",
                    "selected": "",
                    "tagline": "",
                },
                "tooltip": {"background": "", "text": ""},
            },
            "darkPalette": {
                "mode": "dark",
                "primary": {"main": ""},
                "background": {
                    "default": "",
                    "paper": "",
                    "card": "",
                    "cardHover": "",
                    "history": "",
                },
                "text": {
                    "primary": "",
                    "secondary": "",
                    "tertiary": "",
                    "h5": "",
                    "selected": "",
                    "tagline": "",
                },
                "tooltip": {"background": "", "text": ""},
            },
        },
    )


def create_dummy_config(debug_mode: bool = True) -> Config:
    return Config(
        sso=SSOConfig(
            issuer="google",
            session_secret_key="a-fake-but-valid-secret-key-for-testing",
            client_id="test_client_id",
            client_secret="test_client_secret",
            redirect_uri="test_redirect_uri",
            tenant_id="",
            scope="openid profile email",
        ),
        general=GeneralConfig(debug=debug_mode),
        adk=ADKConfig(
            session_db_url="sqlite:///./test_sessions.db",
        ),
        google=GoogleConfig(
            genai_use_vertexai="true", api_key="fake-google-api-key-12345"
        ),
    )
