import pyodbc

from ..models.configuracion_model import Configuracion
from ..schemas.configuracion_esquema import ConfiguracionActualizar

COLUMNAS_CONFIGURACION = (
    "usuario_id, sede, notificaciones_citas, notificaciones_vacunas, "
    "notificaciones_pagos, actualizado_en"
)


def _fila_a_configuracion(fila: pyodbc.Row) -> Configuracion:
    return Configuracion(
        usuario_id=fila.usuario_id,
        sede=fila.sede,
        notificaciones_citas=bool(fila.notificaciones_citas),
        notificaciones_vacunas=bool(fila.notificaciones_vacunas),
        notificaciones_pagos=bool(fila.notificaciones_pagos),
        actualizado_en=fila.actualizado_en,
    )


class ConfiguracionRepository:
    def __init__(self, conexion: pyodbc.Connection):
        self.conexion = conexion

    def obtener(self, usuario_id: int) -> Configuracion | None:
        cursor = self.conexion.cursor()

        try:
            cursor.execute(
                f"SELECT {COLUMNAS_CONFIGURACION} FROM configuracion_usuario "
                "WHERE usuario_id = ?",
                usuario_id,
            )
            fila = cursor.fetchone()
        finally:
            cursor.close()

        return _fila_a_configuracion(fila) if fila else None

    def guardar(
        self, usuario_id: int, datos: ConfiguracionActualizar
    ) -> Configuracion:
        """Upsert: crea la fila la primera vez y actualiza en las siguientes."""
        consulta = f"""
            MERGE configuracion_usuario AS destino
            USING (SELECT ? AS usuario_id) AS origen
            ON destino.usuario_id = origen.usuario_id
            WHEN MATCHED THEN
                UPDATE SET sede = ?, notificaciones_citas = ?,
                           notificaciones_vacunas = ?, notificaciones_pagos = ?,
                           actualizado_en = SYSUTCDATETIME()
            WHEN NOT MATCHED THEN
                INSERT (usuario_id, sede, notificaciones_citas,
                        notificaciones_vacunas, notificaciones_pagos)
                VALUES (?, ?, ?, ?, ?)
            OUTPUT INSERTED.{COLUMNAS_CONFIGURACION.replace(", ", ", INSERTED.")};
        """

        cursor = self.conexion.cursor()

        try:
            cursor.execute(
                consulta,
                usuario_id,
                datos.sede,
                datos.notificaciones_citas,
                datos.notificaciones_vacunas,
                datos.notificaciones_pagos,
                usuario_id,
                datos.sede,
                datos.notificaciones_citas,
                datos.notificaciones_vacunas,
                datos.notificaciones_pagos,
            )
            fila = cursor.fetchone()
        finally:
            cursor.close()

        if fila is None:
            raise RuntimeError("No se pudo guardar la configuración")

        return _fila_a_configuracion(fila)
