import unittest
import respx
import httpx
import jwt
from unittest.mock import patch, Mock, AsyncMock, MagicMock

# --- Assumed Schema Mocks ---
# In a real project, you would import these from your schema file.
# For this example, we define simple mock classes.
from material_ai.oauth.azure_oauth import (
    AzureOAuthService,
    SSOConfig,
    OAuthRedirectionResponse,
    OAuthUserDetail,
    OAuthSuccessResponse,
    OAuthErrorResponse,
)

# --- Test Cases ---


class TestAzureOAuthService(unittest.IsolatedAsyncioTestCase):

    def setUp(self):
        """Set up a new service instance and SSO config for each test."""
        self.service = AzureOAuthService()
        self.sso_config = SSOConfig(
            issuer="azure",
            client_id="test_client_id",
            client_secret="test_client_secret",
            redirect_uri="http://localhost/callback",
            session_secret_key="test_secret_key",
            tenant_id="test_tenant",
            scope="openid email profile",
        )

    def test_sso_get_redirection_url(self):
        """
        Should generate a valid Google OAuth redirection URL with a secure state.
        """
        with patch(
            "secrets.token_urlsafe", return_value="mock_state_token"
        ) as mock_token:
            response = self.service.sso_get_redirection_url(self.sso_config)
            tenant = self.sso_config.tenant_id
            mock_token.assert_called_once_with(16)
            self.assertIsInstance(response, OAuthRedirectionResponse)
            self.assertEqual(response.state, "mock_state_token")
            self.assertIn(
                f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize",
                response.redirection_url,
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
        tenant = self.sso_config.tenant_id
        url = f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"
        respx.post(url).mock(
            return_value=httpx.Response(
                200,
                json={
                    "access_token": "new_access_token",
                    "refresh_token": "new_refresh_token",
                    "id_token": "new_id_token",
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
            self.service, "sso_verify_id_token", new_callable=AsyncMock
        ) as mock_get_details:
            mock_get_details.return_value = mock_user_detail

            response = await self.service.sso_get_access_token(
                self.sso_config, "auth_code_123"
            )

            # Assertions
            mock_get_details.assert_awaited_once_with(self.sso_config, "new_id_token")
            self.assertIsInstance(response, OAuthSuccessResponse)
            self.assertEqual(response.access_token, "new_access_token")
            self.assertEqual(response.user_detail.email, "test@example.com")

    @respx.mock
    async def test_sso_get_access_token_api_error(self):
        """
        Should return an OAuthErrorResponse if the API returns an error in the JSON body.
        """
        tenant = self.sso_config.tenant_id
        url = f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"
        respx.post(url).mock(
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
                self.service, "sso_verify_id_token", return_value=error_response
            ) as mock_get_details:
                response = await self.service.sso_get_access_token(
                    self.sso_config, "auth_code"
                )
                self.assertIs(response, error_response)

    @respx.mock
    async def test_sso_revoke_refresh_token_success(self):
        """
        Should successfully revoke a token and return None.
        """
        respx.post("https://graph.microsoft.com/v1.0/me/revokeSignInSessions").mock(
            return_value=httpx.Response(200)
        )

        response = await self.service.sso_revoke_refresh_token(
            refresh_token="valid_refresh_token", access_token="valid_access_token"
        )
        self.assertIsNone(response)

    @respx.mock
    async def test_sso_revoke_refresh_token_http_error(self):
        """
        Should return an OAuthErrorResponse on HTTP failure during token revocation.
        """
        respx.post("https://graph.microsoft.com/v1.0/me/revokeSignInSessions").mock(
            return_value=httpx.Response(400, text="invalid_token")
        )

        response = await self.service.sso_revoke_refresh_token(
            refresh_token="invalid_refresh_token", access_token="invalid_access_token"
        )

        self.assertIsInstance(response, OAuthErrorResponse)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.detail, "invalid_token")

    @respx.mock
    async def test_sso_get_new_access_token_success(self):
        """
        Should successfully use a refresh token to get a new access token and user details.
        """
        tenant = self.sso_config.tenant_id
        url = f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"
        # Arrange: Mock the API response for a successful token refresh
        respx.post(url).mock(
            return_value=httpx.Response(
                200,
                json={
                    "access_token": "brand_new_access_token",
                    "refresh_token": "existing_refresh_token",
                    "id_token": "brand_new_id_token",
                    "expires_in": 3599,
                },
            )
        )

        # Arrange: Mock the internal call to get user details
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
            self.service, "sso_verify_id_token", new_callable=AsyncMock
        ) as mock_get_details:
            mock_get_details.return_value = mock_user_detail

            # Act: Call the function with an existing refresh token
            response = await self.service.sso_get_new_access_token(
                self.sso_config, "existing_refresh_token"
            )

            # Assert
            mock_get_details.assert_awaited_once_with(
                self.sso_config, "brand_new_id_token"
            )
            self.assertIsInstance(response, OAuthSuccessResponse)
            self.assertEqual(response.access_token, "brand_new_access_token")
            self.assertEqual(
                response.refresh_token, "existing_refresh_token"
            )  # Should return the original refresh token
            self.assertEqual(response.user_detail, mock_user_detail)

    @respx.mock
    async def test_sso_get_new_access_token_api_error(self):
        """
        Should return an OAuthErrorResponse if the API returns a logical error.
        """
        tenant = self.sso_config.tenant_id
        url = f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"
        # Arrange: Mock an API response for an invalid or expired refresh token
        respx.post(url).mock(
            return_value=httpx.Response(
                200,
                json={
                    "error": "invalid_grant",
                    "error_description": "Token has been expired or revoked.",
                },
            )
        )

        with patch.object(
            self.service, "sso_verify_id_token", new_callable=AsyncMock
        ) as mock_get_details:
            # Act
            response = await self.service.sso_get_new_access_token(
                self.sso_config, "revoked_refresh_token"
            )

            # Assert
            mock_get_details.assert_not_awaited()  # User details should not be fetched
            self.assertIsInstance(response, OAuthErrorResponse)
            self.assertEqual(response.status_code, 400)
            self.assertEqual(response.detail, "Token has been expired or revoked.")

    @respx.mock
    async def test_sso_get_new_access_token_user_detail_fails(self):
        """
        Should propagate the error if fetching user details fails after a successful token refresh.
        """
        tenant = self.sso_config.tenant_id
        url = f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"
        # Arrange: Mock a successful token refresh
        respx.post(url).mock(
            return_value=httpx.Response(
                200,
                json={
                    "access_token": "new_token",
                    "refresh_token": "existing_refresh_token",
                    "id_token": "new_id_token",
                },
            )
        )

        # Arrange: Mock a failure in the subsequent user detail call
        error_response = OAuthErrorResponse(
            status_code=401, detail="Invalid credentials"
        )
        with patch.object(
            self.service, "sso_verify_id_token", return_value=error_response
        ):
            # Act
            response = await self.service.sso_get_new_access_token(
                self.sso_config, "good_refresh_token"
            )

            # Assert: The final response should be the error from the failed downstream call
            self.assertIs(response, error_response)

    @respx.mock
    async def test_sso_get_new_access_token_http_error(self):
        """
        Should return an OAuthErrorResponse on a non-2xx HTTP failure, handled by the decorator.
        """
        tenant = self.sso_config.tenant_id
        url = f"https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token"
        # Arrange: Mock a 401 Unauthorized response from the API
        respx.post(url).mock(
            return_value=httpx.Response(401, json={"error": "unauthorized_client"})
        )

        # Act
        response = await self.service.sso_get_new_access_token(
            self.sso_config, "some_refresh_token"
        )

        # Assert: The decorator should catch the HTTPStatusError and format the response
        self.assertIsInstance(response, OAuthErrorResponse)
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.detail, {"error": "unauthorized_client"})

    @respx.mock
    async def test_sso_verify_id_token_microsoft_success(self):
        # 1. Mock the JWK Client and Signing Key
        mock_jwks_client = MagicMock()
        mock_signing_key = MagicMock()
        mock_signing_key.key = "azure-public-key"
        mock_jwks_client.get_signing_key_from_jwt.return_value = mock_signing_key

        # 2. Mock jwt.decode to return Microsoft-specific payload
        # Note the use of 'oid' and 'preferred_username' as per your code
        fake_payload = {
            "oid": "ms-user-999",
            "name": "Murali Manohar Veeravalli",
            "preferred_username": "murali@outlook.com",
            "picture": "http://cdn.microsoft.com/photo.jpg",
            "tid": self.sso_config.tenant_id,
        }

        # Use patch.object for your internal 'get_client' helper
        with patch.object(self.service, "get_client", return_value=mock_jwks_client):
            with patch("jwt.decode", return_value=fake_payload) as mock_decode:

                # 3. Execute
                result = await self.service.sso_verify_id_token(
                    self.sso_config, "ms-token-123"
                )

                # 4. Assertions
                assert isinstance(result, OAuthUserDetail)
                assert result.sub == "ms-user-999"  # Maps from 'oid'
                assert (
                    result.email == "murali@outlook.com"
                )  # Maps from 'preferred_username'

                # Verify your "A B C" split logic
                # "Murali Manohar Veeravalli" -> Given: Murali, Family: Veeravalli
                assert result.given_name == "Murali"
                assert result.family_name == "Veeravalli"

                mock_decode.assert_called_once_with(
                    "ms-token-123",
                    "azure-public-key",
                    algorithms=["RS256"],
                    audience=[self.sso_config.client_id],
                    issuer=f"https://login.microsoftonline.com/{self.sso_config.tenant_id}/v2.0",
                )

    @respx.mock
    async def test_sso_verify_id_token_microsoft_invalid(self):
        # Mock the helper to return a client but make decode fail
        mock_jwks_client = MagicMock()

        with patch.object(self.service, "get_client", return_value=mock_jwks_client):
            with patch(
                "jwt.decode", side_effect=jwt.ExpiredSignatureError("Token expired")
            ):

                result = await self.service.sso_verify_id_token(
                    self.sso_config, "expired-ms-token"
                )

                assert isinstance(result, OAuthErrorResponse)
                assert result.status_code == 401
                assert result.detail == "Invalid token"


if __name__ == "__main__":
    unittest.main()
