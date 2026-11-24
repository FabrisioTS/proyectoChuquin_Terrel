from dataclasses import dataclass


@dataclass
class Usuario:
    """Representa una fila de la tabla usuarios (sin ORM)."""

    id: int
    nombres: str
    apellidos: str
    email: str
    telefono: str
    dni: str
    password_hash: str
    rol: str = "propietario"
