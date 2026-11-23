import re
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator

TipoSolicitud = Literal["cita", "contacto", "club"]
EstadoSolicitud = Literal["Nueva", "Atendida"]

PATRON_TELEFONO = re.compile(r"^9\d{8}$")


def _normalizar_telefono(valor):
    """Convierte '+51 914 821 538' en '914821538'."""
    if not isinstance(valor, str):
        return valor

    digitos = re.sub(r"\D", "", valor)

    if digitos.startswith("51") and len(digitos) == 11:
        digitos = digitos[2:]

    return digitos or None


class SolicitudCrear(BaseModel):
    tipo: TipoSolicitud
    nombre: str | None = Field(default=None, max_length=120)
    telefono: str | None = Field(default=None, max_length=20)
    email: EmailStr | None = None
    mascota: str | None = Field(default=None, max_length=120)
    motivo: str | None = Field(default=None, max_length=200)
    mensaje: str | None = Field(default=None, max_length=1000)

    @model_validator(mode="before")
    @classmethod
    def limpiar_campos(cls, valores):
        if not isinstance(valores, dict):
            return valores

        datos = dict(valores)

        for campo in ("nombre", "mascota", "motivo", "mensaje"):
            if isinstance(datos.get(campo), str):
                datos[campo] = datos[campo].strip() or None

        if "telefono" in datos:
            datos["telefono"] = _normalizar_telefono(datos["telefono"])

        return datos

    @model_validator(mode="after")
    def validar_segun_tipo(self):
        if self.tipo == "cita":
            if not self.nombre or len(self.nombre) < 2:
                raise ValueError("Ingresa el nombre del propietario")
            if not self.telefono or not PATRON_TELEFONO.match(self.telefono):
                raise ValueError(
                    "Ingresa un celular de 9 dígitos que empiece con 9"
                )
            if not self.mascota:
                raise ValueError("Ingresa el nombre de tu mascota")
        elif self.tipo == "contacto":
            if not self.nombre or len(self.nombre) < 2:
                raise ValueError("Ingresa tu nombre")
            if not self.email and not self.telefono:
                raise ValueError("Ingresa un correo o un teléfono de contacto")
            if not self.mensaje:
                raise ValueError("Escribe tu consulta")
        elif self.tipo == "club":
            if not self.email:
                raise ValueError("Ingresa tu correo electrónico")

        return self


class SolicitudRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tipo: str
    nombre: str | None
    telefono: str | None
    email: str | None
    mascota: str | None
    motivo: str | None
    mensaje: str | None
    estado: str
    creado_en: datetime | None
