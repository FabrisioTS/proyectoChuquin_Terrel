from ..models.solicitud_model import SolicitudCita
from ..repositories.solicitud_repository import SolicitudRepository
from ..schemas.solicitud_esquema import SolicitudCitaCrear


class SolicitudService:
    def __init__(self, repositorio: SolicitudRepository):
        self.repositorio = repositorio

    def registrar_solicitud(self, datos: SolicitudCitaCrear) -> SolicitudCita:
        return self.repositorio.crear(datos)

    def listar_solicitudes(self) -> list[SolicitudCita]:
        return self.repositorio.listar()
