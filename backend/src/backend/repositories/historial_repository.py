import pyodbc

from ..models.historial_model import Historial
from ..schemas.historial_esquema import HistorialActualizar, HistorialCrear

COLUMNAS_HISTORIAL = (
    "id, usuario_id, mascota_id, veterinario_id, mascota_nombre, fecha, doctor, "
    "motivo, diagnostico, tratamiento, receta, creado_en"
)


def _fila_a_historial(fila: pyodbc.Row) -> Historial:
    return Historial(
        id=fila.id,
        usuario_id=fila.usuario_id,
        mascota_id=fila.mascota_id,
        veterinario_id=fila.veterinario_id,
        mascota_nombre=fila.mascota_nombre,
        fecha=fila.fecha,
        doctor=fila.doctor,
        motivo=fila.motivo,
        diagnostico=fila.diagnostico,
        tratamiento=fila.tratamiento,
        receta=fila.receta,
        creado_en=fila.creado_en,
    )


class HistorialRepository:
    def __init__(self, conexion: pyodbc.Connection):
        self.conexion = conexion

    def listar(
        self,
        usuario_id: int | None = None,
        mascota_id: int | None = None,
    ) -> list[Historial]:
        consulta = f"SELECT {COLUMNAS_HISTORIAL} FROM historial WHERE 1 = 1"
        parametros: list[object] = []

        if usuario_id is not None:
            consulta += " AND usuario_id = ?"
            parametros.append(usuario_id)

        if mascota_id is not None:
            consulta += " AND mascota_id = ?"
            parametros.append(mascota_id)

        consulta += " ORDER BY fecha DESC, id DESC"

        cursor = self.conexion.cursor()

        try:
            cursor.execute(consulta, parametros)
            filas = cursor.fetchall()
        finally:
            cursor.close()

        return [_fila_a_historial(fila) for fila in filas]

    def obtener(
        self, historial_id: int, usuario_id: int | None = None
    ) -> Historial | None:
        consulta = f"SELECT {COLUMNAS_HISTORIAL} FROM historial WHERE id = ?"
        parametros: list[object] = [historial_id]

        if usuario_id is not None:
            consulta += " AND usuario_id = ?"
            parametros.append(usuario_id)

        cursor = self.conexion.cursor()

        try:
            cursor.execute(consulta, parametros)
            fila = cursor.fetchone()
        finally:
            cursor.close()

        return _fila_a_historial(fila) if fila else None

    def crear(
        self,
        datos: HistorialCrear,
        usuario_id: int,
        mascota_nombre: str,
        veterinario_id: int | None,
        doctor: str | None,
    ) -> Historial:
        consulta = f"""
            INSERT INTO historial
                (usuario_id, mascota_id, veterinario_id, mascota_nombre, fecha,
                 doctor, motivo, diagnostico, tratamiento, receta)
            OUTPUT INSERTED.{COLUMNAS_HISTORIAL.replace(", ", ", INSERTED.")}
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        cursor = self.conexion.cursor()

        try:
            cursor.execute(
                consulta,
                usuario_id,
                datos.mascota_id,
                veterinario_id,
                mascota_nombre,
                datos.fecha,
                doctor,
                datos.motivo,
                datos.diagnostico,
                datos.tratamiento,
                datos.receta,
            )
            fila = cursor.fetchone()
        finally:
            cursor.close()

        if fila is None:
            raise RuntimeError("No se pudo recuperar el registro de historial")

        return _fila_a_historial(fila)

    def actualizar(
        self, historial_id: int, datos: HistorialActualizar
    ) -> Historial | None:
        consulta = f"""
            UPDATE historial
            SET fecha = ?, doctor = ?, motivo = ?, diagnostico = ?,
                tratamiento = ?, receta = ?
            OUTPUT INSERTED.{COLUMNAS_HISTORIAL.replace(", ", ", INSERTED.")}
            WHERE id = ?
        """

        cursor = self.conexion.cursor()

        try:
            cursor.execute(
                consulta,
                datos.fecha,
                datos.doctor,
                datos.motivo,
                datos.diagnostico,
                datos.tratamiento,
                datos.receta,
                historial_id,
            )
            fila = cursor.fetchone()
        finally:
            cursor.close()

        return _fila_a_historial(fila) if fila else None

    def eliminar(self, historial_id: int) -> bool:
        cursor = self.conexion.cursor()

        try:
            cursor.execute("DELETE FROM historial WHERE id = ?", historial_id)
            filas = cursor.rowcount
        finally:
            cursor.close()

        return filas > 0
