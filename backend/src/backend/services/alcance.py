from ..models.usuario_model import Usuario


def usuario_filtro(usuario: Usuario) -> int | None:
    """Devuelve el id del propietario para filtrar sus datos.

    Un propietario solo ve lo suyo (se filtra por su id). Un veterinario o
    administrador puede ver todo (None = sin filtro).
    """
    return usuario.id if usuario.rol == "propietario" else None


def nombre_completo(usuario: Usuario) -> str:
    return f"{usuario.nombres} {usuario.apellidos}".strip()


def puede_gestionar_clinica(usuario: Usuario) -> bool:
    return usuario.rol in ("veterinario", "admin")
