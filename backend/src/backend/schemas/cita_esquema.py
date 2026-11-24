from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

EstadoCita = Literal["Confirmada", "Pendiente", "Cancelada", "Atendida"]


class CitaCrear(BaseModel):
    mascota_id: int
    motivo: str = Field(min_length=1, max_length=200)
    doctor: str | None = Field(default=None, max_length=100)
    fecha: date
    hora: str = Field(pattern=r"^\d{2}:\d{2}$")
    veterinario_id: int | None = None


class CitaActualizar(BaseModel):
    motivo: str = Field(min_length=1, max_length=200)
    doctor: str | None = Field(default=None, max_length=100)
    fecha: date
    hora: str = Field(pattern=r"^\d{2}:\d{2}$")


class CitaEstado(BaseModel):
    estado: EstadoCita


class CitaRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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
