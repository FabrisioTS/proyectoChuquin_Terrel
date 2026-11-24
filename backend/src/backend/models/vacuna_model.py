from dataclasses import dataclass
from datetime import date, datetime


@dataclass
class Vacuna:
    """Representa una fila de la tabla vacunas y tratamientos."""

    id: int
    usuario_id: int | None
    mascota_id: int
    mascota_nombre: str
    nombre: str
    tipo: str
    fecha_aplicacion: date
    proxima_dosis: date | None
    lote: str | None
    observaciones: str | None
    creado_en: datetime | None = None
