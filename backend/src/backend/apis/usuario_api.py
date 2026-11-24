import pyodbc
from fastapi import APIRouter, Depends, status

from ..core.codigo_temporal import gestor_codigo_veterinario
from ..core.dependencies import get_current_admin, get_current_user
from ..database.conection import get_db
from ..models.usuario_model import Usuario
from ..repositories.usuario_repository import UsuarioRepository
from ..schemas.usuario_esquema import (
    CambiarPassword,
    CodigoTemporalRespuesta,
    RecuperarPasswordRespuesta,
    RecuperarPasswordSolicitud,
    RestablecerPassword,
    TokenResponse,
    UsuarioActualizar,
    UsuarioLogin,
    UsuarioRegistro,
    UsuarioRegistroVeterinario,
    UsuarioResponse,
)
from ..services.usuario_service import UsuarioService

usuario_router = APIRouter(prefix="/auth", tags=["Autenticación de Usuarios"])


@usuario_router.post(
    "/register", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED
)
def registrar_usuario(
    datos: UsuarioRegistro,
    conexion: pyodbc.Connection = Depends(get_db),
):
    repositorio = UsuarioRepository(conexion)
    servicio = UsuarioService(repositorio)
    return servicio.registrar_usuario(datos)


@usuario_router.post(
    "/register-veterinario",
    response_model=UsuarioResponse,
    status_code=status.HTTP_201_CREATED,
)
def registrar_veterinario(
    datos: UsuarioRegistroVeterinario,
    conexion: pyodbc.Connection = Depends(get_db),
):
    """Registro de personal veterinario protegido por código temporal dinámico."""
    repositorio = UsuarioRepository(conexion)
    servicio = UsuarioService(repositorio)
    return servicio.registrar_veterinario(datos)


@usuario_router.get(
    "/admin/codigo-veterinario",
    response_model=CodigoTemporalRespuesta,
    status_code=status.HTTP_200_OK,
)
def obtener_codigo_veterinario(
    _: Usuario = Depends(get_current_admin),
):
    """Devuelve el código temporal dinámico activo (exclusivo para Administrador)."""
    return gestor_codigo_veterinario.obtener_codigo_actual()


@usuario_router.post(
    "/admin/codigo-veterinario/regenerar",
    response_model=CodigoTemporalRespuesta,
    status_code=status.HTTP_200_OK,
)
def regenerar_codigo_veterinario(
    _: Usuario = Depends(get_current_admin),
):
    """Fuerza la rotación inmediata del código temporal (exclusivo para Administrador)."""
    return gestor_codigo_veterinario.regenerar_codigo()


@usuario_router.post(
    "/login", response_model=TokenResponse, status_code=status.HTTP_200_OK
)
def login(
    datos: UsuarioLogin,
    conexion: pyodbc.Connection = Depends(get_db),
):
    repositorio = UsuarioRepository(conexion)
    servicio = UsuarioService(repositorio)
    return servicio.iniciar_sesion(datos)


@usuario_router.post(
    "/recuperar-password",
    response_model=RecuperarPasswordRespuesta,
    status_code=status.HTTP_200_OK,
)
def solicitar_recuperacion(
    datos: RecuperarPasswordSolicitud,
    conexion: pyodbc.Connection = Depends(get_db),
):
    """Verifica correo + DNI y devuelve un token temporal para cambiar la clave."""
    repositorio = UsuarioRepository(conexion)
    servicio = UsuarioService(repositorio)
    return servicio.solicitar_recuperacion(datos)


@usuario_router.post("/restablecer-password", status_code=status.HTTP_200_OK)
def restablecer_password(
    datos: RestablecerPassword,
    conexion: pyodbc.Connection = Depends(get_db),
):
    """Cambia la contraseña usando el token entregado por recuperar-password."""
    repositorio = UsuarioRepository(conexion)
    servicio = UsuarioService(repositorio)
    return servicio.restablecer_password(datos)


@usuario_router.post("/cambiar-password", status_code=status.HTTP_200_OK)
def cambiar_password(
    datos: CambiarPassword,
    usuario_actual: Usuario = Depends(get_current_user),
    conexion: pyodbc.Connection = Depends(get_db),
):
    """Cambio de contraseña para usuarios autenticados."""
    repositorio = UsuarioRepository(conexion)
    servicio = UsuarioService(repositorio)
    return servicio.cambiar_password(usuario_actual, datos)


@usuario_router.get(
    "/me", response_model=UsuarioResponse, status_code=status.HTTP_200_OK
)
def obtener_perfil(usuario_actual: Usuario = Depends(get_current_user)):
    """Ruta protegida de ejemplo: requiere enviar el header Authorization: Bearer <token>."""
    return usuario_actual


@usuario_router.put(
    "/me", response_model=UsuarioResponse, status_code=status.HTTP_200_OK
)
def actualizar_perfil(
    datos: UsuarioActualizar,
    usuario_actual: Usuario = Depends(get_current_user),
    conexion: pyodbc.Connection = Depends(get_db),
):
    """Actualiza los datos personales del usuario autenticado."""
    repositorio = UsuarioRepository(conexion)
    servicio = UsuarioService(repositorio)
    return servicio.actualizar_perfil(usuario_actual, datos)
