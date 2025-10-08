"""
Route Planning Tests

Tests for route planning endpoint and data transformation.
"""

import pytest
from fastapi import status
from unittest.mock import patch, MagicMock
from datetime import date


class TestRoutePlanningEndpoint:
    """Test route planning API endpoint"""

    def test_get_route_plan_success(self, client, create_test_user, auth_headers):
        """Test getting route plan with valid authentication"""
        # Mock the SQL Server query to avoid DB dependency in tests
        mock_results = [
            {
                "CLIENTE_ID": "C001",
                "NOMBRE_CLIENTE": "Tienda Test",
                "GECS": "ORO",
                "RUTA": "001",
                "VISITA": "LMJV",
                "CTECUMPLIDO": 1,
                "CERVEZA_SANT": 50,
                "CERVEZA_SACT": 45,
                "IDSHOP": None,
                "ENFRIADORES": None,
                "DESCLP": None,
                "MILLER": None,
                "INDIO": None,
                "TECATE": None,
                "XX": None,
            }
        ]

        with patch("app.services.route_service.execute_hoja_visita_query", return_value=mock_results):
            response = client.get(
                "/api/plan-de-ruta",
                headers=auth_headers
            )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # Should have required fields
        assert "id" in data
        assert "fecha" in data
        assert "asesorId" in data
        assert "clientes" in data
        assert "recomendaciones" in data

        # Should have at least one client
        assert len(data["clientes"]) > 0

        # Client should have required fields
        cliente = data["clientes"][0]
        assert "id" in cliente
        assert "nombre" in cliente
        assert "segmento" in cliente
        assert "razonVisita" in cliente
        assert "prioridad" in cliente

    def test_get_route_plan_with_date(self, client, create_test_user, auth_headers):
        """Test getting route plan with specific date"""
        mock_results = []

        with patch("app.services.route_service.execute_hoja_visita_query", return_value=mock_results):
            response = client.get(
                "/api/plan-de-ruta?fecha=2025-09-01",
                headers=auth_headers
            )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # Date should match request
        assert data["fecha"] == "2025-09-01"

    def test_get_route_plan_unauthorized(self, client):
        """Test getting route plan without authentication"""
        response = client.get("/api/plan-de-ruta")

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_get_route_plan_invalid_token(self, client):
        """Test getting route plan with invalid token"""
        response = client.get(
            "/api/plan-de-ruta",
            headers={"Authorization": "Bearer invalid-token"}
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        data = response.json()

        assert data["error"] == "INVALID_CREDENTIALS"

    def test_get_route_plan_empty_results(self, client, create_test_user, auth_headers):
        """Test getting route plan when no clients found"""
        # Mock empty results
        with patch("app.services.route_service.execute_hoja_visita_query", return_value=[]):
            response = client.get(
                "/api/plan-de-ruta",
                headers=auth_headers
            )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # Should return empty lists
        assert len(data["clientes"]) == 0
        assert len(data["recomendaciones"]) == 0


class TestRecommendationGeneration:
    """Test recommendation generation logic"""

    def test_recommendations_for_hei_program(self, client, create_test_user, auth_headers):
        """Test HEI program recommendation"""
        mock_results = [
            {
                "CLIENTE_ID": "C001",
                "NOMBRE_CLIENTE": "Tienda HEI",
                "GECS": "PLATINO",
                "RUTA": "001",
                "VISITA": "LMJV",
                "CTECUMPLIDO": 1,
                "CERVEZA_SANT": 50,
                "CERVEZA_SACT": 50,
                "IDSHOP": "HEI001",  # HEI program eligible
                "ENFRIADORES": None,
                "DESCLP": None,
                "MILLER": None,
                "INDIO": None,
                "TECATE": None,
                "XX": None,
            }
        ]

        with patch("app.services.route_service.execute_hoja_visita_query", return_value=mock_results):
            response = client.get(
                "/api/plan-de-ruta",
                headers=auth_headers
            )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # Should have HEI recommendation
        recomendaciones = data["recomendaciones"]
        assert len(recomendaciones) > 0

        # Find HEI recommendation
        hei_rec = next((r for r in recomendaciones if "HEI" in r["titulo"]), None)
        assert hei_rec is not None
        assert hei_rec["prioridad"] == "alta"
        assert hei_rec["tipo"] == "informacion"

    def test_recommendations_for_sales_drop(self, client, create_test_user, auth_headers):
        """Test recommendation for sales drop"""
        mock_results = [
            {
                "CLIENTE_ID": "C002",
                "NOMBRE_CLIENTE": "Tienda Baja Ventas",
                "GECS": "ORO",
                "RUTA": "001",
                "VISITA": "LMJV",
                "CTECUMPLIDO": 0,
                "CERVEZA_SANT": 100,  # Previous week
                "CERVEZA_SACT": 50,   # Current week (50% drop)
                "IDSHOP": None,
                "ENFRIADORES": None,
                "DESCLP": None,
                "MILLER": None,
                "INDIO": None,
                "TECATE": None,
                "XX": None,
            }
        ]

        with patch("app.services.route_service.execute_hoja_visita_query", return_value=mock_results):
            response = client.get(
                "/api/plan-de-ruta",
                headers=auth_headers
            )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # Should have recovery recommendation
        recomendaciones = data["recomendaciones"]
        recovery_rec = next((r for r in recomendaciones if "Recuperar" in r["titulo"]), None)
        assert recovery_rec is not None
        assert recovery_rec["prioridad"] == "alta"
        assert recovery_rec["tipo"] == "venta"

    def test_recommendations_for_product_sales(self, client, create_test_user, auth_headers):
        """Test recommendations for specific product sales"""
        mock_results = [
            {
                "CLIENTE_ID": "C003",
                "NOMBRE_CLIENTE": "Tienda Productos",
                "GECS": "PLATA",
                "RUTA": "001",
                "VISITA": "LMJV",
                "CTECUMPLIDO": 1,
                "CERVEZA_SANT": 50,
                "CERVEZA_SACT": 50,
                "IDSHOP": None,
                "ENFRIADORES": None,
                "DESCLP": None,
                "MILLER": 10,  # Sells Miller
                "INDIO": 15,   # Sells Indio
                "TECATE": None,
                "XX": None,
            }
        ]

        with patch("app.services.route_service.execute_hoja_visita_query", return_value=mock_results):
            response = client.get(
                "/api/plan-de-ruta",
                headers=auth_headers
            )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        recomendaciones = data["recomendaciones"]

        # Should have recommendations for Miller and Indio
        product_recs = [r for r in recomendaciones if r.get("sku") in ["MILLER", "INDIO"]]
        assert len(product_recs) >= 2


class TestDataTransformation:
    """Test data transformation from SQL to API format"""

    def test_client_mapping(self, client, create_test_user, auth_headers):
        """Test client data is correctly mapped"""
        mock_results = [
            {
                "CLIENTE_ID": "C123",
                "NOMBRE_CLIENTE": "Tienda Ejemplo",
                "GECS": "TITANIO",
                "RUTA": "001",
                "VISITA": "LMJV",
                "CTECUMPLIDO": 1,
                "CERVEZA_SANT": 100,
                "CERVEZA_SACT": 95,
                "IDSHOP": None,
                "ENFRIADORES": None,
                "DESCLP": None,
                "MILLER": None,
                "INDIO": None,
                "TECATE": None,
                "XX": None,
            }
        ]

        with patch("app.services.route_service.execute_hoja_visita_query", return_value=mock_results):
            response = client.get(
                "/api/plan-de-ruta",
                headers=auth_headers
            )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        cliente = data["clientes"][0]

        # Check all required fields are present
        assert cliente["id"] == "C123"
        assert cliente["codigo"] == "C123"
        assert cliente["nombre"] == "Tienda Ejemplo"
        assert cliente["segmento"] == "TITANIO"
        assert "razonVisita" in cliente
        assert "prioridad" in cliente
        assert "coordenadas" in cliente

        # Priority should be correct for TITANIO client
        assert cliente["prioridad"] in ["alta", "media", "baja"]
