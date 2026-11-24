from dataclasses import dataclass
from datetime import date, datetime


@dataclass
class Cita:
    """Representa una fila de la tabla citas."""

    id: int
    usuario_id: int | None
    mascota_id: int
    veterinario_id: int | None
    mascota_nombre: str
    motivo: str
    doctor: str | None
    especialidad: str | None
    fecha: date
    hora: str
    sede: str | None
    direccion: str | None
    estado: str
    indicaciones: str | None
    creado_en: datetime | None = None
