import pyodbc

from ..models.producto_model import Producto
from ..schemas.producto_esquema import ProductoActualizar, ProductoCrear

COLUMNAS_PRODUCTO = (
    "id, nombre, categoria, precio, stock, descripcion, emoji, imagen, activo, "
    "creado_en"
)


def _fila_a_producto(fila: pyodbc.Row) -> Producto:
    return Producto(
        id=fila.id,
        nombre=fila.nombre,
        categoria=fila.categoria,
        precio=float(fila.precio),
        stock=fila.stock,
        descripcion=fila.descripcion,
        emoji=fila.emoji,
        imagen=fila.imagen,
        activo=bool(fila.activo),
        creado_en=fila.creado_en,
    )


class ProductoRepository:
    def __init__(self, conexion: pyodbc.Connection):
        self.conexion = conexion

    def listar(self, incluir_inactivos: bool = False) -> list[Producto]:
        consulta = f"SELECT {COLUMNAS_PRODUCTO} FROM productos"

        if not incluir_inactivos:
            consulta += " WHERE activo = 1"

        consulta += " ORDER BY nombre"

        cursor = self.conexion.cursor()

        try:
            cursor.execute(consulta)
            filas = cursor.fetchall()
        finally:
            cursor.close()

        return [_fila_a_producto(fila) for fila in filas]

    def obtener(self, producto_id: int) -> Producto | None:
        cursor = self.conexion.cursor()

        try:
            cursor.execute(
                f"SELECT {COLUMNAS_PRODUCTO} FROM productos WHERE id = ?",
                producto_id,
            )
            fila = cursor.fetchone()
        finally:
            cursor.close()

        return _fila_a_producto(fila) if fila else None

    def crear(self, datos: ProductoCrear) -> Producto:
        consulta = f"""
            INSERT INTO productos
                (nombre, categoria, precio, stock, descripcion, emoji, imagen, activo)
            OUTPUT INSERTED.{COLUMNAS_PRODUCTO.replace(", ", ", INSERTED.")}
            VALUES (?, ?, ?, ?, ?, ?, ?, 1)
        """

        cursor = self.conexion.cursor()

        try:
            cursor.execute(
                consulta,
                datos.nombre,
                datos.categoria,
                datos.precio,
                datos.stock,
                datos.descripcion,
                datos.emoji,
                datos.imagen,
            )
            fila = cursor.fetchone()
        finally:
            cursor.close()

        if fila is None:
            raise RuntimeError("No se pudo recuperar el producto creado")

        return _fila_a_producto(fila)

    def actualizar(
        self, producto_id: int, datos: ProductoActualizar
    ) -> Producto | None:
        consulta = f"""
            UPDATE productos
            SET nombre = ?, categoria = ?, precio = ?, stock = ?,
                descripcion = ?, emoji = ?, imagen = ?
            OUTPUT INSERTED.{COLUMNAS_PRODUCTO.replace(", ", ", INSERTED.")}
            WHERE id = ?
        """

        cursor = self.conexion.cursor()

        try:
            cursor.execute(
                consulta,
                datos.nombre,
                datos.categoria,
                datos.precio,
                datos.stock,
                datos.descripcion,
                datos.emoji,
                datos.imagen,
                producto_id,
            )
            fila = cursor.fetchone()
        finally:
            cursor.close()

        return _fila_a_producto(fila) if fila else None

    def eliminar(self, producto_id: int) -> bool:
        """Baja lógica para no romper comprobantes históricos."""
        cursor = self.conexion.cursor()

        try:
            cursor.execute(
                "UPDATE productos SET activo = 0 WHERE id = ? AND activo = 1",
                producto_id,
            )
            filas = cursor.rowcount
        finally:
            cursor.close()

        return filas > 0

    def descontar_stock(self, producto_id: int, cantidad: int) -> bool:
        """Descuenta stock solo si alcanza; devuelve False si no hay suficiente."""
        cursor = self.conexion.cursor()

        try:
            cursor.execute(
                """
                UPDATE productos
                SET stock = stock - ?
                WHERE id = ? AND activo = 1 AND stock >= ?
                """,
                cantidad,
                producto_id,
                cantidad,
            )
            filas = cursor.rowcount
        finally:
            cursor.close()

        return filas > 0
