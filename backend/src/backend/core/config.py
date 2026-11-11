import os
from pathlib import Path

from dotenv import load_dotenv

# Ruta absoluta al .env del backend (backend/.env), sin importar
# desde qué directorio se ejecute uvicorn.
RUTA_ENV = Path(__file__).resolve().parents[3] / ".env"
load_dotenv(RUTA_ENV)

# Nombre de la aplicación usada por FastAPI en la documentación.
PROJECT_NAME = "API Clínica Pariona"


def _variable_requerida(nombre: str) -> str:
    """Obtiene una variable de entorno obligatoria y falla con un mensaje claro."""
    valor = os.getenv(nombre)

    if valor is None or not valor.strip():
        raise RuntimeError(
            f"Falta la variable de entorno obligatoria '{nombre}'. "
            f"Revísala en el archivo {RUTA_ENV}"
        )

    return valor.strip()


# Clave usada para firmar los tokens JWT (definida en .env).
SECRET_KEY = _variable_requerida("SECRET_KEY")

# Algoritmo de firma del token.
ALGORITHM = os.getenv("ALGORITHM", "HS256")

# Tiempo de vida del token de acceso (en minutos).
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# Datos de conexión a SQL Server.
DB_SERVER = _variable_requerida("DB_SERVER")
DB_NAME = _variable_requerida("DB_NAME")
DB_DRIVER = os.getenv("DB_DRIVER", "ODBC Driver 17 for SQL Server")
DB_TIMEOUT = int(os.getenv("DB_TIMEOUT", "10"))
