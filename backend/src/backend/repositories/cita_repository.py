from datetime import date, time

import pyodbc

from ..models.cita_model import Cita
from ..schemas.cita_esquema import CitaActualizar, CitaCrear

COLUMNAS_CITA = (
    "id, usuario_id, mascota_id, veterinario_id, mascota_nombre, motivo, doctor, "
    "especialidad, fecha, hora, sede, direccion, estado, indicaciones, creado_en"
)


def _hora_a_texto(valor) -> str:
    if isinstance(valor, time):
        return valor.strftime("%H:%M")
    if valor is None:
        return ""
    return str(valor)[:5]


def _fila_a_cita(fila: pyodbc.Row) -> Cita:
    return Cita(
        id=fila.id,
        usuario_id=fila.usuario_id,
        mascota_id=fila.mascota_id,
        veterinario_id=fila.veterinario_id,
        mascota_nombre=fila.mascota_nombre,
        motivo=fila.motivo,
        doctor=fila.doctor,
        especialidad=fila.especialidad,
        fecha=fila.fecha,
        hora=_hora_a_texto(fila.hora),
        sede=fila.sede,
        direccion=fila.direccion,
        estado=fila.estado,
        indicaciones=fila.indicaciones,
        creado_en=fila.creado_en,
    )


class CitaRepository:
    def __init__(self, conexion: pyodbc.Connection):
        self.conexion = conexion

    def listar(
        self,
        usuario_id: int | None = None,
        desde: date | None = None,
        hasta: date | None = None,
    ) -> list[Cita]:
        consulta = f"SELECT {COLUMNAS_CITA} FROM citas WHERE 1 = 1"
        parametros: list[object] = []

        if usuario_id is not None:
            consulta += " AND usuario_id = ?"
            parametros.append(usuario_id)

        if desde is not None:
            consulta += " AND fecha >= ?"
            parametros.append(desde)

        if hasta is not None:
            consulta += " AND fecha <= ?"
            parametros.append(hasta)

        consulta += " ORDER BY fecha DESC, hora DESC"

        cursor = self.conexion.cursor()

        try:
            cursor.execute(consulta, parametros)
            filas = cursor.fetchall()
        finally:
            cursor.close()

        return [_fila_a_cita(fila) for fila in filas]

    def obtener(self, cita_id: int, usuario_id: int | None = None) -> Cita | None:
        consulta = f"SELECT {COLUMNAS_CITA} FROM citas WHERE id = ?"
        parametros: list[object] = [cita_id]

        if usuario_id is not None:
            consulta += " AND usuario_id = ?"
            parametros.append(usuario_id)

        cursor = self.conexion.cursor()

        try:
            cursor.execute(consulta, parametros)
            fila = cursor.fetchone()
        finally:
            cursor.close()

        return _fila_a_cita(fila) if fila else None

    def crear(
        self,
        datos: CitaCrear,
        usuario_id: int,
        mascota_nombre: str,
        especialidad: str | None,
        sede: str | None,
        direccion: str | None,
    ) -> Cita:
        consulta = f"""
            INSERT INTO citas
                (usuario_id, mascota_id, veterinario_id, mascota_nombre, motivo,
                 doctor, especialidad, fecha, hora, sede, direccion, estado)
            OUTPUT INSERTED.{COLUMNAS_CITA.replace(", ", ", INSERTED.")}
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pendiente')
        """

        cursor = self.conexion.cursor()

        try:
            cursor.execute(
                consulta,
                usuario_id,
                datos.mascota_id,
                datos.veterinario_id,
                mascota_nombre,
                datos.motivo,
                datos.doctor,
                especialidad,
                datos.fecha,
                datos.hora,
                sede,
                direccion,
            )
            fila = cursor.fetchone()
        finally:
            cursor.close()

        if fila is None:
            raise RuntimeError("No se pudo recuperar la cita creada")

        return _fila_a_cita(fila)

    def actualizar(self, cita_id: int, datos: CitaActualizar) -> Cita | None:
        consulta = f"""
            UPDATE citas
            SET motivo = ?, doctor = ?, fecha = ?, hora = ?
            OUTPUT INSERTED.{COLUMNAS_CITA.replace(", ", ", INSERTED.")}
            WHERE id = ?
        """

        cursor = self.conexion.cursor()

        try:
            cursor.execute(
                consulta,
                datos.motivo,
                datos.doctor,
                datos.fecha,
                datos.hora,
                cita_id,
            )
            fila = cursor.fetchone()
        finally:
            cursor.close()

        return _fila_a_cita(fila) if fila else None

    def cambiar_estado(self, cita_id: int, estado: str) -> Cita | None:
        consulta = f"""
            UPDATE citas
            SET estado = ?
            OUTPUT INSERTED.{COLUMNAS_CITA.replace(", ", ", INSERTED.")}
            WHERE id = ?
        """

        cursor = self.conexion.cursor()

        try:
            cursor.execute(consulta, estado, cita_id)
            fila = cursor.fetchone()
        finally:
            cursor.close()

        return _fila_a_cita(fila) if fila else None

    def eliminar(self, cita_id: int) -> bool:
        cursor = self.conexion.cursor()

        try:
            cursor.execute("DELETE FROM citas WHERE id = ?", cita_id)
            filas = cursor.rowcount
        finally:
            cursor.close()

        return filas > 0
