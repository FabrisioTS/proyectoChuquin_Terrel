import pyodbc
from fastapi import APIRouter, Depends, status

from ..core.dependencies import get_current_user, get_current_veterinario
from ..database.conection import get_db
from ..models.usuario_model import Usuario
from ..repositories.pago_repository import PagoRepository
from ..repositories.producto_repository import ProductoRepository
from ..schemas.pago_esquema import CheckoutSolicitud, PagoCrearDirecto, PagoRespuesta
from ..services.pago_service import PagoService

pago_router = APIRouter(prefix="/pagos", tags=["Pagos"])


@pago_router.get(
    "/", response_model=list[PagoRespuesta], status_code=status.HTTP_200_OK
)
def listar_pagos(
    usuario: Usuario = Depends(get_current_user),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = PagoService(
        PagoRepository(conexion), ProductoRepository(conexion)
    )
    return servicio.listar(usuario)


@pago_router.post(
    "/checkout", response_model=PagoRespuesta, status_code=status.HTTP_201_CREATED
)
def checkout(
    datos: CheckoutSolicitud,
    usuario: Usuario = Depends(get_current_user),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = PagoService(
        PagoRepository(conexion), ProductoRepository(conexion)
    )
    return servicio.checkout(usuario, datos)


@pago_router.post(
    "/directo", response_model=PagoRespuesta, status_code=status.HTTP_201_CREATED
)
def registrar_pago_directo(
    datos: PagoCrearDirecto,
    usuario: Usuario = Depends(get_current_veterinario),
    conexion: pyodbc.Connection = Depends(get_db),
):
    """Permite al veterinario o admin registrar un cobro o venta directa en clínica."""
    servicio = PagoService(
        PagoRepository(conexion), ProductoRepository(conexion)
    )
    return servicio.registrar_directo(usuario, datos)


@pago_router.patch(
    "/{pago_id}/pagar",
    response_model=PagoRespuesta,
    status_code=status.HTTP_200_OK,
)
def marcar_pago_pagado(
    pago_id: int,
    usuario: Usuario = Depends(get_current_user),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = PagoService(
        PagoRepository(conexion), ProductoRepository(conexion)
    )
    return servicio.marcar_pagado(usuario, pago_id)
