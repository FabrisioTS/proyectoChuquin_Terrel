import pyodbc
from fastapi import APIRouter, Depends, status

from ..core.dependencies import get_current_veterinario
from ..database.conection import get_db
from ..models.usuario_model import Usuario
from ..repositories.solicitud_repository import SolicitudRepository
from ..schemas.solicitud_esquema import (
    SolicitudCitaCrear,
    SolicitudCitaRespuesta,
)
from ..services.solicitud_service import SolicitudService

solicitud_router = APIRouter(prefix="/solicitudes", tags=["Solicitudes de Citas"])


@solicitud_router.post(
    "/",
    response_model=SolicitudCitaRespuesta,
    status_code=status.HTTP_201_CREATED,
)
def registrar_solicitud(
    datos: SolicitudCitaCrear,
    conexion: pyodbc.Connection = Depends(get_db),
):
    """Endpoint público: registra la solicitud de cita enviada desde la web."""
    servicio = SolicitudService(SolicitudRepository(conexion))
    return servicio.registrar_solicitud(datos)


@solicitud_router.get(
    "/",
    response_model=list[SolicitudCitaRespuesta],
    status_code=status.HTTP_200_OK,
)
def listar_solicitudes(
    _: Usuario = Depends(get_current_veterinario),
    conexion: pyodbc.Connection = Depends(get_db),
):
    """Bandeja administrativa para veterinarios."""
    servicio = SolicitudService(SolicitudRepository(conexion))
    return servicio.listar_solicitudes()
