"""Pruebas de validación de los esquemas Pydantic de la API."""

import pytest
from pydantic import ValidationError

from backend.schemas.cita_esquema import CitaCrear, CitaEstado
from backend.schemas.historial_esquema import HistorialCrear
from backend.schemas.mascota_esquema import MascotaCrear
from backend.schemas.pago_esquema import CheckoutSolicitud
from backend.schemas.usuario_esquema import UsuarioRegistro
from backend.schemas.vacuna_esquema import VacunaCrear


def test_mascota_valida_aplica_valores_por_defecto() -> None:
    mascota = MascotaCrear(nombre="Luna")

    assert mascota.nombre == "Luna"
    assert mascota.especie == "CANINO"
    assert mascota.usuario_id is None


def test_mascota_rechaza_especie_desconocida() -> None:
    with pytest.raises(ValidationError):
        MascotaCrear(nombre="Luna", especie="AVE")


def test_mascota_rechaza_nombre_vacio() -> None:
    with pytest.raises(ValidationError):
        MascotaCrear(nombre="")


def test_cita_valida_convierte_fecha() -> None:
    cita = CitaCrear(
        mascota_id=1,
        motivo="Control anual",
        fecha="2026-11-24",
        hora="09:30",
    )

    assert cita.fecha.isoformat() == "2026-11-24"
    assert cita.hora == "09:30"


def test_cita_rechaza_formato_de_hora_invalido() -> None:
    with pytest.raises(ValidationError):
        CitaCrear(
            mascota_id=1,
            motivo="Control",
            fecha="2026-11-24",
            hora="9:30",
        )


def test_cita_rechaza_estado_desconocido() -> None:
    with pytest.raises(ValidationError):
        CitaEstado(estado="Reprogramada")


def test_vacuna_rechaza_tipo_desconocido() -> None:
    with pytest.raises(ValidationError):
        VacunaCrear(
            mascota_id=1,
            nombre="Séxtuple",
            tipo="Inyección",
            fecha_aplicacion="2026-11-24",
        )


def test_historial_permite_campos_opcionales() -> None:
    historial = HistorialCrear(mascota_id=1, fecha="2026-11-24")

    assert historial.diagnostico is None
    assert historial.tratamiento is None


def test_checkout_exige_al_menos_un_item() -> None:
    with pytest.raises(ValidationError):
        CheckoutSolicitud(items=[])


def test_checkout_rechaza_cantidad_no_positiva() -> None:
    with pytest.raises(ValidationError):
        CheckoutSolicitud(items=[{"producto_id": 1, "cantidad": 0}])


def test_checkout_valido() -> None:
    solicitud = CheckoutSolicitud(
        items=[{"producto_id": 1, "cantidad": 2}],
        metodo="Tarjeta",
    )

    assert solicitud.items[0].cantidad == 2


def test_registro_rechaza_password_sin_numero() -> None:
    with pytest.raises(ValidationError):
        UsuarioRegistro(
            nombres="Ana",
            apellidos="Pérez",
            email="ana@correo.com",
            telefono="987654321",
            dni="12345678",
            password="sololetras",
            confirmar_password="sololetras",
        )


def test_registro_rechaza_password_no_coincidente() -> None:
    with pytest.raises(ValidationError):
        UsuarioRegistro(
            nombres="Ana",
            apellidos="Pérez",
            email="ana@correo.com",
            telefono="987654321",
            dni="12345678",
            password="Clave1234",
            confirmar_password="Clave5678",
        )


def test_registro_normaliza_email() -> None:
    usuario = UsuarioRegistro(
        nombres="Ana",
        apellidos="Pérez",
        email="  ANA@CORREO.COM ",
        telefono="987654321",
        dni="12345678",
        password="Clave1234",
        confirmar_password="Clave1234",
    )

    assert usuario.email == "ana@correo.com"
