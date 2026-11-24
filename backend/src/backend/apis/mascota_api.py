import pyodbc
from fastapi import APIRouter, Depends, status

from ..core.dependencies import get_current_user
from ..database.conection import get_db
from ..models.usuario_model import Usuario
from ..repositories.historial_repository import HistorialRepository
from ..repositories.mascota_repository import MascotaRepository
from ..schemas.historial_esquema import HistorialRespuesta
from ..schemas.mascota_esquema import (
    MascotaActualizar,
    MascotaCrear,
    MascotaRespuesta,
)
from ..services.historial_service import HistorialService
from ..services.mascota_service import MascotaService

mascota_router = APIRouter(prefix="/mascotas", tags=["Mascotas"])


@mascota_router.get(
    "/", response_model=list[MascotaRespuesta], status_code=status.HTTP_200_OK
)
def listar_mascotas(
    usuario: Usuario = Depends(get_current_user),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = MascotaService(MascotaRepository(conexion))
    return servicio.listar(usuario)


@mascota_router.get(
    "/{mascota_id}",
    response_model=MascotaRespuesta,
    status_code=status.HTTP_200_OK,
)
def obtener_mascota(
    mascota_id: int,
    usuario: Usuario = Depends(get_current_user),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = MascotaService(MascotaRepository(conexion))
    return servicio.obtener(usuario, mascota_id)


@mascota_router.post(
    "/", response_model=MascotaRespuesta, status_code=status.HTTP_201_CREATED
)
def crear_mascota(
    datos: MascotaCrear,
    usuario: Usuario = Depends(get_current_user),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = MascotaService(MascotaRepository(conexion))
    return servicio.crear(usuario, datos)


@mascota_router.put(
    "/{mascota_id}",
    response_model=MascotaRespuesta,
    status_code=status.HTTP_200_OK,
)
def actualizar_mascota(
    mascota_id: int,
    datos: MascotaActualizar,
    usuario: Usuario = Depends(get_current_user),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = MascotaService(MascotaRepository(conexion))
    return servicio.actualizar(usuario, mascota_id, datos)


@mascota_router.delete("/{mascota_id}", status_code=status.HTTP_200_OK)
def eliminar_mascota(
    mascota_id: int,
    usuario: Usuario = Depends(get_current_user),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = MascotaService(MascotaRepository(conexion))
    return servicio.eliminar(usuario, mascota_id)


@mascota_router.get(
    "/{mascota_id}/historial",
    response_model=list[HistorialRespuesta],
    status_code=status.HTTP_200_OK,
)
def listar_historial_de_mascota(
    mascota_id: int,
    usuario: Usuario = Depends(get_current_user),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = HistorialService(
        HistorialRepository(conexion), MascotaRepository(conexion)
    )
    return servicio.listar_por_mascota(usuario, mascota_id)
