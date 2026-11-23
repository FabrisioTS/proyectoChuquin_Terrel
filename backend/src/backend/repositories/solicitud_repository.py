import pyodbc

from ..models.solicitud_model import Solicitud
from ..schemas.solicitud_esquema import SolicitudCrear

COLUMNAS_SOLICITUD = (
    "id, tipo, nombre, telefono, email, mascota, motivo, mensaje, estado, "
    "creado_en"
)


def _fila_a_solicitud(fila: pyodbc.Row) -> Solicitud:
    return Solicitud(
        id=fila.id,
        tipo=fila.tipo,
        nombre=fila.nombre,
        telefono=fila.telefono,
        email=fila.email,
        mascota=fila.mascota,
        motivo=fila.motivo,
        mensaje=fila.mensaje,
        estado=fila.estado,
        creado_en=fila.creado_en,
    )


class SolicitudRepository:
    def __init__(self, conexion: pyodbc.Connection):
        self.conexion = conexion

    def crear(self, datos: SolicitudCrear) -> Solicitud:
        consulta = f"""
            INSERT INTO solicitudes
                (tipo, nombre, telefono, email, mascota, motivo, mensaje)
            OUTPUT INSERTED.{COLUMNAS_SOLICITUD.replace(", ", ", INSERTED.")}
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """

        cursor = self.conexion.cursor()

        try:
            cursor.execute(
                consulta,
                datos.tipo,
                datos.nombre,
                datos.telefono,
                datos.email,
                datos.mascota,
                datos.motivo,
                datos.mensaje,
            )
            fila = cursor.fetchone()
        finally:
            cursor.close()

        if fila is None:
            raise RuntimeError("No se pudo registrar la solicitud")

        return _fila_a_solicitud(fila)

    def listar(self, estado: str | None = None) -> list[Solicitud]:
        consulta = f"SELECT {COLUMNAS_SOLICITUD} FROM solicitudes"
        parametros: list[object] = []

        if estado:
            consulta += " WHERE estado = ?"
            parametros.append(estado)

        consulta += " ORDER BY creado_en DESC, id DESC"

        cursor = self.conexion.cursor()

        try:
            cursor.execute(consulta, parametros)
            filas = cursor.fetchall()
        finally:
            cursor.close()

        return [_fila_a_solicitud(fila) for fila in filas]

    def marcar_atendida(self, solicitud_id: int) -> Solicitud | None:
        consulta = f"""
            UPDATE solicitudes
            SET estado = 'Atendida'
            OUTPUT INSERTED.{COLUMNAS_SOLICITUD.replace(", ", ", INSERTED.")}
            WHERE id = ?
        """

        cursor = self.conexion.cursor()

        try:
            cursor.execute(consulta, solicitud_id)
            fila = cursor.fetchone()
        finally:
            cursor.close()

        return _fila_a_solicitud(fila) if fila else None
