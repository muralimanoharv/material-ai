import unittest
import threading
from unittest.mock import patch, MagicMock

# Import the module containing the code to be tested
import material_ai.oauth.oauth as oauth_factory
from material_ai.oauth.schema import SSOConfig

sso_config = SSOConfig(
    issuer="google",
    client_id="test_client_id",
    client_secret="test_client_secret",
    redirect_uri="http://localhost/callback",
    session_secret_key="test_secret_key",
    tenant_id="",
    scope="openid email profile",
)


class TestGetOauth(unittest.TestCase):

    def setUp(self):
        """
        Reset the global singleton instance before each test.
        This is crucial for ensuring test isolation.
        """
        oauth_factory._oauth_instance = None

    @patch("material_ai.oauth.oauth.GoogleOAuthService")
    def test_first_call_creates_instance(self, MockGoogleOAuthService):
        """
        Test that the first call to get_oauth() creates a new instance.
        """
        # Call the function for the first time
        instance = oauth_factory.get_oauth(sso_config)

        # Assert that the GoogleOAuthService constructor was called exactly once
        MockGoogleOAuthService.assert_called_once()
        # Assert that the returned object is the instance created by the mock
        self.assertIsInstance(instance, MockGoogleOAuthService.return_value.__class__)

    @patch("material_ai.oauth.oauth.AzureOAuthService")
    def test_first_call_creates_instance_azure(self, MockAzureOAuthService):
        """
        Test that the first call to get_oauth() creates a new instance.
        """
        # Call the function for the first time
        azure_config = SSOConfig(
            issuer="azure",
            client_id="test_client_id",
            client_secret="test_client_secret",
            redirect_uri="http://localhost/callback",
            session_secret_key="test_secret_key",
            tenant_id="test_tenant",
            scope="openid email profile",
        )
        instance = oauth_factory.get_oauth(azure_config)

        # Assert that the GoogleOAuthService constructor was called exactly once
        MockAzureOAuthService.assert_called_once()
        # Assert that the returned object is the instance created by the mock
        self.assertIsInstance(instance, MockAzureOAuthService.return_value.__class__)

    def test_first_call_creates_instance_invalid(self):
        """
        Test that the first call to get_oauth() creates a new instance.
        """
        # Call the function for the first time
        mock_sso_config = MagicMock()
        mock_sso_config.issuer = "invalid"
        with self.assertRaises(ValueError) as cm:
            oauth_factory.get_oauth(mock_sso_config)
        self.assertIn("Unknown issuer type", str(cm.exception))

    @patch("material_ai.oauth.oauth.GoogleOAuthService")
    def test_subsequent_calls_return_same_instance(self, MockGoogleOAuthService):
        """
        Test that subsequent calls return the cached singleton instance.
        """
        # Call the function multiple times
        instance1 = oauth_factory.get_oauth(sso_config)
        instance2 = oauth_factory.get_oauth(sso_config)

        # The constructor should still only be called once
        MockGoogleOAuthService.assert_called_once()
        # Both variables should point to the exact same object in memory
        self.assertIs(
            instance1, instance2, "Should return the same instance on subsequent calls"
        )

    @patch("material_ai.oauth.oauth.GoogleOAuthService")
    def test_thread_safety(self, MockGoogleOAuthService):
        """
        Test that only one instance is created when called from multiple threads concurrently.
        """
        num_threads = 10
        results = [None] * num_threads
        threads = []

        # This function will be executed by each thread
        def target(index):
            results[index] = oauth_factory.get_oauth(sso_config)

        # Create and start all threads
        for i in range(num_threads):
            thread = threading.Thread(target=target, args=(i,))
            threads.append(thread)
            thread.start()

        # Wait for all threads to complete
        for thread in threads:
            thread.join()

        # Despite 10 threads running, the constructor should only be called once
        MockGoogleOAuthService.assert_called_once()

        # All threads should have received the exact same instance
        first_instance = results[0]
        for i in range(1, num_threads):
            self.assertIs(
                results[i], first_instance, f"Thread {i} received a different instance"
            )


if __name__ == "__main__":
    unittest.main()
