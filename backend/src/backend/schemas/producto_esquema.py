from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

CategoriaProducto = Literal[
    "Alimentos", "Juguetes", "Higiene", "Salud", "Accesorios"
]


class ProductoCrear(BaseModel):
    nombre: str = Field(min_length=1, max_length=150)
    categoria: CategoriaProducto
    precio: float = Field(ge=0)
    stock: int = Field(default=0, ge=0)
    descripcion: str | None = Field(default=None, max_length=600)
    emoji: str | None = Field(default=None, max_length=20)
    imagen: str | None = Field(default=None, max_length=300)


class ProductoActualizar(BaseModel):
    nombre: str = Field(min_length=1, max_length=150)
    categoria: CategoriaProducto
    precio: float = Field(ge=0)
    stock: int = Field(default=0, ge=0)
    descripcion: str | None = Field(default=None, max_length=600)
    emoji: str | None = Field(default=None, max_length=20)
    imagen: str | None = Field(default=None, max_length=300)


class ProductoRespuesta(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombre: str
    categoria: str
    precio: float
    stock: int
    descripcion: str | None
    emoji: str | None
    imagen: str | None
    activo: bool = True
