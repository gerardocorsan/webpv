"""
Authentication Tests

Tests for login, token refresh, and authentication flows.
"""

import pytest
from fastapi import status

from app.core.security import hash_password, get_refresh_token_expiration
from app.db.firestore_client import create_user, save_refresh_token


class TestLogin:
    """Test login endpoint"""

    def test_login_success(self, client, create_test_user):
        """Test successful login"""
        response = client.post(
            "/api/auth/login",
            json={
                "id": "TEST001",
                "password": "testpass123",
                "rememberMe": True
            }
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # Should return all required fields
        assert "token" in data
        assert "refreshToken" in data
        assert "expiresIn" in data
        assert "user" in data

        # User data should be correct
        assert data["user"]["id"] == "TEST001"
        assert data["user"]["nombre"] == "Usuario Test"
        assert data["user"]["rol"] == "asesor"

        # Tokens should be non-empty strings
        assert isinstance(data["token"], str)
        assert len(data["token"]) > 0
        assert isinstance(data["refreshToken"], str)
        assert len(data["refreshToken"]) > 0

    def test_login_invalid_credentials(self, client, create_test_user):
        """Test login with wrong password"""
        response = client.post(
            "/api/auth/login",
            json={
                "id": "TEST001",
                "password": "wrong_password",
                "rememberMe": True
            }
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        data = response.json()

        assert data["error"] == "INVALID_CREDENTIALS"
        assert "message" in data

    def test_login_user_not_found(self, client):
        """Test login with non-existent user"""
        response = client.post(
            "/api/auth/login",
            json={
                "id": "NOEXIST",  # 7 chars (valid format)
                "password": "anypassword",
                "rememberMe": True
            }
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        data = response.json()

        assert data["error"] == "INVALID_CREDENTIALS"

    def test_login_blocked_user(self, client, create_blocked_user):
        """Test login with blocked user"""
        response = client.post(
            "/api/auth/login",
            json={
                "id": "BLOCKED001",
                "password": "testpass123",
                "rememberMe": True
            }
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN
        data = response.json()

        assert data["error"] == "ACCOUNT_BLOCKED"
        assert "bloqueada" in data["message"].lower()

    def test_login_validation_missing_id(self, client):
        """Test login with missing ID"""
        response = client.post(
            "/api/auth/login",
            json={
                "password": "testpass123",
                "rememberMe": True
            }
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()

        assert data["error"] == "VALIDATION_ERROR"
        assert "details" in data

    def test_login_validation_missing_password(self, client):
        """Test login with missing password"""
        response = client.post(
            "/api/auth/login",
            json={
                "id": "TEST001",
                "rememberMe": True
            }
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()

        assert data["error"] == "VALIDATION_ERROR"

    def test_login_validation_invalid_id_format(self, client):
        """Test login with invalid ID format (too short)"""
        response = client.post(
            "/api/auth/login",
            json={
                "id": "ABC",  # Too short (min 6)
                "password": "testpass123",
                "rememberMe": True
            }
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()

        assert data["error"] == "VALIDATION_ERROR"


class TestRateLimiting:
    """Test rate limiting and account lockout"""

    def test_rate_limiting_multiple_failures(self, client, create_test_user):
        """Test rate limiting after multiple failed attempts"""
        # Make 5 failed login attempts
        for i in range(5):
            response = client.post(
                "/api/auth/login",
                json={
                    "id": "TEST001",
                    "password": "wrong_password",
                    "rememberMe": True
                }
            )
            # First 4 should be 401, 5th might trigger rate limit
            assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_429_TOO_MANY_REQUESTS]

        # 6th attempt should definitely be rate limited
        response = client.post(
            "/api/auth/login",
            json={
                "id": "TEST001",
                "password": "wrong_password",
                "rememberMe": True
            }
        )

        assert response.status_code == status.HTTP_429_TOO_MANY_REQUESTS
        data = response.json()

        assert data["error"] == "RATE_LIMIT_EXCEEDED"
        assert "retryAfter" in data


class TestRefreshToken:
    """Test token refresh endpoint"""

    def test_refresh_token_success(self, client, create_test_user):
        """Test successful token refresh"""
        # First, login to get a refresh token
        login_response = client.post(
            "/api/auth/login",
            json={
                "id": "TEST001",
                "password": "testpass123",
                "rememberMe": True
            }
        )

        assert login_response.status_code == status.HTTP_200_OK
        refresh_token = login_response.json()["refreshToken"]

        # Now refresh the token
        response = client.post(
            "/api/auth/refresh",
            json={"refreshToken": refresh_token}
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # Should return new access token
        assert "token" in data
        assert "expiresIn" in data
        assert isinstance(data["token"], str)
        assert len(data["token"]) > 0

    def test_refresh_token_invalid(self, client):
        """Test refresh with invalid token"""
        response = client.post(
            "/api/auth/refresh",
            json={"refreshToken": "invalid-token-123"}
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        data = response.json()

        assert data["error"] == "INVALID_CREDENTIALS"

    def test_refresh_token_missing(self, client):
        """Test refresh with missing token"""
        response = client.post(
            "/api/auth/refresh",
            json={}
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()

        assert data["error"] == "VALIDATION_ERROR"
