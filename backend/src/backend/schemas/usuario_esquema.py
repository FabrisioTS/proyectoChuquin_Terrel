import re

from pydantic import (
    BaseModel,
    ConfigDict,
    EmailStr,
    Field,
    ValidationInfo,
    field_validator,
    model_validator,
)

PATRON_NOMBRES = re.compile(r"^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$")
PATRON_EMAIL = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$")
PATRON_TELEFONO = re.compile(r"^9\d{8}$")
PATRON_DNI = re.compile(r"^\d{8}$")
PATRON_PASSWORD = re.compile(r"^(?=.*[A-Za-z])(?=.*\d).+$")


def _normalizar_email(valor):
    """Quita espacios y convierte el correo a minúsculas antes de validarlo."""
    if isinstance(valor, str):
        return valor.strip().lower()
    return valor


def _limpiar_texto(valor):
    """Elimina espacios al inicio y al final de los textos."""
    if isinstance(valor, str):
        return valor.strip()
    return valor


def _validar_password_segura(valor):
    """Reglas compartidas por el registro, la recuperación y el cambio de clave."""
    if not isinstance(valor, str):
        return valor

    if len(valor) < 8:
        raise ValueError("La contraseña debe tener al menos 8 caracteres")
    if len(valor) > 72:
        raise ValueError("La contraseña no debe superar los 72 caracteres")
    if not PATRON_PASSWORD.match(valor):
        raise ValueError("La contraseña debe incluir al menos una letra y un número")

    return valor


# 1. Lo que RECIBE FastAPI para registrar
class UsuarioRegistro(BaseModel):
    nombres: str = Field(min_length=2, max_length=100)
    apellidos: str = Field(min_length=2, max_length=100)
    email: EmailStr
    telefono: str = Field(min_length=9, max_length=9)
    dni: str = Field(min_length=8, max_length=8)
    password: str = Field(min_length=8, max_length=72)
    confirmar_password: str = Field(min_length=8, max_length=72)  # Igual que en Angular

    @field_validator("nombres", "apellidos", mode="before")
    @classmethod
    def validar_nombres(cls, valor, info: ValidationInfo):
        valor = _limpiar_texto(valor)

        if not isinstance(valor, str):
            return valor

        etiqueta = "El nombre" if info.field_name == "nombres" else "El apellido"

        if len(valor) < 2:
            raise ValueError(f"{etiqueta} debe tener al menos 2 caracteres")
        if len(valor) > 100:
            raise ValueError(f"{etiqueta} no debe superar los 100 caracteres")
        if not PATRON_NOMBRES.match(valor):
            raise ValueError(f"{etiqueta} solo debe contener letras y espacios")

        return valor

    @field_validator("email", mode="before")
    @classmethod
    def normalizar_email(cls, valor):
        valor = _normalizar_email(valor)

        if isinstance(valor, str) and not PATRON_EMAIL.match(valor):
            raise ValueError(
                'Ingresa un correo electrónico válido. Debe incluir "@" y un dominio.'
            )

        return valor

    @field_validator("telefono", mode="before")
    @classmethod
    def validar_telefono(cls, valor):
        valor = _limpiar_texto(valor)

        if isinstance(valor, str) and not PATRON_TELEFONO.match(valor):
            raise ValueError(
                "El teléfono debe tener exactamente 9 dígitos y empezar con 9"
            )

        return valor

    @field_validator("dni", mode="before")
    @classmethod
    def validar_dni(cls, valor):
        valor = _limpiar_texto(valor)

        if isinstance(valor, str) and not PATRON_DNI.match(valor):
            raise ValueError("El DNI debe tener exactamente 8 dígitos numéricos")

        return valor

    @field_validator("password", "confirmar_password", mode="before")
    @classmethod
    def validar_password(cls, valor, info: ValidationInfo):
        return _validar_password_segura(valor)

    @model_validator(mode="after")
    def verificar_password_coincide(self):
        if self.password != self.confirmar_password:
            raise ValueError("Las contraseñas no coinciden")
        return self


# 2. Lo que RECIBE FastAPI para login
# Se mantiene min_length=1 para no bloquear cuentas antiguas con claves cortas.
class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)

    @field_validator("email", mode="before")
    @classmethod
    def normalizar_email(cls, valor):
        valor = _normalizar_email(valor)

        if isinstance(valor, str) and not PATRON_EMAIL.match(valor):
            raise ValueError(
                'Ingresa un correo electrónico válido. Debe incluir "@" y un dominio.'
            )

        return valor


