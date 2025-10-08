"""
Route Planning Pydantic Schemas

Models for route planning and client data.
"""

from pydantic import BaseModel
from typing import Optional, List, Literal
from datetime import date


class Coordenadas(BaseModel):
    """Geographic coordinates"""
    lat: float
    lng: float


class Cliente(BaseModel):
    """Client information"""
    id: str
    codigo: str
    nombre: str
    direccion: Optional[str] = None
    coordenadas: Optional[Coordenadas] = None
    segmento: str  # GECS segment (BRONCE, PLATA, ORO, PLATINO, TITANIO)
    razonVisita: str
    prioridad: Literal["alta", "media", "baja"]


class Recomendacion(BaseModel):
    """Visit recommendation"""
    id: str
    clienteId: str
    tipo: Literal["venta", "cobranza", "merchandising", "informacion"]
    prioridad: Literal["alta", "media", "baja"]
    titulo: str
    descripcion: str
    razonVisita: str
    sku: Optional[str] = None


class PlanDeRuta(BaseModel):
    """Complete route plan for a day"""
    id: str
    fecha: str  # ISO date (YYYY-MM-DD)
    asesorId: str
    clientes: List[Cliente]
    recomendaciones: List[Recomendacion]
