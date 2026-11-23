from dataclasses import dataclass
from datetime import datetime


@dataclass
class Mascota:
    """Representa una fila de la tabla mascotas."""

    id: int
    usuario_id: int | None
    nombre: str
    especie: str
    raza: str | None
    edad: int | None
    sexo: str | None
    peso: float | None
    microchip: str | None
    diagnostico: str | None
    cobertura: str | None
    foto: str | None
    activo: bool = True
    creado_en: datetime | None = None
