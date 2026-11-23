from fastapi import HTTPException, status

from ..models.usuario_model import Usuario
from ..models.vacuna_model import Vacuna
from ..repositories.mascota_repository import MascotaRepository
from ..repositories.vacuna_repository import VacunaRepository
from ..schemas.vacuna_esquema import VacunaActualizar, VacunaCrear
from .alcance import usuario_filtro


class VacunaService:
    def __init__(
        self,
        vacuna_repositorio: VacunaRepository,
        mascota_repositorio: MascotaRepository,
    ):
        self.vacuna_repositorio = vacuna_repositorio
        self.mascota_repositorio = mascota_repositorio

    def listar(
        self, usuario: Usuario, mascota_id: int | None = None
    ) -> list[Vacuna]:
        return self.vacuna_repositorio.listar(usuario_filtro(usuario), mascota_id)

    def crear(self, usuario: Usuario, datos: VacunaCrear) -> Vacuna:
        mascota = self.mascota_repositorio.obtener(datos.mascota_id)

        if not mascota:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mascota no encontrada",
            )

        return self.vacuna_repositorio.crear(
            datos,
            usuario_id=mascota.usuario_id or usuario.id,
            mascota_nombre=mascota.nombre,
        )

    def actualizar(
        self, usuario: Usuario, vacuna_id: int, datos: VacunaActualizar
    ) -> Vacuna:
        registro = self.vacuna_repositorio.actualizar(vacuna_id, datos)

        if not registro:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Registro sanitario no encontrado",
            )

        return registro

    def eliminar(self, usuario: Usuario, vacuna_id: int) -> dict[str, str]:
        if not self.vacuna_repositorio.eliminar(vacuna_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Registro sanitario no encontrado",
            )

        return {"mensaje": "Registro sanitario eliminado correctamente"}
