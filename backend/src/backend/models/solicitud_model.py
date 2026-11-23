from dataclasses import dataclass
from datetime import datetime


@dataclass
class Solicitud:
    """Solicitud enviada desde el portal público (cita, contacto o club)."""

    id: int
    tipo: str
    nombre: str | None
    telefono: str | None
    email: str | None
    mascota: str | None
    motivo: str | None
    mensaje: str | None
    estado: str
    creado_en: datetime | None = None
