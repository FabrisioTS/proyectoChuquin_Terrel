from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class SolicitudCitaCrear(BaseModel):
    tipo_mascota: Literal["perro", "gato", "otro"] = "perro"
    nombre_propietario: str = Field(min_length=2, max_length=100)
    telefono: str = Field(min_length=9, max_length=20)
    nombre_mascota: str = Field(min_length=2, max_length=100)
    servicio: str = Field(min_length=2, max_length=100)
    fecha_deseada: date | None = None
    turno: str | None = Field(default=None, max_length=50)
    notas: str | None = Field(default=None, max_length=500)


class SolicitudCitaRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tipo_mascota: str
    nombre_propietario: str
    telefono: str
    nombre_mascota: str
    servicio: str
    fecha_deseada: date | None
    turno: str | None
    notas: str | None
    estado: str
    creado_en: datetime