# 3. Lo que DEVUELVE FastAPI al Frontend (Respuesta segura sin contraseñas)
class UsuarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombres: str
    apellidos: str
    email: EmailStr
    telefono: str
    dni: str
    rol: str = "propietario"


# 3.1 Actualización del perfil del usuario autenticado
class UsuarioActualizar(BaseModel):
    nombres: str = Field(min_length=2, max_length=100)
    apellidos: str = Field(min_length=2, max_length=100)
    email: EmailStr
    telefono: str = Field(min_length=9, max_length=9)

    @field_validator("nombres", "apellidos", mode="before")
    @classmethod
    def validar_nombres(cls, valor, info: ValidationInfo):
        valor = _limpiar_texto(valor)

        if not isinstance(valor, str):
            return valor

        etiqueta = "El nombre" if info.field_name == "nombres" else "El apellido"

        if len(valor) < 2:
            raise ValueError(f"{etiqueta} debe tener al menos 2 caracteres")
        if len(valor) > 100:
            raise ValueError(f"{etiqueta} no debe superar los 100 caracteres")
        if not PATRON_NOMBRES.match(valor):
            raise ValueError(f"{etiqueta} solo debe contener letras y espacios")

        return valor

    @field_validator("email", mode="before")
    @classmethod
    def normalizar_email(cls, valor):
        valor = _normalizar_email(valor)

        if isinstance(valor, str) and not PATRON_EMAIL.match(valor):
            raise ValueError(
                'Ingresa un correo electrónico válido. Debe incluir "@" y un dominio.'
            )

        return valor

    @field_validator("telefono", mode="before")
    @classmethod
    def validar_telefono(cls, valor):
        valor = _limpiar_texto(valor)

        if isinstance(valor, str) and not PATRON_TELEFONO.match(valor):
            raise ValueError(
                "El teléfono debe tener exactamente 9 dígitos y empezar con 9"
            )

        return valor


# 4. Respuesta del login: token + datos públicos del usuario
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioResponse


# 5. Recuperación: verificación de identidad con correo + DNI
class RecuperarPasswordSolicitud(BaseModel):
    email: EmailStr
    dni: str = Field(min_length=8, max_length=8)

    @field_validator("email", mode="before")
    @classmethod
    def normalizar_email(cls, valor):
        valor = _normalizar_email(valor)

        if isinstance(valor, str) and not PATRON_EMAIL.match(valor):
            raise ValueError(
                'Ingresa un correo electrónico válido. Debe incluir "@" y un dominio.'
            )

        return valor

    @field_validator("dni", mode="before")
    @classmethod
    def validar_dni(cls, valor):
        valor = _limpiar_texto(valor)

        if isinstance(valor, str) and not PATRON_DNI.match(valor):
            raise ValueError("El DNI debe tener exactamente 8 dígitos numéricos")

        return valor


class RecuperarPasswordRespuesta(BaseModel):
    mensaje: str
    token_recuperacion: str


# 6. Nueva contraseña usando el token de recuperación
class RestablecerPassword(BaseModel):
    token: str = Field(min_length=10)
    password: str = Field(min_length=8, max_length=72)
    confirmar_password: str = Field(min_length=8, max_length=72)

    @field_validator("password", "confirmar_password", mode="before")
    @classmethod
    def validar_password(cls, valor):
        return _validar_password_segura(valor)

    @model_validator(mode="after")
    def verificar_password_coincide(self):
        if self.password != self.confirmar_password:
            raise ValueError("Las contraseñas no coinciden")
        return self


# 7. Cambio de contraseña para usuarios autenticados
class CambiarPassword(BaseModel):
    password_actual: str = Field(min_length=1, max_length=72)
    password: str = Field(min_length=8, max_length=72)
    confirmar_password: str = Field(min_length=8, max_length=72)

    @field_validator("password", "confirmar_password", mode="before")
    @classmethod
    def validar_password(cls, valor):
        return _validar_password_segura(valor)

    @model_validator(mode="after")
    def verificar_password_coincide(self):
        if self.password != self.confirmar_password:
            raise ValueError("Las contraseñas no coinciden")
        return self
