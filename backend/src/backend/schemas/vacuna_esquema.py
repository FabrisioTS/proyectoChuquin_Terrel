from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

TipoRegistro = Literal["Vacuna", "Tratamiento", "Desparasitación"]


class VacunaCrear(BaseModel):
    mascota_id: int
    nombre: str = Field(min_length=1, max_length=150)
    tipo: TipoRegistro = "Vacuna"
    fecha_aplicacion: date
    proxima_dosis: date | None = None
    lote: str | None = Field(default=None, max_length=50)
    observaciones: str | None = Field(default=None, max_length=500)


class VacunaActualizar(BaseModel):
    nombre: str = Field(min_length=1, max_length=150)
    tipo: TipoRegistro = "Vacuna"
    fecha_aplicacion: date
    proxima_dosis: date | None = None
    lote: str | None = Field(default=None, max_length=50)
    observaciones: str | None = Field(default=None, max_length=500)


class VacunaRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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
