"""Pruebas de las dependencias de autorización por rol.

No tocan SQL Server: la dependencia `get_current_user` se reemplaza por un
usuario falso y, cuando hace falta, `get_db` por una conexión nula.
"""

from collections.abc import Iterator

import pytest
from fastapi import Depends, FastAPI
from fastapi.testclient import TestClient

from backend.core.dependencies import (
    get_current_admin,
    get_current_user,
    get_current_veterinario,
)
from backend.database.conection import get_db
from backend.models.usuario_model import Usuario


def _usuario(rol: str) -> Usuario:
    return Usuario(
        id=1,
        nombres="Usuario",
        apellidos="Prueba",
        email="usuario@correo.com",
        telefono="987654321",
        dni="12345678",
        password_hash="hash",
        rol=rol,
    )


def _app_veterinario(usuario: Usuario | None) -> FastAPI:
    app = FastAPI()

    @app.get("/solo-veterinario")
    def solo_veterinario(
        actual: Usuario = Depends(get_current_veterinario),
    ) -> dict[str, str]:
        return {"rol": actual.rol}

    if usuario is not None:
        app.dependency_overrides[get_current_user] = lambda: usuario

    return app


def _app_admin(usuario: Usuario) -> FastAPI:
    app = FastAPI()

    @app.get("/solo-admin")
    def solo_admin(actual: Usuario = Depends(get_current_admin)) -> dict[str, str]:
        return {"rol": actual.rol}

    app.dependency_overrides[get_current_user] = lambda: usuario
    return app


@pytest.mark.parametrize("rol", ["veterinario", "admin"])
def test_veterinario_y_admin_pueden_entrar(rol: str) -> None:
    cliente = TestClient(_app_veterinario(_usuario(rol)))

    respuesta = cliente.get("/solo-veterinario")

    assert respuesta.status_code == 200
    assert respuesta.json() == {"rol": rol}


def test_propietario_recibe_403_en_ruta_de_veterinario() -> None:
    cliente = TestClient(_app_veterinario(_usuario("propietario")))

    respuesta = cliente.get("/solo-veterinario")

    assert respuesta.status_code == 403
    assert respuesta.json()["detail"] == "No tienes permisos para realizar esta acción"


def test_solo_admin_permite_admin() -> None:
    cliente = TestClient(_app_admin(_usuario("admin")))

    assert cliente.get("/solo-admin").status_code == 200


def test_solo_admin_rechaza_veterinario() -> None:
    cliente = TestClient(_app_admin(_usuario("veterinario")))

    assert cliente.get("/solo-admin").status_code == 403


def test_sin_token_responde_401() -> None:
    app = _app_veterinario(None)

    def _db_falsa() -> Iterator[None]:
        yield None

    app.dependency_overrides[get_db] = _db_falsa
    cliente = TestClient(app)

    respuesta = cliente.get("/solo-veterinario")

    assert respuesta.status_code == 401
    assert respuesta.json()["detail"] == "Credenciales inválidas o token expirado"
