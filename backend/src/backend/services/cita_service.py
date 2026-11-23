from datetime import date

from fastapi import HTTPException, status

from ..core.clinica import DIRECCION_PRINCIPAL, SEDE_PRINCIPAL
from ..models.cita_model import Cita
from ..models.usuario_model import Usuario
from ..repositories.cita_repository import CitaRepository
from ..repositories.mascota_repository import MascotaRepository
from ..schemas.cita_esquema import CitaActualizar, CitaCrear
from .alcance import nombre_completo, usuario_filtro

SEDE_PREDETERMINADA = SEDE_PRINCIPAL
DIRECCION_PREDETERMINADA = DIRECCION_PRINCIPAL
ESPECIALIDAD_PREDETERMINADA = "Medicina General"


class CitaService:
    def __init__(
        self,
        cita_repositorio: CitaRepository,
        mascota_repositorio: MascotaRepository,
    ):
        self.cita_repositorio = cita_repositorio
        self.mascota_repositorio = mascota_repositorio

    def listar(
        self,
        usuario: Usuario,
        desde: date | None = None,
        hasta: date | None = None,
    ) -> list[Cita]:
        return self.cita_repositorio.listar(
            usuario_filtro(usuario), desde, hasta
        )

    def obtener(self, usuario: Usuario, cita_id: int) -> Cita:
        cita = self.cita_repositorio.obtener(cita_id, usuario_filtro(usuario))

        if not cita:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cita no encontrada",
            )

        return cita

    def crear(self, usuario: Usuario, datos: CitaCrear) -> Cita:
        mascota = self.mascota_repositorio.obtener(
            datos.mascota_id, usuario_filtro(usuario)
        )

        if not mascota:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mascota no encontrada",
            )

        doctor = datos.doctor or nombre_completo(usuario)

        return self.cita_repositorio.crear(
            datos,
            usuario_id=mascota.usuario_id or usuario.id,
            mascota_nombre=mascota.nombre,
            especialidad=ESPECIALIDAD_PREDETERMINADA,
            sede=SEDE_PREDETERMINADA,
            direccion=DIRECCION_PREDETERMINADA,
        )

    def actualizar(
        self, usuario: Usuario, cita_id: int, datos: CitaActualizar
    ) -> Cita:
        cita = self.cita_repositorio.obtener(cita_id, usuario_filtro(usuario))

        if not cita:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cita no encontrada",
            )

        actualizada = self.cita_repositorio.actualizar(cita_id, datos)

        if not actualizada:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cita no encontrada",
            )

        return actualizada

    def cambiar_estado(
        self, usuario: Usuario, cita_id: int, nuevo_estado: str
    ) -> Cita:
        cita = self.cita_repositorio.obtener(cita_id, usuario_filtro(usuario))

        if not cita:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cita no encontrada",
            )

        # El propietario solo puede cancelar su cita; el personal clínico
        # puede moverla a cualquier estado válido.
        if usuario.rol == "propietario" and nuevo_estado != "Cancelada":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Solo puedes cancelar tus citas",
            )

        actualizada = self.cita_repositorio.cambiar_estado(cita_id, nuevo_estado)

        if not actualizada:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cita no encontrada",
            )

        return actualizada

    def eliminar(self, usuario: Usuario, cita_id: int) -> dict[str, str]:
        cita = self.cita_repositorio.obtener(cita_id, usuario_filtro(usuario))

        if not cita:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cita no encontrada",
            )

        self.cita_repositorio.eliminar(cita_id)
        return {"mensaje": "Cita eliminada correctamente"}
