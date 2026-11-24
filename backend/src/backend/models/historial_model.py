from dataclasses import dataclass
from datetime import date, datetime


@dataclass
class Historial:
    """Representa una fila de la tabla historial clínico."""

    id: int
    usuario_id: int | None
    mascota_id: int
    veterinario_id: int | None
    mascota_nombre: str
    fecha: date
    doctor: str | None
    motivo: str | None
    diagnostico: str | None
    tratamiento: str | None
    receta: str | None
    creado_en: datetime | None = None
