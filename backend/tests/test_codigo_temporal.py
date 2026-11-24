from datetime import datetime, timedelta, timezone

from backend.core.codigo_temporal import GestorCodigoTemporal
from backend.schemas.usuario_esquema import UsuarioRegistroVeterinario


def test_generacion_y_formato_codigo():
    gestor = GestorCodigoTemporal()
    info = gestor.obtener_codigo_actual()

    assert "codigo" in info
    assert info["codigo"].startswith("VET-")
    assert len(info["codigo"]) == 10  # "VET-" + 6 dígitos
    assert info["expira_en_segundos"] > 0
    assert "valido_hasta" in info


def test_validacion_codigo_correcto_e_incorrecto():
    gestor = GestorCodigoTemporal()
    info = gestor.obtener_codigo_actual()
    codigo_correcto = info["codigo"]

    assert gestor.validar_codigo(codigo_correcto) is True
    assert gestor.validar_codigo(codigo_correcto.lower()) is True  # Case insensitive
    assert gestor.validar_codigo("VET-999999") is False
    assert gestor.validar_codigo("") is False
    assert gestor.validar_codigo(None) is False


def test_regenerar_codigo():
    gestor = GestorCodigoTemporal()
    codigo_antiguo = gestor.obtener_codigo_actual()["codigo"]
    nuevo_info = gestor.regenerar_codigo()
    codigo_nuevo = nuevo_info["codigo"]

    assert codigo_nuevo.startswith("VET-")
    assert gestor.validar_codigo(codigo_antiguo) is False
    assert gestor.validar_codigo(codigo_nuevo) is True


def test_esquema_registro_veterinario():
    datos = {
        "nombres": "Carlos",
        "apellidos": "Santillan",
        "email": "carlos.vet@clinica.com",
        "telefono": "987654321",
        "dni": "87654321",
        "password": "Password123",
        "confirmar_password": "Password123",
        "codigo_autorizacion": "VET-123456",
    }
    esquema = UsuarioRegistroVeterinario.model_validate(datos)
    assert esquema.codigo_autorizacion == "VET-123456"
