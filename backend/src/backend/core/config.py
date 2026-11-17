import os
import secrets
from pathlib import Path

from dotenv import load_dotenv

# Ruta absoluta al .env del backend (backend/.env), sin importar
# desde qué directorio se ejecute uvicorn.
RUTA_ENV = Path(__file__).resolve().parents[3] / ".env"

# Nombre de la aplicación usada por FastAPI en la documentación.
PROJECT_NAME = "API Clínica Pariona"


def _crear_env_inicial() -> None:
    """Crea backend/.env la primera vez, con valores locales por defecto.

    Si el archivo ya existe no se toca: el SECRET_KEY se mantiene estable
    entre reinicios y los tokens no se invalidan.
    """
    if RUTA_ENV.exists():
        return

    contenido = (
        "# Archivo generado automáticamente en el primer arranque.\n"
        "# No se sube a git (está en .gitignore). Puedes editarlo si lo necesitas.\n"
        f"SECRET_KEY={secrets.token_urlsafe(48)}\n"
        "ALGORITHM=HS256\n"
        "ACCESS_TOKEN_EXPIRE_MINUTES=60\n"
        "DB_SERVER=localhost\n"
        "DB_NAME=veterinaria_db\n"
        "DB_DRIVER=ODBC Driver 17 for SQL Server\n"
        "DB_TIMEOUT=10\n"
        "DB_AUTO_INIT=true\n"
    )

    try:
        RUTA_ENV.write_text(contenido, encoding="utf-8")
    except OSError:
        # Si la carpeta es de solo lectura se usa una clave efímera en memoria.
        pass


_crear_env_inicial()
load_dotenv(RUTA_ENV)


def _variable(nombre: str, defecto: str) -> str:
    """Obtiene una variable de entorno, con valor por defecto si no existe."""
    valor = os.getenv(nombre)
    return valor.strip() if valor and valor.strip() else defecto


def _booleano(nombre: str, defecto: bool) -> bool:
    valor = os.getenv(nombre)
    if valor is None:
        return defecto
    return valor.strip().lower() in {"1", "true", "yes", "si", "sí"}


# Clave usada para firmar los tokens JWT. Vive solo en el .env local.
# Si no existe (por ejemplo, carpeta de solo lectura), se usa una efímera:
# en ese caso los tokens se invalidan al reiniciar el servidor.
SECRET_KEY = os.getenv("SECRET_KEY") or secrets.token_urlsafe(48)

# Algoritmo de firma del token.
ALGORITHM = _variable("ALGORITHM", "HS256")

# Tiempo de vida del token de acceso (en minutos).
ACCESS_TOKEN_EXPIRE_MINUTES = int(_variable("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# Datos de conexión a SQL Server.
DB_SERVER = _variable("DB_SERVER", "localhost")
DB_NAME = _variable("DB_NAME", "veterinaria_db")
DB_DRIVER = _variable("DB_DRIVER", "ODBC Driver 17 for SQL Server")
DB_TIMEOUT = int(_variable("DB_TIMEOUT", "10"))

# Crea la base, la tabla y los usuarios de prueba al arrancar si faltan.
DB_AUTO_INIT = _booleano("DB_AUTO_INIT", True)
