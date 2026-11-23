import pyodbc
from fastapi import APIRouter, Depends, status

from ..core.dependencies import get_current_user, get_current_veterinario
from ..database.conection import get_db
from ..models.usuario_model import Usuario
from ..repositories.historial_repository import HistorialRepository
from ..repositories.mascota_repository import MascotaRepository
from ..schemas.historial_esquema import (
    HistorialActualizar,
    HistorialCrear,
    HistorialRespuesta,
)
from ..services.historial_service import HistorialService

historial_router = APIRouter(prefix="/historial", tags=["Historial clínico"])


@historial_router.get(
    "/", response_model=list[HistorialRespuesta], status_code=status.HTTP_200_OK
)
def listar_historial(
    usuario: Usuario = Depends(get_current_user),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = HistorialService(
        HistorialRepository(conexion), MascotaRepository(conexion)
    )
    return servicio.listar(usuario)


@historial_router.get(
    "/{historial_id}",
    response_model=HistorialRespuesta,
    status_code=status.HTTP_200_OK,
)
def obtener_historial(
    historial_id: int,
    usuario: Usuario = Depends(get_current_user),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = HistorialService(
        HistorialRepository(conexion), MascotaRepository(conexion)
    )
    return servicio.obtener(usuario, historial_id)


@historial_router.post(
    "/",
    response_model=HistorialRespuesta,
    status_code=status.HTTP_201_CREATED,
)
def crear_historial(
    datos: HistorialCrear,
    usuario: Usuario = Depends(get_current_veterinario),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = HistorialService(
        HistorialRepository(conexion), MascotaRepository(conexion)
    )
    return servicio.crear(usuario, datos)


@historial_router.put(
    "/{historial_id}",
    response_model=HistorialRespuesta,
    status_code=status.HTTP_200_OK,
)
def actualizar_historial(
    historial_id: int,
    datos: HistorialActualizar,
    usuario: Usuario = Depends(get_current_veterinario),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = HistorialService(
        HistorialRepository(conexion), MascotaRepository(conexion)
    )
    return servicio.actualizar(usuario, historial_id, datos)


@historial_router.delete("/{historial_id}", status_code=status.HTTP_200_OK)
def eliminar_historial(
    historial_id: int,
    usuario: Usuario = Depends(get_current_veterinario),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = HistorialService(
        HistorialRepository(conexion), MascotaRepository(conexion)
    )
    return servicio.eliminar(usuario, historial_id)
