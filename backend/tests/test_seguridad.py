"""Pruebas de hashing de contraseñas y emisión/validación de tokens JWT."""

from datetime import datetime, timedelta, timezone

import jwt
import pytest

from backend.core.config import ALGORITHM, SECRET_KEY
from backend.core.segurity import (
    crear_token_acceso,
    crear_token_recuperacion,
    decodificar_token,
    decodificar_token_recuperacion,
    hash_password,
    huella_password,
    necesita_rehash,
    verificar_password,
)


def test_hash_argon2_verifica_correctamente() -> None:
    hashed = hash_password("Clave1234")

    assert hashed.startswith("$argon2")
    assert hashed != "Clave1234"
    assert verificar_password("Clave1234", hashed) is True
    assert verificar_password("OtraClave1", hashed) is False


def test_verificacion_rechaza_hashes_invalidos() -> None:
    assert verificar_password("Clave1234", "") is False
    assert verificar_password("Clave1234", "texto-plano") is False
    assert verificar_password("Clave1234", None) is False  # type: ignore[arg-type]


def test_necesita_rehash_solo_para_hashes_legados() -> None:
    assert necesita_rehash(hash_password("Clave1234")) is False
    assert necesita_rehash("") is True
    assert necesita_rehash("$2b$12$hashbcryptantiguo") is True


def test_token_acceso_incluye_rol_y_sujeto() -> None:
    token = crear_token_acceso(7, "vet@correo.com", "veterinario")
    payload = decodificar_token(token)

    assert payload["sub"] == "7"
    assert payload["email"] == "vet@correo.com"
    assert payload["rol"] == "veterinario"


def test_token_acceso_usa_propietario_por_defecto() -> None:
    payload = decodificar_token(crear_token_acceso(1, "dueno@correo.com"))

    assert payload["rol"] == "propietario"


def test_token_expirado_es_rechazado() -> None:
    ahora = datetime.now(timezone.utc)
    token = jwt.encode(
        {
            "sub": "1",
            "email": "dueno@correo.com",
            "rol": "propietario",
            "iat": ahora - timedelta(hours=2),
            "exp": ahora - timedelta(hours=1),
        },
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    with pytest.raises(jwt.ExpiredSignatureError):
        decodificar_token(token)


def test_token_con_firma_invalida_es_rechazado() -> None:
    token = jwt.encode(
        {"sub": "1", "rol": "admin"},
        "otra-clave-distinta-de-mas-de-32-bytes",
        algorithm=ALGORITHM,
    )

    with pytest.raises(jwt.InvalidSignatureError):
        decodificar_token(token)


def test_token_recuperacion_tiene_tipo_y_huella() -> None:
    hashed = hash_password("Clave1234")
    token = crear_token_recuperacion(3, "dueno@correo.com", hashed)
    payload = decodificar_token_recuperacion(token)

    assert payload["tipo"] == "pwd_reset"
    assert payload["huella"] == huella_password(hashed)


def test_token_de_acceso_no_sirve_para_recuperacion() -> None:
    token = crear_token_acceso(3, "dueno@correo.com")

    with pytest.raises(jwt.InvalidTokenError):
        decodificar_token_recuperacion(token)
