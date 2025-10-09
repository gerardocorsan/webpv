"""
Route Planning Service

Business logic for route planning and recommendations.
"""

import uuid
from datetime import date
from typing import List, Dict, Any
from app.core.logging import get_logger
from app.db.mssql_client import execute_hoja_visita_query
from app.schemas.route import PlanDeRuta, Cliente, Recomendacion, Coordenadas

logger = get_logger(__name__)

# Default coordinates for clients without geo data (Centro de CDMX)
DEFAULT_LAT = 19.4326
DEFAULT_LNG = -99.1332


# ============================================================================
# Data Transformation
# ============================================================================

def map_to_cliente(row: Dict[str, Any]) -> Cliente:
    """
    Map SQL Server row to Cliente schema

    Args:
        row: Dictionary with client data from SQL query

    Returns:
        Cliente object
    """
    # Extract client ID and name
    cliente_id = str(row.get("CLIENTE_ID", ""))
    nombre = row.get("NOMBRE_CLIENTE", "Cliente Sin Nombre")

    # Determine segmento (GECS)
    gecs = row.get("GECS", "BRONCE")
    if not gecs or gecs == "":
        gecs = "BRONCE"

    # Determine priority based on CTECUMPLIDO and sales data
    ctecumplido = row.get("CTECUMPLIDO", 0)
    prioridad = "media"

    if ctecumplido == 1:
        prioridad = "baja"  # Client meeting target
    elif gecs in ["PLATINO", "TITANIO"]:
        prioridad = "alta"  # High-value client
    elif row.get("IDSHOP"):
        prioridad = "alta"  # HEI program opportunity

    # Determine reason for visit
    razon_visita = _generate_razon_visita(row)

    # TODO: Coordinates - for M1 we use default, in M2 add real geocoding
    coordenadas = Coordenadas(lat=DEFAULT_LAT, lng=DEFAULT_LNG)

    return Cliente(
        id=cliente_id,
        codigo=str(row.get("CLIENTE_ID", "")),
        nombre=nombre,
        direccion=None,  # Not in current query
        coordenadas=coordenadas,
        segmento=gecs,
        razonVisita=razon_visita,
        prioridad=prioridad
    )


def _generate_razon_visita(row: Dict[str, Any]) -> str:
    """
    Generate visit reason based on client data

    Args:
        row: Client data row

    Returns:
        Visit reason string
    """
    gecs = row.get("GECS", "BRONCE")
    ctecumplido = row.get("CTECUMPLIDO", 0)
    idshop = row.get("IDSHOP")

    # Priority reasons
    if idshop:
        return "Inscripción programa HEI"
    elif ctecumplido == 0:
        return "Recuperación de ventas"
    elif row.get("ENFRIADORES"):
        return "Seguimiento de enfriadores"
    elif row.get("DESCLP"):
        return "Promoción activa - Lona"
    else:
        return f"Visita programada - Cliente {gecs}"


