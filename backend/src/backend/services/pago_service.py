from datetime import date

import pyodbc
from fastapi import HTTPException, status

from ..models.pago_model import Pago
from ..models.usuario_model import Usuario
from ..repositories.pago_repository import PagoRepository
from ..repositories.producto_repository import ProductoRepository
from ..schemas.pago_esquema import CheckoutSolicitud
from .alcance import usuario_filtro


class PagoService:
    def __init__(
        self,
        pago_repositorio: PagoRepository,
        producto_repositorio: ProductoRepository,
    ):
        self.pago_repositorio = pago_repositorio
        self.producto_repositorio = producto_repositorio

    def listar(self, usuario: Usuario) -> list[Pago]:
        return self.pago_repositorio.listar(usuario_filtro(usuario))

    def checkout(self, usuario: Usuario, datos: CheckoutSolicitud) -> Pago:
        """Valida stock, descuenta y crea el comprobante en una transacción.

        Si cualquier producto no existe o no tiene stock, se lanza un 400 y
        get_db hace rollback de todos los cambios.
        """
        total = 0.0
        detalle: list[str] = []

        for item in datos.items:
            producto = self.producto_repositorio.obtener(item.producto_id)

            if not producto or not producto.activo:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Producto {item.producto_id} no encontrado",
                )

            if producto.stock < item.cantidad:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=(
                        f"Stock insuficiente para {producto.nombre}: "
                        f"disponible {producto.stock}"
                    ),
                )

            if not self.producto_repositorio.descontar_stock(
                item.producto_id, item.cantidad
            ):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"No se pudo descontar el stock de {producto.nombre}",
                )

            total += producto.precio * item.cantidad
            detalle.append(f"{item.cantidad}x {producto.nombre}")

        concepto = "Compra de tienda: " + ", ".join(detalle)

        # El código es único (UX_pagos_codigo). Si otro proceso lo tomó
        # entre la lectura y el INSERT, se reintenta con el siguiente.
        for _ in range(3):
            try:
                return self.pago_repositorio.crear(
                    usuario_id=usuario.id,
                    codigo=self.pago_repositorio.siguiente_codigo(),
                    concepto=concepto[:200],
                    fecha=date.today(),
                    monto=round(total, 2),
                    metodo=datos.metodo,
                    estado="Pagado",
                )
            except pyodbc.IntegrityError:
                continue

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No se pudo generar el código del comprobante. Inténtalo nuevamente.",
        )

    def marcar_pagado(self, usuario: Usuario, pago_id: int) -> Pago:
        pago = self.pago_repositorio.marcar_pagado(
            pago_id, usuario_filtro(usuario)
        )

        if not pago:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pago no encontrado",
            )

        return pago
