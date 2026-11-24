import pyodbc
from fastapi import APIRouter, Depends, status

from ..core.dependencies import get_current_user
from ..database.conection import get_db
from ..models.usuario_model import Usuario
from ..repositories.configuracion_repository import ConfiguracionRepository
from ..schemas.configuracion_esquema import (
    ConfiguracionActualizar,
    ConfiguracionRespuesta,
)
from ..services.configuracion_service import ConfiguracionService

configuracion_router = APIRouter(
    prefix="/configuracion", tags=["Configuración del usuario"]
)


@configuracion_router.get(
    "/", response_model=ConfiguracionRespuesta, status_code=status.HTTP_200_OK
)
def obtener_configuracion(
    usuario: Usuario = Depends(get_current_user),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = ConfiguracionService(ConfiguracionRepository(conexion))
    return servicio.obtener(usuario)


@configuracion_router.put(
    "/", response_model=ConfiguracionRespuesta, status_code=status.HTTP_200_OK
)
def guardar_configuracion(
    datos: ConfiguracionActualizar,
    usuario: Usuario = Depends(get_current_user),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = ConfiguracionService(ConfiguracionRepository(conexion))
    return servicio.guardar(usuario, datos)
