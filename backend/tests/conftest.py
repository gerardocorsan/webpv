"""
Pytest Configuration and Fixtures

Shared fixtures for all tests.
"""

import os
import pytest
from fastapi.testclient import TestClient
from datetime import datetime
import socket

from app.main import app
from app.core.security import hash_password, create_access_token
from app.db.firestore_client import create_user, get_firestore_client


# ============================================================================
# Session-level Setup
# ============================================================================

def check_firestore_emulator(host_port):
    """
    Check if Firestore emulator is running on specified host:port

    Args:
        host_port: String in format "host:port" (e.g., "[::1]:8421" or "localhost:8910")

    Returns:
        True if emulator is reachable, False otherwise
    """
    try:
        # Parse host and port from host_port string
        if host_port.startswith('['):
            # IPv6 format: [::1]:8421
            host, port = host_port.rsplit(':', 1)
            host = host.strip('[]')
        else:
            # IPv4/hostname format: localhost:8910
            host, port = host_port.rsplit(':', 1)

        port = int(port)

        # Try to connect
        sock = socket.socket(socket.AF_INET6 if ':' in host else socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except Exception as e:
        return False


@pytest.fixture(scope="session", autouse=True)
def setup_firestore_emulator():
    """
    Configure Firestore emulator for all tests

    This fixture runs once before all tests and reads the FIRESTORE_EMULATOR_HOST
    environment variable to connect to the emulator. The emulator must be started
    manually before running tests.

    Usage:
        # In terminal 1:
        gcloud emulators firestore start

        # Copy the export command shown, for example:
        export FIRESTORE_EMULATOR_HOST=[::1]:8421

        # In terminal 2 (with the env var set):
        pytest
    """
    # Check if FIRESTORE_EMULATOR_HOST is set
    emulator_host = os.environ.get("FIRESTORE_EMULATOR_HOST")

    if not emulator_host:
        pytest.exit(
            "\n\n"
            "❌ FIRESTORE_EMULATOR_HOST environment variable is not set.\n\n"
            "Please start the Firestore emulator and set the environment variable:\n\n"
            "  Terminal 1:\n"
            "    gcloud emulators firestore start\n\n"
            "  Terminal 2 (copy the export command from emulator output):\n"
            "    export FIRESTORE_EMULATOR_HOST=[::1]:XXXX  # Use the actual port shown\n"
            "    pytest\n\n"
            "Or run both commands in the same terminal:\n"
            "    export FIRESTORE_EMULATOR_HOST=[::1]:8421  # Use actual port\n"
            "    pytest\n",
            returncode=1
        )

    # Verify emulator is actually reachable
    if not check_firestore_emulator(emulator_host):
        pytest.exit(
            f"\n\n"
            f"❌ Firestore emulator is not reachable at {emulator_host}\n\n"
            f"Please verify:\n"
            f"  1. The emulator is running: gcloud emulators firestore start\n"
            f"  2. The FIRESTORE_EMULATOR_HOST matches the emulator's port\n"
            f"  3. Current value: {emulator_host}\n",
            returncode=1
        )

    # Set project ID for emulator
    if not os.environ.get("FIRESTORE_PROJECT_ID"):
        os.environ["FIRESTORE_PROJECT_ID"] = "webpv-dev"

    print(f"\n✅ Using Firestore emulator at {emulator_host}\n")

    yield

    # No cleanup needed - env var should persist for developer convenience


# ============================================================================
# Test Client
# ============================================================================


@pytest.fixture
def client():
    """FastAPI test client"""
    return TestClient(app)


@pytest.fixture
def test_user_data():
    """Test user data"""
    return {
        "id": "TEST001",
        "nombre": "Usuario Test",
        "rol": "asesor",
        "ruta": "001",
        "password_hash": hash_password("testpass123"),
        "activo": True,
        "bloqueado": False,
        "intentos_fallidos": 0,
    }


@pytest.fixture
def blocked_user_data():
    """Blocked user data"""
    return {
        "id": "BLOCKED001",
        "nombre": "Usuario Bloqueado",
        "rol": "asesor",
        "ruta": "001",
        "password_hash": hash_password("testpass123"),
        "activo": True,
        "bloqueado": True,
        "intentos_fallidos": 5,
    }


@pytest.fixture
def create_test_user(test_user_data):
    """Create test user in Firestore"""
    create_user(test_user_data["id"], test_user_data)
    yield test_user_data
    # Cleanup: delete user after test
    try:
        db = get_firestore_client()
        db.collection("users").document(test_user_data["id"]).delete()
    except:
        pass


@pytest.fixture
def create_blocked_user(blocked_user_data):
    """Create blocked user in Firestore"""
    create_user(blocked_user_data["id"], blocked_user_data)
    yield blocked_user_data
    # Cleanup
    try:
        db = get_firestore_client()
        db.collection("users").document(blocked_user_data["id"]).delete()
    except:
        pass


@pytest.fixture
def auth_token(test_user_data):
    """Generate valid JWT token for test user"""
    token_data = {
        "sub": test_user_data["id"],
        "rol": test_user_data["rol"],
        "ruta": test_user_data["ruta"]
    }
    return create_access_token(token_data)


@pytest.fixture
def auth_headers(auth_token):
    """Authorization headers with valid token"""
    return {"Authorization": f"Bearer {auth_token}"}


@pytest.fixture(autouse=True)
def clear_rate_limits():
    """Clear rate limiting state between tests"""
    from app.services import auth_service

    # Clear before test
    auth_service._login_attempts.clear()
    auth_service._locked_accounts.clear()

    yield

    # Clear after test
    auth_service._login_attempts.clear()
    auth_service._locked_accounts.clear()
