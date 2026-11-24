"""Pruebas para el esquema y lógica de solicitudes de citas."""

import pytest
from pydantic import ValidationError

from backend.schemas.solicitud_esquema import (
    SolicitudCitaCrear,
    SolicitudCitaRespuesta,
)


def test_solicitud_valida_creacion() -> None:
    solicitud = SolicitudCitaCrear(
        tipo_mascota="perro",
        nombre_propietario="Carlos Chuquin",
        telefono="914821538",
        nombre_mascota="Max",
        servicio="Consulta Preventiva",
        fecha_deseada="2026-11-25",
        turno="Mañana (8:00 AM - 12:00 PM)",
        notas="Revisión general de rutina.",
    )

    assert solicitud.nombre_propietario == "Carlos Chuquin"
    assert solicitud.tipo_mascota == "perro"
    assert solicitud.telefono == "914821538"
    assert solicitud.nombre_mascota == "Max"
    assert str(solicitud.fecha_deseada) == "2026-11-25"


def test_solicitud_rechaza_nombre_corto() -> None:
    with pytest.raises(ValidationError):
        SolicitudCitaCrear(
            tipo_mascota="perro",
            nombre_propietario="C",
            telefono="914821538",
            nombre_mascota="Max",
            servicio="Consulta",
        )


def test_solicitud_rechaza_tipo_invalido() -> None:
    with pytest.raises(ValidationError):
        SolicitudCitaCrear(
            tipo_mascota="reptil",  # type: ignore[arg-type]
            nombre_propietario="Ana Perez",
            telefono="914821538",
            nombre_mascota="Rex",
            servicio="Consulta",
        )
