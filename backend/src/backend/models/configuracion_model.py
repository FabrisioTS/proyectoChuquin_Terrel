from dataclasses import dataclass
from datetime import datetime


@dataclass
class Configuracion:
    """Preferencias del portal por usuario."""

    usuario_id: int
    sede: str | None
    notificaciones_citas: bool
    notificaciones_vacunas: bool
    notificaciones_pagos: bool
    actualizado_en: datetime | None = None
