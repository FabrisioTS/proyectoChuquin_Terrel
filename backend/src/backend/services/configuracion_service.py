from ..models.configuracion_model import Configuracion
from ..models.usuario_model import Usuario
from ..repositories.configuracion_repository import ConfiguracionRepository
from ..schemas.configuracion_esquema import ConfiguracionActualizar


class ConfiguracionService:
    def __init__(self, configuracion_repositorio: ConfiguracionRepository):
        self.configuracion_repositorio = configuracion_repositorio

    def obtener(self, usuario: Usuario) -> Configuracion:
        configuracion = self.configuracion_repositorio.obtener(usuario.id)

        if configuracion:
            return configuracion

        # Primera vez: se devuelven los valores por defecto sin escribir en BD.
        return Configuracion(
            usuario_id=usuario.id,
            sede=None,
            notificaciones_citas=True,
            notificaciones_vacunas=True,
            notificaciones_pagos=False,
        )

    def guardar(
        self, usuario: Usuario, datos: ConfiguracionActualizar
    ) -> Configuracion:
        return self.configuracion_repositorio.guardar(usuario.id, datos)
