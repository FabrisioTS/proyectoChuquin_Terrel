import os

# Nombre de la aplicación usada por FastAPI en la documentación.
PROJECT_NAME = "API Clínica Pariona"

# Clave usada para firmar los tokens JWT.
# En producción SIEMPRE debe definirse la variable de entorno SECRET_KEY.
SECRET_KEY = os.getenv("SECRET_KEY", "clinica-pariona-dev-secret-key-cambiar-en-produccion")

# Algoritmo de firma del token.
ALGORITHM = "HS256"

# Tiempo de vida del token de acceso (en minutos).
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
