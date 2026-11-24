from datetime import date

from pydantic import BaseModel, ConfigDict, Field


class HistorialCrear(BaseModel):
    mascota_id: int
    fecha: date
    doctor: str | None = Field(default=None, max_length=100)
    motivo: str | None = Field(default=None, max_length=200)
    diagnostico: str | None = Field(default=None, max_length=500)
    tratamiento: str | None = Field(default=None, max_length=500)
    receta: str | None = Field(default=None, max_length=1000)


class HistorialActualizar(BaseModel):
    fecha: date
    doctor: str | None = Field(default=None, max_length=100)
    motivo: str | None = Field(default=None, max_length=200)
    diagnostico: str | None = Field(default=None, max_length=500)
    tratamiento: str | None = Field(default=None, max_length=500)
    receta: str | None = Field(default=None, max_length=1000)


class HistorialRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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