def generate_recomendaciones(cliente: Cliente, row: Dict[str, Any]) -> List[Recomendacion]:
    """
    Generate recommendations for a client based on sales data

    Args:
        cliente: Cliente object
        row: SQL query row with sales data

    Returns:
        List of Recomendacion objects
    """
    recomendaciones: List[Recomendacion] = []

    # 1. HEI Program recommendation (HIGH PRIORITY)
    if row.get("IDSHOP"):
        recomendaciones.append(Recomendacion(
            id=str(uuid.uuid4()),
            clienteId=cliente.id,
            tipo="informacion",
            prioridad="alta",
            titulo="Programa HEI disponible",
            descripcion="Cliente elegible para programa Heineken. Explicar beneficios y proceso de inscripción.",
            razonVisita="Oportunidad de crecimiento con programa HEI",
            sku=None
        ))

    # 2. Volume recovery (if sales dropped)
    cerveza_sant = row.get("CERVEZA_SANT", 0) or 0
    cerveza_sact = row.get("CERVEZA_SACT", 0) or 0

    if cerveza_sant > 0 and cerveza_sact < cerveza_sant * 0.8:
        drop_percentage = int(((cerveza_sant - cerveza_sact) / cerveza_sant) * 100)
        recomendaciones.append(Recomendacion(
            id=str(uuid.uuid4()),
            clienteId=cliente.id,
            tipo="venta",
            prioridad="alta",
            titulo=f"Recuperar ventas ({drop_percentage}% de caída)",
            descripcion=f"Las ventas han caído de {cerveza_sant} a {cerveza_sact} cartones. Investigar causas y ofrecer soluciones.",
            razonVisita="Recuperación de volumen de ventas",
            sku=None
        ))

    # 3. Maintain volume (if meeting target)
    elif row.get("CTECUMPLIDO") == 1:
        recomendaciones.append(Recomendacion(
            id=str(uuid.uuid4()),
            clienteId=cliente.id,
            tipo="venta",
            prioridad="media",
            titulo="Mantener volumen actual",
            descripcion=f"Cliente cumpliendo objetivo ({cliente.segmento}). Reforzar relación y asegurar continuidad.",
            razonVisita="Seguimiento de cliente cumplido",
            sku=None
        ))

    # 4. Product-specific opportunities
    # Miller High Life
    if row.get("MILLER") and (row.get("MILLER", 0) or 0) > 0:
        recomendaciones.append(Recomendacion(
            id=str(uuid.uuid4()),
            clienteId=cliente.id,
            tipo="venta",
            prioridad="media",
            titulo="Ampliar portafolio Miller",
            descripcion="Cliente compra Miller High Life. Ofrecer otras presentaciones o productos premium.",
            razonVisita="Oportunidad de cross-selling",
            sku="MILLER"
        ))

    # Indio
    if row.get("INDIO") and (row.get("INDIO", 0) or 0) > 0:
        recomendaciones.append(Recomendacion(
            id=str(uuid.uuid4()),
            clienteId=cliente.id,
            tipo="venta",
            prioridad="media",
            titulo="Incrementar Indio",
            descripcion="Cliente compra Indio. Proponer promociones o incrementar facing.",
            razonVisita="Oportunidad de crecimiento en marca Indio",
            sku="INDIO"
        ))

    # Tecate
    if row.get("TECATE") and (row.get("TECATE", 0) or 0) > 0:
        recomendaciones.append(Recomendacion(
            id=str(uuid.uuid4()),
            clienteId=cliente.id,
            tipo="venta",
            prioridad="media",
            titulo="Reforzar Tecate",
            descripcion="Cliente compra Tecate. Verificar inventario y proponer volumen adicional.",
            razonVisita="Oportunidad en marca Tecate",
            sku="TECATE"
        ))

    # XX Lager
    if row.get("XX") and (row.get("XX", 0) or 0) > 0:
        recomendaciones.append(Recomendacion(
            id=str(uuid.uuid4()),
            clienteId=cliente.id,
            tipo="venta",
            prioridad="media",
            titulo="Promover XX Lager",
            descripcion="Cliente compra XX Lager. Explorar oportunidades de crecimiento.",
            razonVisita="Oportunidad en marca XX",
            sku="XX"
        ))

    # 5. Promotion recommendation (if active)
    if row.get("DESCLP"):
        recomendaciones.append(Recomendacion(
            id=str(uuid.uuid4()),
            clienteId=cliente.id,
            tipo="merchandising",
            prioridad="alta",
            titulo="Promoción Lona activa",
            descripcion="Cliente tiene promoción de lona activa. Verificar cumplimiento y material POP.",
            razonVisita="Seguimiento de promoción",
            sku=None
        ))

    # 6. Cooler follow-up
    if row.get("ENFRIADORES"):
        recomendaciones.append(Recomendacion(
            id=str(uuid.uuid4()),
            clienteId=cliente.id,
            tipo="merchandising",
            prioridad="media",
            titulo="Seguimiento de enfriadores",
            descripcion="Cliente tiene enfriadores. Verificar funcionamiento y limpieza.",
            razonVisita="Mantenimiento de activos",
            sku=None
        ))

    return recomendaciones


# ============================================================================
# Main Service Function
# ============================================================================

def get_route_plan(asesor_id: str, ruta: str, fecha: date) -> PlanDeRuta:
    """
    Get route plan for a specific route and date

    Args:
        asesor_id: Asesor user ID
        ruta: Route code (e.g., '001')
        fecha: Date for the route plan

    Returns:
        PlanDeRuta object with clients and recommendations

    Raises:
        Exception: If query fails
    """
    logger.info(f"Getting route plan for asesor {asesor_id}, route {ruta}, date {fecha}")

    # Execute SQL query
    results = execute_hoja_visita_query(ruta, fecha)

    # Transform data
    clientes: List[Cliente] = []
    recomendaciones: List[Recomendacion] = []

    for row in results:
        # Map to Cliente
        cliente = map_to_cliente(row)
        clientes.append(cliente)

        # Generate recommendations
        cliente_recomendaciones = generate_recomendaciones(cliente, row)
        recomendaciones.extend(cliente_recomendaciones)

    # Build plan
    plan = PlanDeRuta(
        id=str(uuid.uuid4()),
        fecha=fecha.isoformat(),
        asesorId=asesor_id,
        clientes=clientes,
        recomendaciones=recomendaciones
    )

    logger.info(f"Route plan generated: {len(clientes)} clients, {len(recomendaciones)} recommendations")

    return plan
