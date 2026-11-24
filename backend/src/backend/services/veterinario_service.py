from datetime import date, timedelta

from ..repositories.cita_repository import CitaRepository
from ..repositories.historial_repository import HistorialRepository
from ..repositories.mascota_repository import MascotaRepository
from ..repositories.pago_repository import PagoRepository
from ..repositories.usuario_repository import UsuarioRepository
from ..repositories.vacuna_repository import VacunaRepository
from ..schemas.veterinario_esquema import (
    DuenoRespuesta,
    PacienteRespuesta,
    ResumenVeterinario,
)


class VeterinarioService:
    def __init__(
        self,
        mascota_repositorio: MascotaRepository,
        cita_repositorio: CitaRepository,
        vacuna_repositorio: VacunaRepository,
        historial_repositorio: HistorialRepository,
        pago_repositorio: PagoRepository,
        usuario_repositorio: UsuarioRepository,
    ):
        self.mascota_repositorio = mascota_repositorio
        self.cita_repositorio = cita_repositorio
        self.vacuna_repositorio = vacuna_repositorio
        self.historial_repositorio = historial_repositorio
        self.pago_repositorio = pago_repositorio
        self.usuario_repositorio = usuario_repositorio

    def listar_pacientes(self) -> list[PacienteRespuesta]:
        pacientes: list[PacienteRespuesta] = []

        for mascota in self.mascota_repositorio.listar(None):
            dueno = None

            if mascota.usuario_id is not None:
                usuario = self.usuario_repositorio.obtener_usuario_por_id(
                    mascota.usuario_id
                )

                if usuario:
                    dueno = DuenoRespuesta(
                        id=usuario.id,
                        nombres=usuario.nombres,
                        apellidos=usuario.apellidos,
                        email=usuario.email,
                        telefono=usuario.telefono,
                        dni=usuario.dni,
                    )

            pacientes.append(PacienteRespuesta(mascota=mascota, dueno=dueno))

        return pacientes

    def agenda(self, fecha: date | None = None):
        dia = fecha or date.today()
        return self.cita_repositorio.listar(None, dia, dia)

    def historial_reciente(self):
        return self.historial_repositorio.listar(None)[:10]

    def resumen(self) -> ResumenVeterinario:
        hoy = date.today()
        limite = hoy + timedelta(days=30)

        mascotas = self.mascota_repositorio.listar(None)
        citas_hoy = self.cita_repositorio.listar(None, hoy, hoy)
        vacunas = self.vacuna_repositorio.listar(None)
        pagos = self.pago_repositorio.listar(None)

        vacunas_proximas = [
            vacuna
            for vacuna in vacunas
            if vacuna.proxima_dosis is not None
            and hoy <= vacuna.proxima_dosis <= limite
        ]

        pagos_pendientes = [pago for pago in pagos if pago.estado != "Pagado"]

        return ResumenVeterinario(
            pacientes=len(mascotas),
            citas_hoy=len(citas_hoy),
            vacunas_proximas=len(vacunas_proximas),
            pagos_pendientes=len(pagos_pendientes),
        )
