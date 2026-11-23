"""Inicialización automática de la base de datos.

Crea (si faltan) la base veterinaria_db, las tablas e índices del esquema
(usuarios, productos, mascotas, citas, vacunas, historial y pagos), los
usuarios de prueba, el catálogo de productos y datos de demostración.
Es idempotente: se puede ejecutar en cada arranque sin duplicar datos.
"""

import logging
import re
from datetime import date, timedelta
from pathlib import Path

import pyodbc

from ..core.config import DB_DRIVER, DB_NAME, DB_SERVER, DB_TIMEOUT
from ..core.segurity import hash_password
from .semillas import MASCOTAS_DEMO, PRODUCTOS_SEMILLA

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
        "rol": "admin",
    },
    {
        "nombres": "Ana",
        "apellidos": "Perez",
        "email": "ana.perez@correo.com",
        "telefono": "987654322",
        "dni": "10000002",
        "password": "Clave1234",
        "rol": "propietario",
    },
    {
        "nombres": "Luis",
        "apellidos": "Gomez",
        "email": "luis.gomez@correo.com",
        "telefono": "987654323",
        "dni": "10000003",
        "password": "Clave1234",
        "rol": "propietario",
    },
    {
        "nombres": "Mariana",
        "apellidos": "Pariona",
        "email": "mariana.pariona@veterinaria.com",
        "telefono": "987654324",
        "dni": "10000004",
        "password": "Vet12345",
        "rol": "veterinario",
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
                    (nombres, apellidos, email, telefono, dni, password_hash, rol)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                usuario["nombres"],
                usuario["apellidos"],
                usuario["email"],
                usuario["telefono"],
                usuario["dni"],
                hash_password(usuario["password"]),
                usuario["rol"],
            )
            insertados += 1
        except pyodbc.IntegrityError:
            # Otro proceso insertó el mismo email/DNI al mismo tiempo.
            continue
        finally:
            cursor.close()

    return insertados


def _asignar_roles(conexion: pyodbc.Connection) -> None:
    """Corrige el rol de los usuarios de prueba ya existentes.

    Necesario cuando la base se creó antes de agregar la columna `rol`:
    todas las filas quedaron como 'propietario' por el valor por defecto.
    """
    cursor = conexion.cursor()

    try:
        for usuario in USUARIOS_PRUEBA:
            cursor.execute(
                "UPDATE dbo.usuarios SET rol = ? WHERE email = ?",
                usuario["rol"],
                usuario["email"],
            )
    finally:
        cursor.close()


def _insertar_productos(conexion: pyodbc.Connection) -> int:
    """Siembra el catálogo solo si la tabla productos está vacía."""
    cursor = conexion.cursor()

    try:
        cursor.execute("SELECT COUNT(*) FROM dbo.productos")
        if cursor.fetchone()[0] > 0:
            return 0
    finally:
        cursor.close()

    insertados = 0

    for producto in PRODUCTOS_SEMILLA:
        cursor = conexion.cursor()

        try:
            cursor.execute(
                """
                INSERT INTO dbo.productos
                    (nombre, categoria, precio, stock, descripcion, emoji,
                     imagen, activo)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1)
                """,
                *producto,
            )
            insertados += 1
        finally:
            cursor.close()

    return insertados


def _obtener_id_usuario(conexion: pyodbc.Connection, email: str) -> int | None:
    cursor = conexion.cursor()

    try:
        cursor.execute("SELECT id FROM dbo.usuarios WHERE email = ?", email)
        fila = cursor.fetchone()
    finally:
        cursor.close()

    return fila[0] if fila else None


