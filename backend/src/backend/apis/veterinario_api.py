from datetime import date

import pyodbc
from fastapi import APIRouter, Depends, status

from ..core.dependencies import get_current_veterinario
from ..database.conection import get_db
from ..models.usuario_model import Usuario
from ..repositories.cita_repository import CitaRepository
from ..repositories.historial_repository import HistorialRepository
from ..repositories.mascota_repository import MascotaRepository
from ..repositories.pago_repository import PagoRepository
from ..repositories.usuario_repository import UsuarioRepository
from ..repositories.vacuna_repository import VacunaRepository
from ..schemas.cita_esquema import CitaRespuesta
from ..schemas.historial_esquema import HistorialRespuesta
from ..schemas.veterinario_esquema import (
    PacienteRespuesta,
    ResumenVeterinario,
)
from ..services.veterinario_service import VeterinarioService

veterinario_router = APIRouter(
    prefix="/veterinario", tags=["Portal del veterinario"]
)


def _servicio(conexion: pyodbc.Connection) -> VeterinarioService:
    return VeterinarioService(
        MascotaRepository(conexion),
        CitaRepository(conexion),
        VacunaRepository(conexion),
        HistorialRepository(conexion),
        PagoRepository(conexion),
        UsuarioRepository(conexion),
    )


@veterinario_router.get(
    "/resumen", response_model=ResumenVeterinario, status_code=status.HTTP_200_OK
)
def obtener_resumen(
    _: Usuario = Depends(get_current_veterinario),
    conexion: pyodbc.Connection = Depends(get_db),
):
    return _servicio(conexion).resumen()


@veterinario_router.get(
    "/pacientes",
    response_model=list[PacienteRespuesta],
    status_code=status.HTTP_200_OK,
)
def listar_pacientes(
    _: Usuario = Depends(get_current_veterinario),
    conexion: pyodbc.Connection = Depends(get_db),
):
    return _servicio(conexion).listar_pacientes()


@veterinario_router.get(
    "/agenda",
    response_model=list[CitaRespuesta],
    status_code=status.HTTP_200_OK,
)
def obtener_agenda(
    fecha: date | None = None,
    _: Usuario = Depends(get_current_veterinario),
    conexion: pyodbc.Connection = Depends(get_db),
):
    return _servicio(conexion).agenda(fecha)


@veterinario_router.get(
    "/historial-reciente",
    response_model=list[HistorialRespuesta],
    status_code=status.HTTP_200_OK,
)
def obtener_historial_reciente(
    _: Usuario = Depends(get_current_veterinario),
    conexion: pyodbc.Connection = Depends(get_db),
):
    return _servicio(conexion).historial_reciente()
