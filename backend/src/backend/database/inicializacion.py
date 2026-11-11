"""Inicialización automática de la base de datos.

Crea (si faltan) la base veterinaria_db, la tabla dbo.usuarios, sus índices
y los usuarios de prueba. Es idempotente: se puede ejecutar en cada arranque
sin duplicar datos ni sobrescribir contraseñas existentes.
"""

import logging
import re
from pathlib import Path

import pyodbc

from ..core.config import DB_DRIVER, DB_NAME, DB_SERVER, DB_TIMEOUT
from ..core.segurity import hash_password

logger = logging.getLogger(__name__)

RUTA_SQL = Path(__file__).resolve().parent / "scripts" / "crear_base_datos.sql"

USUARIOS_PRUEBA = (
    {
        "nombres": "Administrador",
        "apellidos": "Veterinaria",
        "email": "admin@veterinaria.com",
        "telefono": "987654321",
        "dni": "10000001",
        "password": "Admin1234",
    },
    {
        "nombres": "Ana",
        "apellidos": "Perez",
        "email": "ana.perez@correo.com",
        "telefono": "987654322",
        "dni": "10000002",
        "password": "Clave1234",
    },
    {
        "nombres": "Luis",
        "apellidos": "Gomez",
        "email": "luis.gomez@correo.com",
        "telefono": "987654323",
        "dni": "10000003",
        "password": "Clave1234",
    },
)


def _cadena_conexion(base: str) -> str:
    return (
        f"DRIVER={{{DB_DRIVER}}};"
        f"SERVER={DB_SERVER};"
        f"DATABASE={base};"
        "Trusted_Connection=yes;"
        "TrustServerCertificate=yes;"
    )


def _dividir_bloques(sql: str) -> list[str]:
    """Separa el script en lotes usando las líneas GO (como SSMS)."""
    bloques = re.split(r"(?im)^\s*GO\s*$", sql)
    return [bloque.strip() for bloque in bloques if bloque.strip()]


def _ejecutar_bloques(conexion: pyodbc.Connection, sql: str) -> None:
    cursor = conexion.cursor()

    try:
        for bloque in _dividir_bloques(sql):
            try:
                cursor.execute(bloque)
            except pyodbc.Error as error:
                # Si dos arranques ocurren a la vez, el otro proceso pudo
                # crear el objeto primero: se continúa sin romper el arranque.
                mensaje = str(error).lower()
                if "already exists" in mensaje or "ya existe" in mensaje:
                    logger.debug("Objeto ya existente, se continúa: %s", mensaje)
                    continue
                raise
    finally:
        cursor.close()


def _validar_nombre_base() -> str:
    if not re.fullmatch(r"[A-Za-z0-9_]+", DB_NAME):
        raise ValueError(f"Nombre de base de datos inválido: {DB_NAME!r}")
    return DB_NAME


def _insertar_usuarios_prueba(conexion: pyodbc.Connection) -> int:
    """Inserta solo los usuarios de prueba cuyo email todavía no exista."""
    insertados = 0

    for usuario in USUARIOS_PRUEBA:
        cursor = conexion.cursor()

        try:
            cursor.execute(
                "SELECT 1 FROM dbo.usuarios WHERE email = ?",
                usuario["email"],
            )

            if cursor.fetchone() is not None:
                continue

            cursor.execute(
                """
                INSERT INTO dbo.usuarios
                    (nombres, apellidos, email, telefono, dni, password_hash)
                VALUES (?, ?, ?, ?, ?, ?)
                """,
                usuario["nombres"],
                usuario["apellidos"],
                usuario["email"],
                usuario["telefono"],
                usuario["dni"],
                hash_password(usuario["password"]),
            )
            insertados += 1
        except pyodbc.IntegrityError:
            # Otro proceso insertó el mismo email/DNI al mismo tiempo.
            continue
        finally:
            cursor.close()

    return insertados


def _crear_base_si_no_existe(conexion: pyodbc.Connection, base: str) -> None:
    cursor = conexion.cursor()

    try:
        cursor.execute("SELECT DB_ID(?)", base)

        if cursor.fetchone()[0] is not None:
            return

        try:
            # El nombre se valida antes con _validar_nombre_base(),
            # por lo que es seguro interpolarlo como identificador.
            cursor.execute(f"CREATE DATABASE [{base}]")
        except pyodbc.Error as error:
            # Otro proceso pudo crearla al mismo tiempo.
            mensaje = str(error).lower()
            if "already exists" not in mensaje and "ya existe" not in mensaje:
                raise
    finally:
        cursor.close()


def inicializar_base_datos() -> int:
    """Crea/verifica la base y devuelve cuántos usuarios de prueba insertó."""
    base = _validar_nombre_base()
    sql = RUTA_SQL.read_text(encoding="utf-8")

    # autocommit=True: CREATE DATABASE no puede ejecutarse dentro
    # de una transacción abierta por pyodbc.
    conexion = pyodbc.connect(
        _cadena_conexion("master"), autocommit=True, timeout=DB_TIMEOUT
    )

    try:
        _crear_base_si_no_existe(conexion, base)
    finally:
        conexion.close()

    # El script de esquema se ejecuta dentro de la base destino.
    conexion = pyodbc.connect(
        _cadena_conexion(base), autocommit=True, timeout=DB_TIMEOUT
    )

    try:
        _ejecutar_bloques(conexion, sql)
        return _insertar_usuarios_prueba(conexion)
    finally:
        conexion.close()
