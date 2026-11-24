from datetime import date

import pyodbc
from fastapi import APIRouter, Depends, status

from ..core.dependencies import get_current_user
from ..database.conection import get_db
from ..models.usuario_model import Usuario
from ..repositories.cita_repository import CitaRepository
from ..repositories.mascota_repository import MascotaRepository
from ..schemas.cita_esquema import (
    CitaActualizar,
    CitaCrear,
    CitaEstado,
    CitaRespuesta,
)
from ..services.cita_service import CitaService

cita_router = APIRouter(prefix="/citas", tags=["Citas"])


@cita_router.get(
    "/", response_model=list[CitaRespuesta], status_code=status.HTTP_200_OK
)
def listar_citas(
    desde: date | None = None,
    hasta: date | None = None,
    usuario: Usuario = Depends(get_current_user),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = CitaService(CitaRepository(conexion), MascotaRepository(conexion))
    return servicio.listar(usuario, desde, hasta)


@cita_router.get(
    "/{cita_id}", response_model=CitaRespuesta, status_code=status.HTTP_200_OK
)
def obtener_cita(
    cita_id: int,
    usuario: Usuario = Depends(get_current_user),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = CitaService(CitaRepository(conexion), MascotaRepository(conexion))
    return servicio.obtener(usuario, cita_id)


@cita_router.post(
    "/", response_model=CitaRespuesta, status_code=status.HTTP_201_CREATED
)
def crear_cita(
    datos: CitaCrear,
    usuario: Usuario = Depends(get_current_user),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = CitaService(CitaRepository(conexion), MascotaRepository(conexion))
    return servicio.crear(usuario, datos)


@cita_router.put(
    "/{cita_id}", response_model=CitaRespuesta, status_code=status.HTTP_200_OK
)
def actualizar_cita(
    cita_id: int,
    datos: CitaActualizar,
    usuario: Usuario = Depends(get_current_user),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = CitaService(CitaRepository(conexion), MascotaRepository(conexion))
    return servicio.actualizar(usuario, cita_id, datos)


@cita_router.patch(
    "/{cita_id}/estado",
    response_model=CitaRespuesta,
    status_code=status.HTTP_200_OK,
)
def cambiar_estado_cita(
    cita_id: int,
    datos: CitaEstado,
    usuario: Usuario = Depends(get_current_user),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = CitaService(CitaRepository(conexion), MascotaRepository(conexion))
    return servicio.cambiar_estado(usuario, cita_id, datos.estado)


@cita_router.delete("/{cita_id}", status_code=status.HTTP_200_OK)
def eliminar_cita(
    cita_id: int,
    usuario: Usuario = Depends(get_current_user),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = CitaService(CitaRepository(conexion), MascotaRepository(conexion))
    return servicio.eliminar(usuario, cita_id)
