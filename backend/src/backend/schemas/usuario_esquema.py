from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator


def _normalizar_email(valor):
    """Quita espacios y convierte el correo a minúsculas antes de validarlo."""
    if isinstance(valor, str):
        return valor.strip().lower()
    return valor


# 1. Lo que RECIBE FastAPI para registrar
class UsuarioRegistro(BaseModel):
    nombres: str = Field(min_length=1, max_length=100)
    apellidos: str = Field(min_length=1, max_length=100)
    email: EmailStr
    telefono: str = Field(min_length=6, max_length=20)
    dni: str = Field(min_length=8, max_length=20)
    password: str = Field(min_length=6, max_length=72)
    confirmar_password: str = Field(min_length=6, max_length=72)  # Igual que en Angular

    @field_validator("email", mode="before")
    @classmethod
    def normalizar_email(cls, valor):
        return _normalizar_email(valor)

    @model_validator(mode="after")
    def verificar_password_coincide(self):
        if self.password != self.confirmar_password:
            raise ValueError("Las contraseñas no coinciden")
        return self


# 2. Lo que RECIBE FastAPI para login
class UsuarioLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=72)

    @field_validator("email", mode="before")
    @classmethod
    def normalizar_email(cls, valor):
        return _normalizar_email(valor)


# 3. Lo que DEVUELVE FastAPI al Frontend (Respuesta segura sin contraseñas)
class UsuarioResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nombres: str
    apellidos: str
    email: EmailStr
    telefono: str
    dni: str


# 4. Respuesta del login: token + datos públicos del usuario
class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    usuario: UsuarioResponse
