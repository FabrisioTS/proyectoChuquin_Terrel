from dataclasses import dataclass
from datetime import datetime


@dataclass
class Producto:
    """Representa una fila de la tabla productos."""

    id: int
    nombre: str
    categoria: str
    precio: float
    stock: int
    descripcion: str | None
    emoji: str | None
    imagen: str | None
    activo: bool = True
    creado_en: datetime | None = None
