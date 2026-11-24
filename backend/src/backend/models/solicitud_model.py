from dataclasses import dataclass
from datetime import date, datetime


@dataclass
class SolicitudCita:
    id: int
    tipo_mascota: str
    nombre_propietario: str
    telefono: str
    nombre_mascota: str
    servicio: str
    fecha_deseada: date | None
    turno: str | None
    notas: str | None
    estado: str = "Pendiente"
    creado_en: datetime | None = None
