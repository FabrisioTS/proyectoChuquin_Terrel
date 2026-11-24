from typing import Any

import pyodbc

from ..models.usuario_model import Usuario
from ..schemas.usuario_esquema import UsuarioRegistro

# Columnas de la tabla usuarios en el mismo orden que la dataclass Usuario.
COLUMNAS_USUARIO = (
    "id, nombres, apellidos, email, telefono, dni, password_hash, rol"
)


def _fila_a_usuario(fila: pyodbc.Row) -> Usuario:
    return Usuario(
        id=fila.id,
        nombres=fila.nombres,
        apellidos=fila.apellidos,
        email=fila.email,
        telefono=fila.telefono,
        dni=fila.dni,
        password_hash=fila.password_hash,
        rol=fila.rol,
    )


class UsuarioRepository:
    def __init__(self, conexion: pyodbc.Connection):
        self.conexion = conexion

    def _buscar_uno(self, consulta: str, valor: Any) -> Usuario | None:
        cursor = self.conexion.cursor()

        try:
            # Consulta parametrizada con "?" (evita inyección SQL).
            cursor.execute(consulta, valor)
            fila = cursor.fetchone()
        finally:
            cursor.close()

        return _fila_a_usuario(fila) if fila else None

    def obtener_usuario_por_id(self, usuario_id: int) -> Usuario | None:
        return self._buscar_uno(
            f"SELECT {COLUMNAS_USUARIO} FROM usuarios WHERE id = ?",
            usuario_id,
        )

    def obtener_usuario_por_email(self, email: str) -> Usuario | None:
        return self._buscar_uno(
            f"SELECT {COLUMNAS_USUARIO} FROM usuarios WHERE email = ?",
            email,
        )

    def obtener_usuario_por_dni(self, dni: str) -> Usuario | None:
        return self._buscar_uno(
            f"SELECT {COLUMNAS_USUARIO} FROM usuarios WHERE dni = ?",
            dni,
        )

    def listar_por_rol(self, rol: str | None = None) -> list[Usuario]:
        cursor = self.conexion.cursor()
        try:
            if rol:
                cursor.execute(
                    f"SELECT {COLUMNAS_USUARIO} FROM usuarios WHERE rol = ? ORDER BY apellidos, nombres",
                    rol,
                )
            else:
                cursor.execute(
                    f"SELECT {COLUMNAS_USUARIO} FROM usuarios ORDER BY apellidos, nombres"
                )
            filas = cursor.fetchall()
            return [_fila_a_usuario(fila) for fila in filas]
        finally:
            cursor.close()

    def crear_usuario(
        self,
        usuario_datos: UsuarioRegistro,
        password_hashed: str,
        rol: str = "propietario",
    ) -> Usuario:
        consulta = f"""
            INSERT INTO usuarios (nombres, apellidos, email, telefono, dni, password_hash, rol)
            OUTPUT INSERTED.{COLUMNAS_USUARIO.replace(", ", ", INSERTED.")}
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """

        cursor = self.conexion.cursor()

        try:
            cursor.execute(
                consulta,
                usuario_datos.nombres,
                usuario_datos.apellidos,
                usuario_datos.email,
                usuario_datos.telefono,
                usuario_datos.dni,
                password_hashed,
                rol,
            )
            fila = cursor.fetchone()
        finally:
            cursor.close()

        if fila is None:
            raise RuntimeError("No se pudo recuperar el usuario recién creado")

        return _fila_a_usuario(fila)

    def actualizar_usuario(
        self,
        usuario_id: int,
        nombres: str,
        apellidos: str,
        email: str,
        telefono: str,
    ) -> Usuario:
        consulta = f"""
            UPDATE usuarios
            SET nombres = ?, apellidos = ?, email = ?, telefono = ?
            OUTPUT INSERTED.{COLUMNAS_USUARIO.replace(", ", ", INSERTED.")}
            WHERE id = ?
        """

        cursor = self.conexion.cursor()

        try:
            cursor.execute(
                consulta, nombres, apellidos, email, telefono, usuario_id
            )
            fila = cursor.fetchone()
        finally:
            cursor.close()

        if fila is None:
            raise RuntimeError("No se pudo recuperar el usuario actualizado")

        return _fila_a_usuario(fila)

    def actualizar_password_hash(
        self, usuario_id: int, password_hashed: str
    ) -> None:
        cursor = self.conexion.cursor()

        try:
            cursor.execute(
                "UPDATE usuarios SET password_hash = ? WHERE id = ?",
                password_hashed,
                usuario_id,
            )
        finally:
            cursor.close()
