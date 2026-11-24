from pydantic import BaseModel, ConfigDict, Field


class ConfiguracionActualizar(BaseModel):
    sede: str | None = Field(default=None, max_length=100)
    notificaciones_citas: bool = True
    notificaciones_vacunas: bool = True
    notificaciones_pagos: bool = False


class ConfiguracionRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    usuario_id: int
    sede: str | None
    notificaciones_citas: bool
    notificaciones_vacunas: bool
    notificaciones_pagos: bool
