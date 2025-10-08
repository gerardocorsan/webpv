"""
Firestore Client

Provides connection and CRUD operations for Firestore database.
"""

import os
from typing import Dict, Any, Optional, List
from datetime import datetime
from google.cloud import firestore
from google.cloud.firestore_v1.base_query import FieldFilter

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# ============================================================================
# Client Initialization
# ============================================================================

_db_instance: Optional[firestore.Client] = None


def get_firestore_client() -> firestore.Client:
    """
    Get or create Firestore client instance

    Returns:
        Firestore client

    Raises:
        Exception: If initialization fails
    """
    global _db_instance

    if _db_instance is not None:
        return _db_instance

    try:
        # Check if using emulator
        if settings.FIRESTORE_EMULATOR_HOST:
            os.environ["FIRESTORE_EMULATOR_HOST"] = settings.FIRESTORE_EMULATOR_HOST
            logger.info(f"Using Firestore emulator at {settings.FIRESTORE_EMULATOR_HOST}")

        # Initialize Firestore client
        _db_instance = firestore.Client(project=settings.FIRESTORE_PROJECT_ID)
        logger.info("Firestore client initialized successfully")

        return _db_instance

    except Exception as e:
        logger.error(f"Failed to initialize Firestore client: {str(e)}")
        raise


# ============================================================================
# Collection References
# ============================================================================

COLLECTION_USERS = "users"
COLLECTION_REFRESH_TOKENS = "refresh_tokens"
COLLECTION_CONFIGURACION = "configuracion"


# ============================================================================
# User Operations
# ============================================================================

def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
    """
    Get user by ID

    Args:
        user_id: User ID

    Returns:
        User document or None if not found
    """
    try:
        db = get_firestore_client()
        doc_ref = db.collection(COLLECTION_USERS).document(user_id)
        doc = doc_ref.get()

        if doc.exists:
            return doc.to_dict()
        return None

    except Exception as e:
        logger.error(f"Failed to get user {user_id}: {str(e)}")
        raise


def create_user(user_id: str, user_data: Dict[str, Any]) -> None:
    """
    Create a new user

    Args:
        user_id: User ID
        user_data: User data dictionary
    """
    try:
        db = get_firestore_client()
        doc_ref = db.collection(COLLECTION_USERS).document(user_id)

        # Add metadata
        user_data["created_at"] = datetime.utcnow()
        user_data["updated_at"] = datetime.utcnow()

        doc_ref.set(user_data)
        logger.info(f"User {user_id} created successfully")

    except Exception as e:
        logger.error(f"Failed to create user {user_id}: {str(e)}")
        raise


def update_user(user_id: str, updates: Dict[str, Any]) -> None:
    """
    Update user data

    Args:
        user_id: User ID
        updates: Dictionary with fields to update
    """
    try:
        db = get_firestore_client()
        doc_ref = db.collection(COLLECTION_USERS).document(user_id)

        # Add update timestamp
        updates["updated_at"] = datetime.utcnow()

        doc_ref.update(updates)
        logger.info(f"User {user_id} updated successfully")

    except Exception as e:
        logger.error(f"Failed to update user {user_id}: {str(e)}")
        raise


# ============================================================================
# Refresh Token Operations
# ============================================================================

def save_refresh_token(
    token: str,
    user_id: str,
    expires_at: datetime
) -> None:
    """
    Save refresh token

    Args:
        token: Refresh token string
        user_id: Associated user ID
        expires_at: Token expiration datetime
    """
    try:
        db = get_firestore_client()
        doc_ref = db.collection(COLLECTION_REFRESH_TOKENS).document(token)

        doc_ref.set({
            "user_id": user_id,
            "expires_at": expires_at,
            "created_at": datetime.utcnow(),
            "revoked": False
        })

        logger.info(f"Refresh token saved for user {user_id}")

    except Exception as e:
        logger.error(f"Failed to save refresh token: {str(e)}")
        raise


def get_refresh_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Get refresh token data

    Args:
        token: Refresh token string

    Returns:
        Token document or None if not found
    """
    try:
        db = get_firestore_client()
        doc_ref = db.collection(COLLECTION_REFRESH_TOKENS).document(token)
        doc = doc_ref.get()

        if doc.exists:
            return doc.to_dict()
        return None

    except Exception as e:
        logger.error(f"Failed to get refresh token: {str(e)}")
        raise


def revoke_refresh_token(token: str) -> None:
    """
    Revoke a refresh token

    Args:
        token: Refresh token to revoke
    """
    try:
        db = get_firestore_client()
        doc_ref = db.collection(COLLECTION_REFRESH_TOKENS).document(token)

        doc_ref.update({
            "revoked": True,
            "revoked_at": datetime.utcnow()
        })

        logger.info("Refresh token revoked")

    except Exception as e:
        logger.error(f"Failed to revoke refresh token: {str(e)}")
        raise


def delete_expired_tokens() -> int:
    """
    Delete expired refresh tokens (cleanup task)

    Returns:
        Number of tokens deleted
    """
    try:
        db = get_firestore_client()
        now = datetime.utcnow()

        # Query expired tokens
        query = db.collection(COLLECTION_REFRESH_TOKENS).where(
            filter=FieldFilter("expires_at", "<", now)
        )

        deleted_count = 0
        for doc in query.stream():
            doc.reference.delete()
            deleted_count += 1

        logger.info(f"Deleted {deleted_count} expired refresh tokens")
        return deleted_count

    except Exception as e:
        logger.error(f"Failed to delete expired tokens: {str(e)}")
        raise


# ============================================================================
# Configuration Operations
# ============================================================================

def get_config(key: str) -> Optional[Any]:
    """
    Get configuration value

    Args:
        key: Configuration key

    Returns:
        Configuration value or None if not found
    """
    try:
        db = get_firestore_client()
        doc_ref = db.collection(COLLECTION_CONFIGURACION).document(key)
        doc = doc_ref.get()

        if doc.exists:
            data = doc.to_dict()
            return data.get("value")
        return None

    except Exception as e:
        logger.error(f"Failed to get config {key}: {str(e)}")
        raise


def set_config(key: str, value: Any) -> None:
    """
    Set configuration value

    Args:
        key: Configuration key
        value: Configuration value
    """
    try:
        db = get_firestore_client()
        doc_ref = db.collection(COLLECTION_CONFIGURACION).document(key)

        doc_ref.set({
            "value": value,
            "updated_at": datetime.utcnow()
        })

        logger.info(f"Configuration {key} updated")

    except Exception as e:
        logger.error(f"Failed to set config {key}: {str(e)}")
        raise


# ============================================================================
# Connection Test
# ============================================================================

def test_connection() -> bool:
    """
    Test Firestore connection

    Returns:
        True if connection successful, False otherwise
    """
    try:
        db = get_firestore_client()
        # Try to read from a collection (will work even if empty)
        list(db.collection(COLLECTION_USERS).limit(1).stream())
        logger.info("Firestore connection test successful")
        return True
    except Exception as e:
        logger.error(f"Firestore connection test failed: {str(e)}")
        return False
