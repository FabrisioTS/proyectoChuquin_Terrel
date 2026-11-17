from collections.abc import Iterator

import pyodbc
from fastapi import HTTPException, status

from ..core.config import DB_DRIVER, DB_NAME, DB_SERVER, DB_TIMEOUT

# Conexión con autenticación de Windows (usuario y contraseña no son necesarios).
# TrustServerCertificate evita errores de certificado con ODBC Driver 18.
CADENA_CONEXION = (
    f"DRIVER={{{DB_DRIVER}}};"
    f"SERVER={DB_SERVER};"
    f"DATABASE={DB_NAME};"
    "Trusted_Connection=yes;"
    "TrustServerCertificate=yes;"
)


def crear_conexion() -> pyodbc.Connection:
    """Abre una conexión nueva a SQL Server."""
    return pyodbc.connect(CADENA_CONEXION, autocommit=False, timeout=DB_TIMEOUT)


def get_db() -> Iterator[pyodbc.Connection]:
    """Dependencia de FastAPI: entrega una conexión y gestiona la transacción."""
    try:
        conexion = crear_conexion()
    except pyodbc.Error as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=(
                "No se pudo conectar a SQL Server. Verifica que el servidor "
                "'{servidor}' esté iniciado, que la base de datos '{base}' exista "
                "y que el controlador ODBC esté instalado."
            ).format(servidor=DB_SERVER, base=DB_NAME),
        ) from error

    try:
        yield conexion
        conexion.commit()
    except Exception:
        conexion.rollback()
        raise
    finally:
        conexion.close()
