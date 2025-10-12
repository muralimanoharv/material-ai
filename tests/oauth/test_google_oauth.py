import unittest
import respx
import httpx
from unittest.mock import patch, Mock, AsyncMock

# --- Assumed Schema Mocks ---
# In a real project, you would import these from your schema file.
# For this example, we define simple mock classes.
from pydantic import BaseModel, Field
from typing import Any
from material_ai.oauth.google_oauth import (
    GoogleOAuthService,
    SSOConfig,
    OAuthRedirectionResponse,
    OAuthUserDetail,
    OAuthSuccessResponse,
    OAuthErrorResponse,
)

# --- Test Cases ---


class TestGoogleOAuthService(unittest.IsolatedAsyncioTestCase):

    def setUp(self):
        """Set up a new service instance and SSO config for each test."""
        self.service = GoogleOAuthService()
        self.sso_config = SSOConfig(
            client_id="test_client_id",
            client_secret="test_client_secret",
            redirect_uri="http://localhost/callback",
            session_secret_key="test_secret_key",
        )

    def test_sso_get_redirection_url(self):
        """
        Should generate a valid Google OAuth redirection URL with a secure state.
        """
        with patch(
            "secrets.token_urlsafe", return_value="mock_state_token"
        ) as mock_token:
            response = self.service.sso_get_redirection_url(self.sso_config)

            mock_token.assert_called_once_with(16)
            self.assertIsInstance(response, OAuthRedirectionResponse)
            self.assertEqual(response.state, "mock_state_token")
            self.assertIn(
                "https://accounts.google.com/o/oauth2/v2/auth", response.redirection_url
            )
            self.assertIn(
                f"client_id={self.sso_config.client_id}", response.redirection_url
            )
            self.assertIn("state=mock_state_token", response.redirection_url)

    @respx.mock
    async def test_sso_get_access_token_success(self):
        """
        Should successfully exchange an authorization code for an access token and user details.
        """
        # Mock the external API call to Google's token endpoint
        respx.post("https://oauth2.googleapis.com/token").mock(
            return_value=httpx.Response(
                200,
                json={
                    "access_token": "new_access_token",
                    "refresh_token": "new_refresh_token",
                    "expires_in": 3600,
                },
            )
        )

        # Mock the internal call to get user details to isolate the test
        mock_user_detail = OAuthUserDetail(
            sub="123",
            email="test@example.com",
            name="Test User",
            email_verified=True,
            family_name="Test User",
            given_name="Test User",
            picture="Test pitcure",
        )
        with patch.object(
            self.service, "sso_get_user_details", new_callable=AsyncMock
        ) as mock_get_details:
            mock_get_details.return_value = mock_user_detail

            response = await self.service.sso_get_access_token(
                self.sso_config, "auth_code_123"
            )

            # Assertions
            mock_get_details.assert_awaited_once_with("new_access_token")
            self.assertIsInstance(response, OAuthSuccessResponse)
            self.assertEqual(response.access_token, "new_access_token")
            self.assertEqual(response.user_detail.email, "test@example.com")

    @respx.mock
    async def test_sso_get_access_token_api_error(self):
        """
        Should return an OAuthErrorResponse if the API returns an error in the JSON body.
        """
        respx.post("https://oauth2.googleapis.com/token").mock(
            return_value=httpx.Response(
                200,
                json={
                    "error": "invalid_grant",
                    "error_description": "Invalid authorization code.",
                },
            )
        )

        response = await self.service.sso_get_access_token(
            self.sso_config, "bad_auth_code"
        )

        self.assertIsInstance(response, OAuthErrorResponse)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.detail, "Invalid authorization code.")

    async def test_sso_get_access_token_user_detail_fails(self):
        """
        Should propagate the error if fetching user details fails.
        """
        error_response = OAuthErrorResponse(status_code=401, detail="Invalid token")
        with patch("httpx.AsyncClient") as MockClient:
            mock_response = Mock()
            mock_response.json.return_value = {"access_token": "valid_token"}
            MockClient.return_value.__aenter__.return_value.post.return_value = (
                mock_response
            )

            with patch.object(
                self.service, "sso_get_user_details", return_value=error_response
            ) as mock_get_details:
                response = await self.service.sso_get_access_token(
                    self.sso_config, "auth_code"
                )
                self.assertIs(response, error_response)

    @respx.mock
    async def test_sso_get_user_details_success(self):
        """
        Should successfully fetch user details with a valid access token.
        """
        user_info_payload = {
            "sub": "12345",
            "email": "test@gmail.com",
            "name": "Test User",
            "given_name": "Test User",
            "family_name": "Test User",
            "picture": 'Test Pitcure',
            "email_verified": True
        }
        respx.get("https://www.googleapis.com/oauth2/v3/userinfo").mock(
            return_value=httpx.Response(200, json=user_info_payload)
        )

        response = await self.service.sso_get_user_details("valid_access_token")

        self.assertIsInstance(response, OAuthUserDetail)
        self.assertEqual(response.email, "test@gmail.com")
        self.assertEqual(response.sub, "12345")

    @respx.mock
    async def test_sso_revoke_refresh_token_success(self):
        """
        Should successfully revoke a token and return None.
        """
        respx.post("https://oauth2.googleapis.com/revoke").mock(
            return_value=httpx.Response(200)
        )

        response = await self.service.sso_revoke_refresh_token("valid_refresh_token")
        self.assertIsNone(response)

    @respx.mock
    async def test_sso_revoke_refresh_token_http_error(self):
        """
        Should return an OAuthErrorResponse on HTTP failure during token revocation.
        """
        respx.post("https://oauth2.googleapis.com/revoke").mock(
            return_value=httpx.Response(400, text="invalid_token")
        )

        response = await self.service.sso_revoke_refresh_token("invalid_refresh_token")

        self.assertIsInstance(response, OAuthErrorResponse)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.detail, "invalid_token")

    @respx.mock
    async def test_sso_verify_access_token_success(self):
        """
        Should return the user's subject (sub) ID if the token is valid.
        """
        respx.post("https://oauth2.googleapis.com/tokeninfo").mock(
            return_value=httpx.Response(200, json={"sub": "user_subject_id_123"})
        )

        is_valid = await self.service.sso_verify_access_token("valid_token")

        self.assertEqual(is_valid, "user_subject_id_123")

    @respx.mock
    async def test_sso_get_new_access_token_success(self):
        """
        Should successfully use a refresh token to get a new access token and user details.
        """
        # Arrange: Mock the API response for a successful token refresh
        respx.post("https://oauth2.googleapis.com/token").mock(
            return_value=httpx.Response(200, json={
                "access_token": "brand_new_access_token",
                "expires_in": 3599,
            })
        )

        # Arrange: Mock the internal call to get user details
        mock_user_detail =OAuthUserDetail(
            sub="123",
            email="test@example.com",
            name="Test User",
            email_verified=True,
            family_name="Test User",
            given_name="Test User",
            picture="Test pitcure",
        )
        with patch.object(self.service, 'sso_get_user_details', new_callable=AsyncMock) as mock_get_details:
            mock_get_details.return_value = mock_user_detail

            # Act: Call the function with an existing refresh token
            response = await self.service.sso_get_new_access_token(self.sso_config, "existing_refresh_token")

            # Assert
            mock_get_details.assert_awaited_once_with("brand_new_access_token")
            self.assertIsInstance(response, OAuthSuccessResponse)
            self.assertEqual(response.access_token, "brand_new_access_token")
            self.assertEqual(response.refresh_token, "existing_refresh_token") # Should return the original refresh token
            self.assertEqual(response.user_detail, mock_user_detail)

    @respx.mock
    async def test_sso_get_new_access_token_api_error(self):
        """
        Should return an OAuthErrorResponse if the API returns a logical error.
        """
        # Arrange: Mock an API response for an invalid or expired refresh token
        respx.post("https://oauth2.googleapis.com/token").mock(
            return_value=httpx.Response(200, json={
                "error": "invalid_grant",
                "error_description": "Token has been expired or revoked."
            })
        )
        
        with patch.object(self.service, 'sso_get_user_details', new_callable=AsyncMock) as mock_get_details:
            # Act
            response = await self.service.sso_get_new_access_token(self.sso_config, "revoked_refresh_token")

            # Assert
            mock_get_details.assert_not_awaited() # User details should not be fetched
            self.assertIsInstance(response, OAuthErrorResponse)
            self.assertEqual(response.status_code, 400)
            self.assertEqual(response.detail, "Token has been expired or revoked.")

    @respx.mock
    async def test_sso_get_new_access_token_user_detail_fails(self):
        """
        Should propagate the error if fetching user details fails after a successful token refresh.
        """
        # Arrange: Mock a successful token refresh
        respx.post("https://oauth2.googleapis.com/token").mock(
            return_value=httpx.Response(200, json={"access_token": "new_token"})
        )
        
        # Arrange: Mock a failure in the subsequent user detail call
        error_response = OAuthErrorResponse(status_code=401, detail="Invalid credentials")
        with patch.object(self.service, 'sso_get_user_details', return_value=error_response):
            # Act
            response = await self.service.sso_get_new_access_token(self.sso_config, "good_refresh_token")

            # Assert: The final response should be the error from the failed downstream call
            self.assertIs(response, error_response)

    @respx.mock
    async def test_sso_get_new_access_token_http_error(self):
        """
        Should return an OAuthErrorResponse on a non-2xx HTTP failure, handled by the decorator.
        """
        # Arrange: Mock a 401 Unauthorized response from the API
        respx.post("https://oauth2.googleapis.com/token").mock(
            return_value=httpx.Response(401, json={"error": "unauthorized_client"})
        )

        # Act
        response = await self.service.sso_get_new_access_token(self.sso_config, "some_refresh_token")

        # Assert: The decorator should catch the HTTPStatusError and format the response
        self.assertIsInstance(response, OAuthErrorResponse)
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.detail, {"error": "unauthorized_client"})


if __name__ == "__main__":
    unittest.main()
