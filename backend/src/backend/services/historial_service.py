from fastapi import HTTPException, status

from ..models.historial_model import Historial
from ..models.usuario_model import Usuario
from ..repositories.historial_repository import HistorialRepository
from ..repositories.mascota_repository import MascotaRepository
from ..schemas.historial_esquema import HistorialActualizar, HistorialCrear
from .alcance import nombre_completo, usuario_filtro


class HistorialService:
    def __init__(
        self,
        historial_repositorio: HistorialRepository,
        mascota_repositorio: MascotaRepository,
    ):
        self.historial_repositorio = historial_repositorio
        self.mascota_repositorio = mascota_repositorio

    def listar(
        self, usuario: Usuario, mascota_id: int | None = None
    ) -> list[Historial]:
        return self.historial_repositorio.listar(
            usuario_filtro(usuario), mascota_id
        )

    def listar_por_mascota(
        self, usuario: Usuario, mascota_id: int
    ) -> list[Historial]:
        mascota = self.mascota_repositorio.obtener(
            mascota_id, usuario_filtro(usuario)
        )

        if not mascota:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mascota no encontrada",
            )

        return self.historial_repositorio.listar(
            usuario_filtro(usuario), mascota_id
        )

    def obtener(self, usuario: Usuario, historial_id: int) -> Historial:
        registro = self.historial_repositorio.obtener(
            historial_id, usuario_filtro(usuario)
        )

        if not registro:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Registro de historial no encontrado",
            )

        return registro

    def crear(self, usuario: Usuario, datos: HistorialCrear) -> Historial:
        mascota = self.mascota_repositorio.obtener(datos.mascota_id)

        if not mascota:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mascota no encontrada",
            )

        doctor = datos.doctor or nombre_completo(usuario)

        return self.historial_repositorio.crear(
            datos,
            usuario_id=mascota.usuario_id or usuario.id,
            mascota_nombre=mascota.nombre,
            veterinario_id=usuario.id,
            doctor=doctor,
        )

    def actualizar(
        self, usuario: Usuario, historial_id: int, datos: HistorialActualizar
    ) -> Historial:
        registro = self.historial_repositorio.actualizar(historial_id, datos)

        if not registro:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Registro de historial no encontrado",
            )

        return registro

    def eliminar(self, usuario: Usuario, historial_id: int) -> dict[str, str]:
        if not self.historial_repositorio.eliminar(historial_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Registro de historial no encontrado",
            )

        return {"mensaje": "Registro eliminado correctamente"}
