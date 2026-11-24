from fastapi import HTTPException, status

from ..models.mascota_model import Mascota
from ..models.usuario_model import Usuario
from ..repositories.mascota_repository import MascotaRepository
from ..schemas.mascota_esquema import MascotaActualizar, MascotaCrear
from .alcance import usuario_filtro


class MascotaService:
    def __init__(self, mascota_repositorio: MascotaRepository):
        self.mascota_repositorio = mascota_repositorio

    def listar(self, usuario: Usuario) -> list[Mascota]:
        return self.mascota_repositorio.listar(usuario_filtro(usuario))

    def obtener(self, usuario: Usuario, mascota_id: int) -> Mascota:
        mascota = self.mascota_repositorio.obtener(
            mascota_id, usuario_filtro(usuario)
        )

        if not mascota:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mascota no encontrada",
            )

        return mascota

    def crear(self, usuario: Usuario, datos: MascotaCrear) -> Mascota:
        # Un propietario siempre crea mascotas a su nombre; el personal
        # puede asignarlas a un dueño concreto.
        if usuario.rol == "propietario":
            propietario_id = usuario.id
        else:
            propietario_id = datos.usuario_id or usuario.id

        return self.mascota_repositorio.crear(datos, propietario_id)

    def actualizar(
        self, usuario: Usuario, mascota_id: int, datos: MascotaActualizar
    ) -> Mascota:
        mascota = self.mascota_repositorio.actualizar(
            mascota_id, datos, usuario_filtro(usuario)
        )

        if not mascota:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mascota no encontrada",
            )

        return mascota

    def eliminar(self, usuario: Usuario, mascota_id: int) -> dict[str, str]:
        eliminada = self.mascota_repositorio.eliminar(
            mascota_id, usuario_filtro(usuario)
        )

        if not eliminada:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mascota no encontrada",
            )

        return {"mensaje": "Mascota dada de baja correctamente"}
