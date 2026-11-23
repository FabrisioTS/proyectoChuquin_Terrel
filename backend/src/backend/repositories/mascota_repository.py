import pyodbc

from ..models.mascota_model import Mascota
from ..schemas.mascota_esquema import MascotaActualizar, MascotaCrear

COLUMNAS_MASCOTA = (
    "id, usuario_id, nombre, especie, raza, edad, sexo, peso, microchip, "
    "diagnostico, cobertura, foto, activo, creado_en"
)


def _fila_a_mascota(fila: pyodbc.Row) -> Mascota:
    return Mascota(
        id=fila.id,
        usuario_id=fila.usuario_id,
        nombre=fila.nombre,
        especie=fila.especie,
        raza=fila.raza,
        edad=fila.edad,
        sexo=fila.sexo,
        peso=float(fila.peso) if fila.peso is not None else None,
        microchip=fila.microchip,
        diagnostico=fila.diagnostico,
        cobertura=fila.cobertura,
        foto=fila.foto,
        activo=bool(fila.activo),
        creado_en=fila.creado_en,
    )


class MascotaRepository:
    def __init__(self, conexion: pyodbc.Connection):
        self.conexion = conexion

    def listar(self, usuario_id: int | None = None) -> list[Mascota]:
        consulta = f"SELECT {COLUMNAS_MASCOTA} FROM mascotas WHERE activo = 1"
        parametros: list[object] = []

        if usuario_id is not None:
            consulta += " AND usuario_id = ?"
            parametros.append(usuario_id)

        consulta += " ORDER BY nombre"

        cursor = self.conexion.cursor()

        try:
            cursor.execute(consulta, parametros)
            filas = cursor.fetchall()
        finally:
            cursor.close()

        return [_fila_a_mascota(fila) for fila in filas]

    def obtener(self, mascota_id: int, usuario_id: int | None = None) -> Mascota | None:
        consulta = (
            f"SELECT {COLUMNAS_MASCOTA} FROM mascotas WHERE id = ? AND activo = 1"
        )
        parametros: list[object] = [mascota_id]

        if usuario_id is not None:
            consulta += " AND usuario_id = ?"
            parametros.append(usuario_id)

        cursor = self.conexion.cursor()

        try:
            cursor.execute(consulta, parametros)
            fila = cursor.fetchone()
        finally:
            cursor.close()

        return _fila_a_mascota(fila) if fila else None

    def crear(self, datos: MascotaCrear, usuario_id: int) -> Mascota:
        consulta = f"""
            INSERT INTO mascotas
                (usuario_id, nombre, especie, raza, edad, sexo, peso, microchip,
                 diagnostico, cobertura, foto, activo)
            OUTPUT INSERTED.{COLUMNAS_MASCOTA.replace(", ", ", INSERTED.")}
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
        """

        cursor = self.conexion.cursor()

        try:
            cursor.execute(
                consulta,
                usuario_id,
                datos.nombre,
                datos.especie,
                datos.raza,
                datos.edad,
                datos.sexo,
                datos.peso,
                datos.microchip,
                datos.diagnostico,
                datos.cobertura,
                datos.foto,
            )
            fila = cursor.fetchone()
        finally:
            cursor.close()

        if fila is None:
            raise RuntimeError("No se pudo recuperar la mascota creada")

        return _fila_a_mascota(fila)

    def actualizar(
        self, mascota_id: int, datos: MascotaActualizar, usuario_id: int | None = None
    ) -> Mascota | None:
        consulta = f"""
            UPDATE mascotas
            SET nombre = ?, especie = ?, raza = ?, edad = ?, sexo = ?, peso = ?,
                microchip = ?, diagnostico = ?, cobertura = ?, foto = ?
            OUTPUT INSERTED.{COLUMNAS_MASCOTA.replace(", ", ", INSERTED.")}
            WHERE id = ? AND activo = 1
        """
        parametros: list[object] = [
            datos.nombre,
            datos.especie,
            datos.raza,
            datos.edad,
            datos.sexo,
            datos.peso,
            datos.microchip,
            datos.diagnostico,
            datos.cobertura,
            datos.foto,
            mascota_id,
        ]

        if usuario_id is not None:
            consulta += " AND usuario_id = ?"
            parametros.append(usuario_id)

        cursor = self.conexion.cursor()

        try:
            cursor.execute(consulta, parametros)
            fila = cursor.fetchone()
        finally:
            cursor.close()

        return _fila_a_mascota(fila) if fila else None

    def eliminar(self, mascota_id: int, usuario_id: int | None = None) -> bool:
        """Baja lógica: conserva el historial clínico asociado."""
        consulta = "UPDATE mascotas SET activo = 0 WHERE id = ? AND activo = 1"
        parametros: list[object] = [mascota_id]

        if usuario_id is not None:
            consulta += " AND usuario_id = ?"
            parametros.append(usuario_id)

        cursor = self.conexion.cursor()

        try:
            cursor.execute(consulta, parametros)
            filas = cursor.rowcount
        finally:
            cursor.close()

        return filas > 0
