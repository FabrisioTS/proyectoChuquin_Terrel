from dataclasses import dataclass
from datetime import date, datetime


@dataclass
class Pago:
    """Representa una fila de la tabla pagos / comprobantes."""

    id: int
    usuario_id: int | None
    codigo: str
    concepto: str
    fecha: date
    monto: float
    metodo: str | None
    estado: str
    mascota_nombre: str | None
    creado_en: datetime | None = None
