import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from ..core.segurity import decodificar_token
from ..database.conection import get_db
from ..models.usuario_model import UsuarioModel
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
    db: Session = Depends(get_db),
) -> UsuarioModel:
    """Dependencia para proteger rutas: valida el token JWT y devuelve el usuario."""
    if credenciales is None or not credenciales.credentials:
        raise _credenciales_invalidas()

    try:
        payload = decodificar_token(credenciales.credentials)
    except jwt.PyJWTError:
        raise _credenciales_invalidas()

    usuario_id = payload.get("sub")

    if usuario_id is None:
        raise _credenciales_invalidas()

    try:
        usuario_id = int(usuario_id)
    except (TypeError, ValueError):
        raise _credenciales_invalidas()

    servicio = UsuarioService(UsuarioRepository(db))
    return servicio.obtener_usuario_actual(usuario_id)
