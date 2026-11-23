import pyodbc
from fastapi import APIRouter, Depends, Query, status

from ..core.dependencies import get_current_veterinario
from ..database.conection import get_db
from ..models.usuario_model import Usuario
from ..repositories.solicitud_repository import SolicitudRepository
from ..schemas.solicitud_esquema import (
    EstadoSolicitud,
    SolicitudCrear,
    SolicitudRespuesta,
)
from ..services.solicitud_service import SolicitudService

solicitud_router = APIRouter(prefix="/solicitudes", tags=["Solicitudes"])


@solicitud_router.post(
    "/", response_model=SolicitudRespuesta, status_code=status.HTTP_201_CREATED
)
def crear_solicitud(
    datos: SolicitudCrear,
    conexion: pyodbc.Connection = Depends(get_db),
):
    """Formulario público: no requiere autenticación."""
    servicio = SolicitudService(SolicitudRepository(conexion))
    return servicio.crear(datos)


@solicitud_router.get(
    "/", response_model=list[SolicitudRespuesta], status_code=status.HTTP_200_OK
)
def listar_solicitudes(
    estado: EstadoSolicitud | None = Query(default=None),
    _: Usuario = Depends(get_current_veterinario),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = SolicitudService(SolicitudRepository(conexion))
    return servicio.listar(estado)


@solicitud_router.put(
    "/{solicitud_id}/atendida",
    response_model=SolicitudRespuesta,
    status_code=status.HTTP_200_OK,
)
def marcar_atendida(
    solicitud_id: int,
    _: Usuario = Depends(get_current_veterinario),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = SolicitudService(SolicitudRepository(conexion))
    return servicio.marcar_atendida(solicitud_id)
