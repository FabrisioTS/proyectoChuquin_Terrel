from datetime import date

import pyodbc

from ..models.pago_model import Pago

COLUMNAS_PAGO = (
    "id, usuario_id, codigo, concepto, fecha, monto, metodo, estado, "
    "mascota_nombre, creado_en"
)


def _fila_a_pago(fila: pyodbc.Row) -> Pago:
    return Pago(
        id=fila.id,
        usuario_id=fila.usuario_id,
        codigo=fila.codigo,
        concepto=fila.concepto,
        fecha=fila.fecha,
        monto=float(fila.monto),
        metodo=fila.metodo,
        estado=fila.estado,
        mascota_nombre=fila.mascota_nombre,
        creado_en=fila.creado_en,
    )


class PagoRepository:
    def __init__(self, conexion: pyodbc.Connection):
        self.conexion = conexion

    def listar(self, usuario_id: int | None = None) -> list[Pago]:
        consulta = f"SELECT {COLUMNAS_PAGO} FROM pagos WHERE 1 = 1"
        parametros: list[object] = []

        if usuario_id is not None:
            consulta += " AND usuario_id = ?"
            parametros.append(usuario_id)

        consulta += " ORDER BY fecha DESC, id DESC"

        cursor = self.conexion.cursor()

        try:
            cursor.execute(consulta, parametros)
            filas = cursor.fetchall()
        finally:
            cursor.close()

        return [_fila_a_pago(fila) for fila in filas]

    def obtener(self, pago_id: int, usuario_id: int | None = None) -> Pago | None:
        consulta = f"SELECT {COLUMNAS_PAGO} FROM pagos WHERE id = ?"
        parametros: list[object] = [pago_id]

        if usuario_id is not None:
            consulta += " AND usuario_id = ?"
            parametros.append(usuario_id)

        cursor = self.conexion.cursor()

        try:
            cursor.execute(consulta, parametros)
            fila = cursor.fetchone()
        finally:
            cursor.close()

        return _fila_a_pago(fila) if fila else None

    def siguiente_codigo(self) -> str:
        cursor = self.conexion.cursor()

        try:
            cursor.execute("SELECT COUNT(*) FROM pagos")
            total = cursor.fetchone()[0]
        finally:
            cursor.close()

        return f"PAG-{total + 1:04d}"

    def crear(
        self,
        usuario_id: int,
        codigo: str,
        concepto: str,
        fecha: date,
        monto: float,
        metodo: str | None,
        estado: str,
        mascota_nombre: str | None = None,
    ) -> Pago:
        consulta = f"""
            INSERT INTO pagos
                (usuario_id, codigo, concepto, fecha, monto, metodo, estado,
                 mascota_nombre)
            OUTPUT INSERTED.{COLUMNAS_PAGO.replace(", ", ", INSERTED.")}
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """

        cursor = self.conexion.cursor()

        try:
            cursor.execute(
                consulta,
                usuario_id,
                codigo,
                concepto,
                fecha,
                monto,
                metodo,
                estado,
                mascota_nombre,
            )
            fila = cursor.fetchone()
        finally:
            cursor.close()

        if fila is None:
            raise RuntimeError("No se pudo recuperar el pago creado")

        return _fila_a_pago(fila)

    def marcar_pagado(self, pago_id: int, usuario_id: int | None = None) -> Pago | None:
        consulta = f"""
            UPDATE pagos
            SET estado = 'Pagado'
            OUTPUT INSERTED.{COLUMNAS_PAGO.replace(", ", ", INSERTED.")}
            WHERE id = ?
        """
        parametros: list[object] = [pago_id]

        if usuario_id is not None:
            consulta += " AND usuario_id = ?"
            parametros.append(usuario_id)

        cursor = self.conexion.cursor()

        try:
            cursor.execute(consulta, parametros)
            fila = cursor.fetchone()
        finally:
            cursor.close()

        return _fila_a_pago(fila) if fila else None
