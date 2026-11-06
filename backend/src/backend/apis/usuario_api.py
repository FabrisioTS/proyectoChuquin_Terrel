from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from ..core.dependencies import get_current_user
from ..database.conection import get_db
from ..models.usuario_model import UsuarioModel
from ..repositories.usuario_repository import UsuarioRepository
from ..schemas.usuario_esquema import (
    TokenResponse,
    UsuarioLogin,
    UsuarioRegistro,
    UsuarioResponse,
)
from ..services.usuario_service import UsuarioService

usuario_router = APIRouter(prefix="/auth", tags=["Autenticación de Usuarios"])


@usuario_router.post("/register", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def registrar_usuario(datos: UsuarioRegistro, db: Session = Depends(get_db)):
    repositorio = UsuarioRepository(db)
    servicio = UsuarioService(repositorio)
    return servicio.registrar_usuario(datos)


@usuario_router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def login(datos: UsuarioLogin, db: Session = Depends(get_db)):
    repositorio = UsuarioRepository(db)
    servicio = UsuarioService(repositorio)
    return servicio.iniciar_sesion(datos)


@usuario_router.get("/me", response_model=UsuarioResponse, status_code=status.HTTP_200_OK)
def obtener_perfil(usuario_actual: UsuarioModel = Depends(get_current_user)):
    """Ruta protegida de ejemplo: requiere enviar el header Authorization: Bearer <token>."""
    return usuario_actual
