from fastapi import HTTPException, status

from ..models.producto_model import Producto
from ..repositories.producto_repository import ProductoRepository
from ..schemas.producto_esquema import ProductoActualizar, ProductoCrear


class ProductoService:
    def __init__(self, producto_repositorio: ProductoRepository):
        self.producto_repositorio = producto_repositorio

    def listar(self) -> list[Producto]:
        return self.producto_repositorio.listar()

    def obtener(self, producto_id: int) -> Producto:
        producto = self.producto_repositorio.obtener(producto_id)

        if not producto or not producto.activo:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado",
            )

        return producto

    def crear(self, datos: ProductoCrear) -> Producto:
        return self.producto_repositorio.crear(datos)

    def actualizar(
        self, producto_id: int, datos: ProductoActualizar
    ) -> Producto:
        producto = self.producto_repositorio.actualizar(producto_id, datos)

        if not producto:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado",
            )

        return producto

    def eliminar(self, producto_id: int) -> dict[str, str]:
        if not self.producto_repositorio.eliminar(producto_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Producto no encontrado",
            )

        return {"mensaje": "Producto dado de baja correctamente"}