def _insertar_demo(conexion: pyodbc.Connection) -> bool:
    """Crea mascotas, historial, citas, vacunas y pagos de ejemplo.

    Solo se ejecuta si la tabla mascotas está vacía, para no ensuciar una
    base que ya tiene datos reales.
    """
    cursor = conexion.cursor()

    try:
        cursor.execute("SELECT COUNT(*) FROM dbo.mascotas")
        if cursor.fetchone()[0] > 0:
            return False
    finally:
        cursor.close()

    propietario_id = _obtener_id_usuario(conexion, "ana.perez@correo.com")
    veterinario_id = _obtener_id_usuario(
        conexion, "mariana.pariona@veterinaria.com"
    )

    if propietario_id is None or veterinario_id is None:
        return False

    hoy = date.today()
    mascota_ids: list[int] = []

    for mascota in MASCOTAS_DEMO:
        cursor = conexion.cursor()

        try:
            cursor.execute(
                """
                INSERT INTO dbo.mascotas
                    (usuario_id, nombre, especie, raza, edad, sexo, peso,
                     microchip, diagnostico, cobertura, foto, activo)
                OUTPUT INSERTED.id
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
                """,
                propietario_id,
                *mascota,
            )
            mascota_ids.append(cursor.fetchone()[0])
        finally:
            cursor.close()

    simba_id, milo_id = mascota_ids[0], mascota_ids[1]

    historial = (
        (
            simba_id,
            "Simba",
            hoy - timedelta(days=18),
            "Dra. Mariana Pariona",
            "Consulta por sensibilidad en la piel",
            "Dermatitis alérgica leve por contacto.",
            "Shampoo medicado cada 3 días por 14 días.",
            "Clorexidina 2% shampoo. Prednisolona 5 mg por 5 días.",
        ),
        (
            simba_id,
            "Simba",
            hoy - timedelta(days=60),
            "Dra. Mariana Pariona",
            "Control post-operatorio",
            "Herida quirúrgica en correcta evolución.",
            "Limpieza diaria y antibiótico por 7 días.",
            "Amoxicilina 250 mg cada 12 horas por 7 días.",
        ),
        (
            milo_id,
            "Milo",
            hoy - timedelta(days=45),
            "Dr. Alonso Requena",
            "Chequeo general y desparasitación",
            "Paciente sano, peso y constantes normales.",
            "Desparasitación interna y externa mensual.",
            "NexGard Spectra 1 tableta mensual. Praziquantel según peso.",
        ),
    )

    for registro in historial:
        cursor = conexion.cursor()

        try:
            cursor.execute(
                """
                INSERT INTO dbo.historial
                    (usuario_id, mascota_id, veterinario_id, mascota_nombre,
                     fecha, doctor, motivo, diagnostico, tratamiento, receta)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                propietario_id,
                registro[0],
                veterinario_id,
                registro[1],
                registro[2],
                registro[3],
                registro[4],
                registro[5],
                registro[6],
                registro[7],
            )
        finally:
            cursor.close()

    citas = (
        (
            simba_id,
            "Simba",
            "Control dermatológico",
            hoy + timedelta(days=3),
            "09:30",
        ),
        (
            milo_id,
            "Milo",
            "Vacunación anual",
            hoy + timedelta(days=10),
            "11:00",
        ),
    )

    for cita in citas:
        cursor = conexion.cursor()

        try:
            cursor.execute(
                """
                INSERT INTO dbo.citas
                    (usuario_id, mascota_id, veterinario_id, mascota_nombre,
                     motivo, doctor, especialidad, fecha, hora, sede, direccion,
                     estado)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Confirmada')
                """,
                propietario_id,
                cita[0],
                veterinario_id,
                cita[1],
                cita[2],
                "Dra. Mariana Pariona",
                "Medicina General",
                cita[3],
                cita[4],
                "Sede Central - San Carlos",
                "Av. San Carlos 123",
            )
        finally:
            cursor.close()

    vacunas = (
        (
            simba_id,
            "Simba",
            "Rabia",
            "Vacuna",
            hoy - timedelta(days=300),
            hoy + timedelta(days=65),
            "RAB-2025-01",
            "Aplicada sin reacciones adversas.",
        ),
        (
            milo_id,
            "Milo",
            "Triple Felina",
            "Vacuna",
            hoy - timedelta(days=340),
            hoy + timedelta(days=25),
            "TF-2025-08",
            "Refuerzo anual programado.",
        ),
    )

    for vacuna in vacunas:
        cursor = conexion.cursor()

        try:
            cursor.execute(
                """
                INSERT INTO dbo.vacunas
                    (usuario_id, mascota_id, mascota_nombre, nombre, tipo,
                     fecha_aplicacion, proxima_dosis, lote, observaciones)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                propietario_id,
                *vacuna,
            )
        finally:
            cursor.close()

    pagos = (
        (
            "PAG-0001",
            "Consulta dermatológica",
            hoy - timedelta(days=18),
            80.0,
            "Tarjeta",
            "Pagado",
            "Simba",
        ),
        (
            "PAG-0002",
            "Vacunación anual",
            hoy - timedelta(days=5),
            120.0,
            "Efectivo",
            "Pendiente",
            "Milo",
        ),
    )

    for pago in pagos:
        cursor = conexion.cursor()

        try:
            cursor.execute(
                """
                INSERT INTO dbo.pagos
                    (usuario_id, codigo, concepto, fecha, monto, metodo, estado,
                     mascota_nombre)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                propietario_id,
                *pago,
            )
        finally:
            cursor.close()

    return True


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
        insertados = _insertar_usuarios_prueba(conexion)
        _asignar_roles(conexion)
        productos = _insertar_productos(conexion)
        demo = _insertar_demo(conexion)
        logger.info(
            "Semillas: %s usuarios, %s productos, demo=%s",
            insertados,
            productos,
            demo,
        )
        return insertados
    finally:
        conexion.close()
