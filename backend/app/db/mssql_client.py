"""
SQL Server Client

Provides connection and query execution for legacy SQL Server database.
"""

import pymssql
from typing import List, Dict, Any, Optional
from datetime import date
from pathlib import Path

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# ============================================================================
# Connection Management
# ============================================================================

def get_connection() -> pymssql.Connection:
    """
    Create SQL Server connection using pymssql

    Returns:
        Active database connection

    Raises:
        Exception: If connection fails
    """
    try:
        connection = pymssql.connect(
            server=settings.MSSQL_SERVER,
            port=settings.MSSQL_PORT,
            user=settings.MSSQL_USER,
            password=settings.MSSQL_PASSWORD,
            database=settings.MSSQL_DATABASE,
            timeout=30,
            login_timeout=30
        )
        logger.info("SQL Server connection established")
        return connection
    except Exception as e:
        logger.error(f"Failed to connect to SQL Server: {str(e)}")
        raise


# ============================================================================
# Query Execution
# ============================================================================

def execute_query(query: str, params: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
    """
    Execute SQL query and return results as list of dictionaries

    Args:
        query: SQL query to execute
        params: Optional dictionary of parameters

    Returns:
        List of row dictionaries

    Raises:
        Exception: If query execution fails
    """
    connection = None
    try:
        connection = get_connection()
        cursor = connection.cursor()

        if params:
            cursor.execute(query, params)
        else:
            cursor.execute(query)

        # Get column names
        columns = [column[0] for column in cursor.description]

        # Fetch all rows and convert to dictionaries
        rows = []
        for row in cursor.fetchall():
            row_dict = {}
            for i, column in enumerate(columns):
                value = row[i]
                # Convert any special types to JSON-serializable types
                if isinstance(value, (bytes, bytearray)):
                    value = value.decode('utf-8')
                row_dict[column] = value
            rows.append(row_dict)

        logger.info(f"Query executed successfully, returned {len(rows)} rows")
        return rows

    except Exception as e:
        logger.error(f"Query execution failed: {str(e)}")
        raise
    finally:
        if connection:
            connection.close()


# ============================================================================
# Hoja de Visita Query
# ============================================================================

def get_hoja_visita_query(ruta: str, fecha: date) -> str:
    """
    Build the Hoja de Visita query with parameters

    Args:
        ruta: Route code (e.g., '001')
        fecha: Date for the route plan

    Returns:
        Parameterized SQL query string
    """
    # Read the base query from file
    query_file = Path(__file__).parent.parent.parent.parent / "docs" / "queries" / "HOJA_DE_VISITA.sql"

    if not query_file.exists():
        raise FileNotFoundError(f"Query file not found: {query_file}")

    with open(query_file, 'r', encoding='utf-8') as f:
        query = f.read()

    # Replace parameters in the query
    # Note: The original query uses variables at the top, we need to adapt it
    fecha_str = fecha.strftime('%Y-%m-%d')

    # Replace parameter declarations and values
    query = query.replace("SET @RUTA='001'", f"SET @RUTA='{ruta}'")
    query = query.replace("SET @FECHA='2025-09-01'", f"SET @FECHA='{fecha_str}'")

    return query


def execute_hoja_visita_query(ruta: str, fecha: date) -> List[Dict[str, Any]]:
    """
    Execute the Hoja de Visita query for a specific route and date

    Args:
        ruta: Route code (e.g., '001')
        fecha: Date for the route plan

    Returns:
        List of client records with sales data

    Raises:
        Exception: If query execution fails
    """
    try:
        logger.info(f"Executing Hoja de Visita query for route {ruta} on {fecha}")

        query = get_hoja_visita_query(ruta, fecha)
        results = execute_query(query)

        logger.info(f"Hoja de Visita query returned {len(results)} clients for route {ruta}")
        return results

    except Exception as e:
        logger.error(f"Failed to execute Hoja de Visita query: {str(e)}")
        raise


# ============================================================================
# Connection Test
# ============================================================================

def test_connection() -> bool:
    """
    Test SQL Server connection

    Returns:
        True if connection successful, False otherwise
    """
    try:
        connection = get_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        result = cursor.fetchone()
        connection.close()
        return result[0] == 1
    except Exception as e:
        logger.error(f"Connection test failed: {str(e)}")
        return False
