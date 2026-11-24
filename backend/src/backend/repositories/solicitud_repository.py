import pyodbc

from ..models.solicitud_model import SolicitudCita
from ..schemas.solicitud_esquema import SolicitudCitaCrear

COLUMNAS_SOLICITUD = (
    "id, tipo_mascota, nombre_propietario, telefono, nombre_mascota, "
    "servicio, fecha_deseada, turno, notas, estado, creado_en"
)


def _fila_a_solicitud(fila: pyodbc.Row) -> SolicitudCita:
    return SolicitudCita(
        id=fila.id,
        tipo_mascota=fila.tipo_mascota,
        nombre_propietario=fila.nombre_propietario,
        telefono=fila.telefono,
        nombre_mascota=fila.nombre_mascota,
        servicio=fila.servicio,
        fecha_deseada=fila.fecha_deseada,
        turno=fila.turno,
        notas=fila.notas,
        estado=fila.estado,
        creado_en=fila.creado_en,
    )


class SolicitudRepository:
    def __init__(self, conexion: pyodbc.Connection):
        self.conexion = conexion

    def crear(self, datos: SolicitudCitaCrear) -> SolicitudCita:
        consulta = f"""
            INSERT INTO solicitudes_cita
                (tipo_mascota, nombre_propietario, telefono, nombre_mascota,
                 servicio, fecha_deseada, turno, notas, estado)
            OUTPUT INSERTED.{COLUMNAS_SOLICITUD.replace(", ", ", INSERTED.")}
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente')
        """
        cursor = self.conexion.cursor()
        try:
            cursor.execute(
                consulta,
                datos.tipo_mascota,
                datos.nombre_propietario,
                datos.telefono,
                datos.nombre_mascota,
                datos.servicio,
                datos.fecha_deseada,
                datos.turno,
                datos.notas,
            )
            fila = cursor.fetchone()
        finally:
            cursor.close()

        if fila is None:
            raise RuntimeError("No se pudo registrar la solicitud de cita")
        return _fila_a_solicitud(fila)

    def listar(self) -> list[SolicitudCita]:
        consulta = (
            f"SELECT {COLUMNAS_SOLICITUD} FROM solicitudes_cita ORDER BY creado_en DESC"
        )
        cursor = self.conexion.cursor()
        try:
            cursor.execute(consulta)
            filas = cursor.fetchall()
        finally:
            cursor.close()
        return [_fila_a_solicitud(fila) for fila in filas]
