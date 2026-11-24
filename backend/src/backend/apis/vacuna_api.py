import pyodbc
from fastapi import APIRouter, Depends, status

from ..core.dependencies import get_current_user, get_current_veterinario
from ..database.conection import get_db
from ..models.usuario_model import Usuario
from ..repositories.mascota_repository import MascotaRepository
from ..repositories.vacuna_repository import VacunaRepository
from ..schemas.vacuna_esquema import (
    VacunaActualizar,
    VacunaCrear,
    VacunaRespuesta,
)
from ..services.vacuna_service import VacunaService

vacuna_router = APIRouter(prefix="/vacunas", tags=["Vacunas y tratamientos"])


@vacuna_router.get(
    "/", response_model=list[VacunaRespuesta], status_code=status.HTTP_200_OK
)
def listar_vacunas(
    mascota_id: int | None = None,
    usuario: Usuario = Depends(get_current_user),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = VacunaService(
        VacunaRepository(conexion), MascotaRepository(conexion)
    )
    return servicio.listar(usuario, mascota_id)


@vacuna_router.post(
    "/", response_model=VacunaRespuesta, status_code=status.HTTP_201_CREATED
)
def crear_vacuna(
    datos: VacunaCrear,
    usuario: Usuario = Depends(get_current_veterinario),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = VacunaService(
        VacunaRepository(conexion), MascotaRepository(conexion)
    )
    return servicio.crear(usuario, datos)


@vacuna_router.put(
    "/{vacuna_id}",
    response_model=VacunaRespuesta,
    status_code=status.HTTP_200_OK,
)
def actualizar_vacuna(
    vacuna_id: int,
    datos: VacunaActualizar,
    usuario: Usuario = Depends(get_current_veterinario),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = VacunaService(
        VacunaRepository(conexion), MascotaRepository(conexion)
    )
    return servicio.actualizar(usuario, vacuna_id, datos)


@vacuna_router.delete("/{vacuna_id}", status_code=status.HTTP_200_OK)
def eliminar_vacuna(
    vacuna_id: int,
    usuario: Usuario = Depends(get_current_veterinario),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = VacunaService(
        VacunaRepository(conexion), MascotaRepository(conexion)
    )
    return servicio.eliminar(usuario, vacuna_id)
