import pyodbc
from fastapi import APIRouter, Depends, status

from ..core.dependencies import get_current_admin
from ..database.conection import get_db
from ..models.usuario_model import Usuario
from ..repositories.producto_repository import ProductoRepository
from ..schemas.producto_esquema import (
    ProductoActualizar,
    ProductoCrear,
    ProductoRespuesta,
)
from ..services.producto_service import ProductoService

producto_router = APIRouter(prefix="/productos", tags=["Productos"])


@producto_router.get(
    "/", response_model=list[ProductoRespuesta], status_code=status.HTTP_200_OK
)
def listar_productos(conexion: pyodbc.Connection = Depends(get_db)):
    """Catálogo público: no requiere autenticación."""
    servicio = ProductoService(ProductoRepository(conexion))
    return servicio.listar()


@producto_router.get(
    "/{producto_id}",
    response_model=ProductoRespuesta,
    status_code=status.HTTP_200_OK,
)
def obtener_producto(
    producto_id: int, conexion: pyodbc.Connection = Depends(get_db)
):
    servicio = ProductoService(ProductoRepository(conexion))
    return servicio.obtener(producto_id)


@producto_router.post(
    "/", response_model=ProductoRespuesta, status_code=status.HTTP_201_CREATED
)
def crear_producto(
    datos: ProductoCrear,
    _: Usuario = Depends(get_current_admin),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = ProductoService(ProductoRepository(conexion))
    return servicio.crear(datos)


@producto_router.put(
    "/{producto_id}",
    response_model=ProductoRespuesta,
    status_code=status.HTTP_200_OK,
)
def actualizar_producto(
    producto_id: int,
    datos: ProductoActualizar,
    _: Usuario = Depends(get_current_admin),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = ProductoService(ProductoRepository(conexion))
    return servicio.actualizar(producto_id, datos)


@producto_router.delete("/{producto_id}", status_code=status.HTTP_200_OK)
def eliminar_producto(
    producto_id: int,
    _: Usuario = Depends(get_current_admin),
    conexion: pyodbc.Connection = Depends(get_db),
):
    servicio = ProductoService(ProductoRepository(conexion))
    return servicio.eliminar(producto_id)
