"""
Security Tests

Tests for password hashing, JWT generation, and token validation.
"""

import pytest
from datetime import timedelta
from jose import jwt, JWTError

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    verify_token,
    generate_refresh_token,
    get_refresh_token_expiration
)
from app.core.config import settings


class TestPasswordHashing:
    """Test password hashing and verification"""

    def test_hash_password(self):
        """Test password is hashed correctly"""
        password = "test_password_123"
        hashed = hash_password(password)

        # Hash should be different from plain password
        assert hashed != password
        # Hash should be a string
        assert isinstance(hashed, str)
        # Hash should start with bcrypt identifier
        assert hashed.startswith("$2b$")

    def test_verify_password_correct(self):
        """Test password verification with correct password"""
        password = "correct_password"
        hashed = hash_password(password)

        assert verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        """Test password verification with incorrect password"""
        password = "correct_password"
        wrong_password = "wrong_password"
        hashed = hash_password(password)

        assert verify_password(wrong_password, hashed) is False

    def test_same_password_different_hashes(self):
        """Test same password generates different hashes (salt)"""
        password = "same_password"
        hash1 = hash_password(password)
        hash2 = hash_password(password)

        # Hashes should be different (due to salt)
        assert hash1 != hash2
        # But both should verify correctly
        assert verify_password(password, hash1) is True
        assert verify_password(password, hash2) is True


class TestJWTTokens:
    """Test JWT token generation and validation"""

    def test_create_access_token(self):
        """Test JWT token creation"""
        data = {"sub": "user123", "rol": "asesor"}
        token = create_access_token(data)

        # Token should be a string
        assert isinstance(token, str)
        # Token should have 3 parts (header.payload.signature)
        assert len(token.split(".")) == 3

    def test_verify_token_valid(self):
        """Test token verification with valid token"""
        data = {"sub": "user123", "rol": "asesor", "ruta": "001"}
        token = create_access_token(data)

        payload = verify_token(token)

        # Should contain original data
        assert payload["sub"] == "user123"
        assert payload["rol"] == "asesor"
        assert payload["ruta"] == "001"
        # Should contain standard JWT claims
        assert "exp" in payload
        assert "iat" in payload
        assert payload["type"] == "access"

    def test_verify_token_invalid(self):
        """Test token verification with invalid token"""
        invalid_token = "invalid.token.here"

        with pytest.raises(JWTError):
            verify_token(invalid_token)

    def test_verify_token_expired(self):
        """Test token verification with expired token"""
        data = {"sub": "user123"}
        # Create token that expires immediately
        token = create_access_token(data, expires_delta=timedelta(seconds=-1))

        with pytest.raises(JWTError):
            verify_token(token)

    def test_token_expiration_default(self):
        """Test token has correct default expiration"""
        data = {"sub": "user123"}
        token = create_access_token(data)

        # Decode without verification to check expiration
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

        # Calculate expected expiration (approximately)
        import time
        expected_exp = time.time() + (settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)

        # Allow 5 second tolerance
        assert abs(payload["exp"] - expected_exp) < 5

    def test_token_custom_expiration(self):
        """Test token with custom expiration"""
        data = {"sub": "user123"}
        custom_delta = timedelta(minutes=30)
        token = create_access_token(data, expires_delta=custom_delta)

        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])

        import time
        expected_exp = time.time() + (30 * 60)

        assert abs(payload["exp"] - expected_exp) < 5


class TestRefreshTokens:
    """Test refresh token generation"""

    def test_generate_refresh_token(self):
        """Test refresh token generation"""
        token = generate_refresh_token()

        # Should be a string
        assert isinstance(token, str)
        # Should be URL-safe
        assert all(c.isalnum() or c in "-_" for c in token)
        # Should be reasonably long (32 bytes = 43 chars base64)
        assert len(token) > 40

    def test_generate_unique_refresh_tokens(self):
        """Test refresh tokens are unique"""
        token1 = generate_refresh_token()
        token2 = generate_refresh_token()

        assert token1 != token2

    def test_refresh_token_expiration(self):
        """Test refresh token expiration calculation"""
        from datetime import datetime
        expiration = get_refresh_token_expiration()

        # Should be a datetime
        assert isinstance(expiration, datetime)
        # Should be in the future
        assert expiration > datetime.utcnow()
        # Should be approximately REFRESH_TOKEN_EXPIRE_DAYS days from now
        days_diff = (expiration - datetime.utcnow()).days
        assert abs(days_diff - settings.REFRESH_TOKEN_EXPIRE_DAYS) <= 1
