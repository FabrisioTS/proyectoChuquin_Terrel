from pydantic import BaseModel

from .mascota_esquema import MascotaRespuesta


class DuenoRespuesta(BaseModel):
    id: int
    nombres: str
    apellidos: str
    email: str
    telefono: str
    dni: str


class ClienteRespuesta(BaseModel):
    id: int
    nombres: str
    apellidos: str
    email: str
    telefono: str
    dni: str
    mascotas: list[MascotaRespuesta] = []


class PacienteRespuesta(BaseModel):
    mascota: MascotaRespuesta
    dueno: DuenoRespuesta | None


class ResumenVeterinario(BaseModel):
    pacientes: int
    citas_hoy: int
    vacunas_proximas: int
    pagos_pendientes: int
    clientes: int = 0
    total_ventas: float = 0.0
