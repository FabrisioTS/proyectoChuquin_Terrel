from fastapi import HTTPException, status

from ..core.segurity import crear_token_acceso, hash_password, verificar_password
from ..models.usuario_model import UsuarioModel
from ..repositories.usuario_repository import UsuarioRepository
from ..schemas.usuario_esquema import TokenResponse, UsuarioLogin, UsuarioRegistro, UsuarioResponse


class UsuarioService:
    def __init__(self, usuario_repositorio: UsuarioRepository):
        self.usuario_repositorio = usuario_repositorio

    def registrar_usuario(self, datos_usuario: UsuarioRegistro) -> UsuarioModel:
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

        return self.usuario_repositorio.crear_usuario(datos_usuario, clave_encriptada)

    def iniciar_sesion(self, datos_login: UsuarioLogin) -> TokenResponse:
        usuario = self.usuario_repositorio.obtener_usuario_por_email(datos_login.email)

        # Mismo mensaje para email inexistente y contraseña incorrecta:
        # evita que se pueda averiguar qué correos están registrados.
        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Correo electrónico o contraseña incorrectos",
            )

        es_clave_correcta = verificar_password(datos_login.password, usuario.password_hash)

        if not es_clave_correcta:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Correo electrónico o contraseña incorrectos",
            )

        token = crear_token_acceso(usuario.id, usuario.email)

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            usuario=UsuarioResponse.model_validate(usuario),
        )

    def obtener_usuario_actual(self, usuario_id: int) -> UsuarioModel:
        usuario = self.usuario_repositorio.obtener_usuario_por_id(usuario_id)

        if not usuario:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Credenciales inválidas o token expirado",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return usuario
