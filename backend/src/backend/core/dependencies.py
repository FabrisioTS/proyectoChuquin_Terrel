import jwt
import pyodbc
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from ..core.segurity import decodificar_token
from ..database.conection import get_db
from ..models.usuario_model import Usuario
from ..repositories.usuario_repository import UsuarioRepository
from ..services.usuario_service import UsuarioService

# auto_error=False para poder devolver nuestro propio mensaje 401.
seguridad_bearer = HTTPBearer(auto_error=False)


def _credenciales_invalidas() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas o token expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )


def get_current_user(
    credenciales: HTTPAuthorizationCredentials | None = Depends(seguridad_bearer),
    conexion: pyodbc.Connection = Depends(get_db),
) -> Usuario:
    """Dependencia para proteger rutas: valida el token JWT y devuelve el usuario."""
    if credenciales is None or not credenciales.credentials:
        raise _credenciales_invalidas()

    try:
        payload = decodificar_token(credenciales.credentials)
    except jwt.PyJWTError:
        raise _credenciales_invalidas() from None

    usuario_id = payload.get("sub")

    if usuario_id is None:
        raise _credenciales_invalidas()

    try:
        usuario_id = int(usuario_id)
    except (TypeError, ValueError):
        raise _credenciales_invalidas() from None

    servicio = UsuarioService(UsuarioRepository(conexion))
    return servicio.obtener_usuario_actual(usuario_id)


def requiere_roles(*roles: str):
    """Dependencia reutilizable: exige que el usuario tenga uno de esos roles."""

    def verificar(usuario: Usuario = Depends(get_current_user)) -> Usuario:
        if usuario.rol not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tienes permisos para realizar esta acción",
            )
        return usuario

    return verificar


get_current_veterinario = requiere_roles("veterinario", "admin")
get_current_admin = requiere_roles("admin")
