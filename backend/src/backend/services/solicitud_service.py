from fastapi import HTTPException, status

from ..models.solicitud_model import Solicitud
from ..repositories.solicitud_repository import SolicitudRepository
from ..schemas.solicitud_esquema import SolicitudCrear


class SolicitudService:
    def __init__(self, solicitud_repositorio: SolicitudRepository):
        self.solicitud_repositorio = solicitud_repositorio

    def crear(self, datos: SolicitudCrear) -> Solicitud:
        return self.solicitud_repositorio.crear(datos)

    def listar(self, estado: str | None = None) -> list[Solicitud]:
        return self.solicitud_repositorio.listar(estado)

    def marcar_atendida(self, solicitud_id: int) -> Solicitud:
        solicitud = self.solicitud_repositorio.marcar_atendida(solicitud_id)

        if not solicitud:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Solicitud no encontrada",
            )

        return solicitud
