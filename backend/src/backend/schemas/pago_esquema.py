from datetime import date
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

EstadoPago = Literal["Pagado", "Pendiente", "Vencido"]


class ItemCheckout(BaseModel):
    producto_id: int
    cantidad: int = Field(ge=1)


class CheckoutSolicitud(BaseModel):
    items: list[ItemCheckout] = Field(min_length=1)
    metodo: str = Field(default="Tarjeta", max_length=50)


class PagoRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    usuario_id: int | None
    codigo: str
    concepto: str
    fecha: date
    monto: float
    metodo: str | None
    estado: str
    mascota_nombre: str | None
