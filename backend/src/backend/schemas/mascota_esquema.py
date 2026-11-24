from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

EspecieMascota = Literal["CANINO", "FELINO", "OTRO"]


class MascotaCrear(BaseModel):
    nombre: str = Field(min_length=1, max_length=100)
    especie: EspecieMascota = "CANINO"
    raza: str | None = Field(default=None, max_length=80)
    edad: int | None = Field(default=None, ge=0)
    sexo: str | None = Field(default=None, max_length=20)
    peso: float | None = Field(default=None, ge=0)
    microchip: str | None = Field(default=None, max_length=50)
    diagnostico: str | None = Field(default=None, max_length=300)
    cobertura: str | None = Field(default=None, max_length=100)
    foto: str | None = Field(default=None, max_length=300)
    # Solo lo usan veterinario/admin para asignar la mascota a un dueño.
    usuario_id: int | None = None


class MascotaActualizar(BaseModel):
    nombre: str = Field(min_length=1, max_length=100)
    especie: EspecieMascota = "CANINO"
    raza: str | None = Field(default=None, max_length=80)
    edad: int | None = Field(default=None, ge=0)
    sexo: str | None = Field(default=None, max_length=20)
    peso: float | None = Field(default=None, ge=0)
    microchip: str | None = Field(default=None, max_length=50)
    diagnostico: str | None = Field(default=None, max_length=300)
    cobertura: str | None = Field(default=None, max_length=100)
    foto: str | None = Field(default=None, max_length=300)


class MascotaRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

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
