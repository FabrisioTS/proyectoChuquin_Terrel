import pyodbc

from ..models.vacuna_model import Vacuna
from ..schemas.vacuna_esquema import VacunaActualizar, VacunaCrear

COLUMNAS_VACUNA = (
    "id, usuario_id, mascota_id, mascota_nombre, nombre, tipo, fecha_aplicacion, "
    "proxima_dosis, lote, observaciones, creado_en"
)


def _fila_a_vacuna(fila: pyodbc.Row) -> Vacuna:
    return Vacuna(
        id=fila.id,
        usuario_id=fila.usuario_id,
        mascota_id=fila.mascota_id,
        mascota_nombre=fila.mascota_nombre,
        nombre=fila.nombre,
        tipo=fila.tipo,
        fecha_aplicacion=fila.fecha_aplicacion,
        proxima_dosis=fila.proxima_dosis,
        lote=fila.lote,
        observaciones=fila.observaciones,
        creado_en=fila.creado_en,
    )


class VacunaRepository:
    def __init__(self, conexion: pyodbc.Connection):
        self.conexion = conexion

    def listar(
        self,
        usuario_id: int | None = None,
        mascota_id: int | None = None,
    ) -> list[Vacuna]:
        consulta = f"SELECT {COLUMNAS_VACUNA} FROM vacunas WHERE 1 = 1"
        parametros: list[object] = []

        if usuario_id is not None:
            consulta += " AND usuario_id = ?"
            parametros.append(usuario_id)

        if mascota_id is not None:
            consulta += " AND mascota_id = ?"
            parametros.append(mascota_id)

        consulta += " ORDER BY fecha_aplicacion DESC, id DESC"

        cursor = self.conexion.cursor()

        try:
            cursor.execute(consulta, parametros)
            filas = cursor.fetchall()
        finally:
            cursor.close()

        return [_fila_a_vacuna(fila) for fila in filas]

    def obtener(
        self, vacuna_id: int, usuario_id: int | None = None
    ) -> Vacuna | None:
        consulta = f"SELECT {COLUMNAS_VACUNA} FROM vacunas WHERE id = ?"
        parametros: list[object] = [vacuna_id]

        if usuario_id is not None:
            consulta += " AND usuario_id = ?"
            parametros.append(usuario_id)

        cursor = self.conexion.cursor()

        try:
            cursor.execute(consulta, parametros)
            fila = cursor.fetchone()
        finally:
            cursor.close()

        return _fila_a_vacuna(fila) if fila else None

    def crear(
        self, datos: VacunaCrear, usuario_id: int, mascota_nombre: str
    ) -> Vacuna:
        consulta = f"""
            INSERT INTO vacunas
                (usuario_id, mascota_id, mascota_nombre, nombre, tipo,
                 fecha_aplicacion, proxima_dosis, lote, observaciones)
            OUTPUT INSERTED.{COLUMNAS_VACUNA.replace(", ", ", INSERTED.")}
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        cursor = self.conexion.cursor()

        try:
            cursor.execute(
                consulta,
                usuario_id,
                datos.mascota_id,
                mascota_nombre,
                datos.nombre,
                datos.tipo,
                datos.fecha_aplicacion,
                datos.proxima_dosis,
                datos.lote,
                datos.observaciones,
            )
            fila = cursor.fetchone()
        finally:
            cursor.close()

        if fila is None:
            raise RuntimeError("No se pudo recuperar el registro sanitario")

        return _fila_a_vacuna(fila)

    def actualizar(
        self, vacuna_id: int, datos: VacunaActualizar
    ) -> Vacuna | None:
        consulta = f"""
            UPDATE vacunas
            SET nombre = ?, tipo = ?, fecha_aplicacion = ?, proxima_dosis = ?,
                lote = ?, observaciones = ?
            OUTPUT INSERTED.{COLUMNAS_VACUNA.replace(", ", ", INSERTED.")}
            WHERE id = ?
        """

        cursor = self.conexion.cursor()

        try:
            cursor.execute(
                consulta,
                datos.nombre,
                datos.tipo,
                datos.fecha_aplicacion,
                datos.proxima_dosis,
                datos.lote,
                datos.observaciones,
                vacuna_id,
            )
            fila = cursor.fetchone()
        finally:
            cursor.close()

        return _fila_a_vacuna(fila) if fila else None

    def eliminar(self, vacuna_id: int) -> bool:
        cursor = self.conexion.cursor()

        try:
            cursor.execute("DELETE FROM vacunas WHERE id = ?", vacuna_id)
            filas = cursor.rowcount
        finally:
            cursor.close()

        return filas > 0
