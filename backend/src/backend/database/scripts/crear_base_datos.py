"""Crea/verifica la base de datos y los usuarios de prueba.

Uso:
    uv run python -m backend.database.scripts.crear_base_datos

Es idempotente: no borra datos existentes.
"""

from ...core.config import DB_NAME, DB_SERVER
from ..conection import crear_conexion
from ..inicializacion import inicializar_base_datos


def crear_base_datos() -> None:
    insertados = inicializar_base_datos()

    print(f"Base de datos '{DB_NAME}' verificada en '{DB_SERVER}'.")
    print(f"Usuarios de prueba insertados en esta ejecución: {insertados}")

    conexion = crear_conexion()

    try:
        cursor = conexion.cursor()
        cursor.execute("SELECT COUNT(*) FROM dbo.usuarios")
        total = cursor.fetchval()

        cursor.execute(
            "SELECT id, nombres, apellidos, email FROM dbo.usuarios ORDER BY id"
        )
        usuarios = cursor.fetchall()
        cursor.close()
    finally:
        conexion.close()

    print(f"Usuarios en la tabla: {total}")
    for usuario in usuarios:
        print(f"  - [{usuario.id}] {usuario.nombres} {usuario.apellidos} <{usuario.email}>")


if __name__ == "__main__":
    crear_base_datos()
