"""
Firestore Seed Data

Populates Firestore with initial test data for development.

Usage:
    python -m app.db.seed_firestore
"""

import os
import sys
from datetime import datetime

# Add parent directory to path to allow imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../.."))

from app.core.security import hash_password
from app.db.firestore_client import create_user, set_config, get_firestore_client
from app.core.logging import get_logger, setup_logging

setup_logging()
logger = get_logger(__name__)


def seed_users():
    """Create test users"""
    logger.info("Creating test users...")

    users = [
        {
            "id": "A012345",
            "nombre": "Juan Pérez",
            "rol": "asesor",
            "ruta": "001",
            "password": "demo123",  # Will be hashed
            "activo": True,
            "bloqueado": False,
            "intentos_fallidos": 0,
        },
        {
            "id": "A067890",
            "nombre": "María González",
            "rol": "supervisor",
            "ruta": "002",
            "password": "test456",  # Will be hashed
            "activo": True,
            "bloqueado": False,
            "intentos_fallidos": 0,
        },
    ]

    for user_data in users:
        # Hash password
        password = user_data.pop("password")
        user_data["password_hash"] = hash_password(password)

        # Create user
        create_user(user_data["id"], user_data)
        logger.info(f"✓ Created user: {user_data['id']} ({user_data['nombre']})")


def seed_config():
    """Create initial configuration"""
    logger.info("Creating initial configuration...")

    configs = [
        {"key": "ff_inteligencia_competencia", "value": False},
        {"key": "ff_geo_validacion", "value": True},
        {"key": "ff_geo_validacion_precision_minima", "value": 100},  # meters
        {"key": "ff_apis_mock", "value": False},
        {"key": "ff_background_sync", "value": True},
        {"key": "ff_offline_mode", "value": True},
    ]

    for config in configs:
        set_config(config["key"], config["value"])
        logger.info(f"✓ Created config: {config['key']} = {config['value']}")


def clear_collections():
    """Clear existing data (optional)"""
    logger.info("Clearing existing data...")

    db = get_firestore_client()

    collections = ["users", "refresh_tokens", "configuracion"]

    for collection_name in collections:
        collection = db.collection(collection_name)
        docs = collection.stream()
        deleted = 0
        for doc in docs:
            doc.reference.delete()
            deleted += 1

        if deleted > 0:
            logger.info(f"✓ Deleted {deleted} documents from {collection_name}")


def main():
    """Main seed function"""
    logger.info("=" * 60)
    logger.info("Starting Firestore seed process")
    logger.info("=" * 60)

    try:
        # Option to clear existing data
        import sys
        if "--clear" in sys.argv:
            clear_collections()

        # Seed data
        seed_users()
        seed_config()

        logger.info("=" * 60)
        logger.info("✓ Firestore seed completed successfully!")
        logger.info("=" * 60)
        logger.info("\nTest credentials:")
        logger.info("  Asesor:")
        logger.info("    ID: A012345")
        logger.info("    Password: demo123")
        logger.info("    Ruta: 001")
        logger.info("\n  Supervisor:")
        logger.info("    ID: A067890")
        logger.info("    Password: test456")
        logger.info("    Ruta: 002")
        logger.info("=" * 60)

    except Exception as e:
        logger.error(f"✗ Seed failed: {str(e)}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()
