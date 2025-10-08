"""
Route Planning Endpoints

Handles route planning and client data retrieval.
"""

from fastapi import APIRouter, Depends, Query
from datetime import date

from app.schemas.route import PlanDeRuta
from app.schemas.auth import UserInDB
from app.api.dependencies import get_current_active_user
from app.services.route_service import get_route_plan
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter()


@router.get("/plan-de-ruta", response_model=PlanDeRuta)
async def get_plan_de_ruta(
    fecha: date = Query(default=None, description="Fecha del plan (YYYY-MM-DD)"),
    current_user: UserInDB = Depends(get_current_active_user)
):
    """
    Get route plan for authenticated user

    Returns route plan with clients and recommendations for the specified date.
    If no date is provided, returns plan for today.

    Args:
        fecha: Date for route plan (defaults to today)
        current_user: Current authenticated user

    Returns:
        PlanDeRuta with clients and recommendations

    Raises:
        HTTPException: 401 (unauthorized), 403 (forbidden), 500 (server error)
    """
    # Use today's date if not provided
    if fecha is None:
        fecha = date.today()

    logger.info(f"Getting route plan for user {current_user.id}, route {current_user.ruta}, date {fecha}")

    # Get route plan from service
    plan = get_route_plan(
        asesor_id=current_user.id,
        ruta=current_user.ruta,
        fecha=fecha
    )

    logger.info(f"Route plan retrieved: {len(plan.clientes)} clients")

    return plan
