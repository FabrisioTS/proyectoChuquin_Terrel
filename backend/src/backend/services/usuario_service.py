import secrets

import jwt
import pyodbc
from fastapi import HTTPException, status

from ..core.segurity import (
    crear_token_acceso,
    crear_token_recuperacion,
    decodificar_token_recuperacion,
    hash_password,
    huella_password,
    necesita_rehash,
    verificar_password,
)
from ..models.usuario_model import Usuario
from ..repositories.usuario_repository import UsuarioRepository
from ..schemas.usuario_esquema import (
    CambiarPassword,
    RecuperarPasswordRespuesta,
    RecuperarPasswordSolicitud,
    RestablecerPassword,
    TokenResponse,
    UsuarioActualizar,
    UsuarioLogin,
    UsuarioRegistro,
    UsuarioResponse,
)


class UsuarioService:
    def __init__(self, usuario_repositorio: UsuarioRepository):
        self.usuario_repositorio = usuario_repositorio

    def registrar_usuario(self, datos_usuario: UsuarioRegistro) -> Usuario:
        if self.usuario_repositorio.obtener_usuario_por_email(datos_usuario.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo electrónico ya está registrado",
            )

        if self.usuario_repositorio.obtener_usuario_por_dni(datos_usuario.dni):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El DNI ya está registrado",
            )

        clave_encriptada = hash_password(datos_usuario.password)

        try:
            return self.usuario_repositorio.crear_usuario(
                datos_usuario, clave_encriptada
            )
        except pyodbc.IntegrityError:
            # Cubre la condición de carrera entre la validación y el INSERT
            # (índices únicos de email y dni).
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo electrónico o el DNI ya están registrados",
            ) from None

    def iniciar_sesion(self, datos_login: UsuarioLogin) -> TokenResponse:
        usuario = self.usuario_repositorio.obtener_usuario_por_email(datos_login.email)

        # Mismo mensaje para email inexistente y contraseña incorrecta:
        # evita que se pueda averiguar qué correos están registrados.
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Correo electrónico o contraseña incorrectos",
            )

        es_clave_correcta = verificar_password(
            datos_login.password, usuario.password_hash
        )

        if not es_clave_correcta:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Correo electrónico o contraseña incorrectos",
            )

        # Migración transparente: los hashes bcrypt antiguos se convierten
        # a Argon2 la primera vez que el usuario inicia sesión.
        if necesita_rehash(usuario.password_hash):
            self.usuario_repositorio.actualizar_password_hash(
                usuario.id, hash_password(datos_login.password)
            )

        token = crear_token_acceso(usuario.id, usuario.email, usuario.rol)

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            usuario=UsuarioResponse.model_validate(usuario),
        )

    def obtener_usuario_actual(self, usuario_id: int) -> Usuario:
        usuario = self.usuario_repositorio.obtener_usuario_por_id(usuario_id)

        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas o token expirado",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return usuario

    def actualizar_perfil(
        self, usuario: Usuario, datos: UsuarioActualizar
    ) -> Usuario:
        """Actualiza los datos personales del usuario autenticado."""
        existente = self.usuario_repositorio.obtener_usuario_por_email(datos.email)

        if existente and existente.id != usuario.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El correo electrónico ya está registrado por otra cuenta",
            )

        return self.usuario_repositorio.actualizar_usuario(
            usuario.id,
            datos.nombres,
            datos.apellidos,
            datos.email,
            datos.telefono,
        )

    def solicitar_recuperacion(
        self, datos: RecuperarPasswordSolicitud
    ) -> RecuperarPasswordRespuesta:
        """Verifica correo + DNI y entrega un token temporal de un solo uso."""
        usuario = self.usuario_repositorio.obtener_usuario_por_email(datos.email)

        # Mensaje genérico: no se revela si falló el correo o el DNI.
        if not usuario or not secrets.compare_digest(usuario.dni, datos.dni):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Los datos no coinciden con una cuenta registrada",
            )

        token = crear_token_recuperacion(
            usuario.id, usuario.email, usuario.password_hash
        )

        return RecuperarPasswordRespuesta(
            mensaje="Identidad verificada. Define tu nueva contraseña.",
            token_recuperacion=token,
        )

    def restablecer_password(self, datos: RestablecerPassword) -> dict[str, str]:
        """Valida el token de recuperación y actualiza la contraseña."""
        error_token = HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "El enlace de recuperación es inválido o ha expirado. "
                "Solicita uno nuevo."
            ),
        )

        try:
            payload = decodificar_token_recuperacion(datos.token)
            usuario_id = int(payload.get("sub", 0))
        except (jwt.PyJWTError, TypeError, ValueError):
            raise error_token from None

        usuario = self.usuario_repositorio.obtener_usuario_por_id(usuario_id)

        if not usuario:
            raise error_token

        # La huella cambia al modificar la contraseña: el token no se reutiliza.
        huella_token = str(payload.get("huella", ""))
        if not secrets.compare_digest(
            huella_password(usuario.password_hash), huella_token
        ):
            raise error_token

        if verificar_password(datos.password, usuario.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La nueva contraseña debe ser diferente a la anterior",
            )

        self.usuario_repositorio.actualizar_password_hash(
            usuario.id, hash_password(datos.password)
        )

        return {"mensaje": "Contraseña actualizada correctamente."}

    def cambiar_password(
        self, usuario: Usuario, datos: CambiarPassword
    ) -> dict[str, str]:
        """Cambio de contraseña para un usuario ya autenticado."""
        if not verificar_password(datos.password_actual, usuario.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La contraseña actual no es correcta",
            )

        if verificar_password(datos.password, usuario.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="La nueva contraseña debe ser diferente a la actual",
            )

        self.usuario_repositorio.actualizar_password_hash(
            usuario.id, hash_password(datos.password)
        )

        return {"mensaje": "Contraseña actualizada correctamente."}
