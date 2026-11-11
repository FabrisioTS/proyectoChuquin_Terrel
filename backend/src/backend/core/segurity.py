from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from .config import ACCESS_TOKEN_EXPIRE_MINUTES, ALGORITHM, SECRET_KEY

# bcrypt solo usa los primeros 72 bytes de la contraseña.
MAX_BYTES_BCRYPT = 72


def hash_password(password: str) -> str:
    password_bytes = password.encode("utf-8")[:MAX_BYTES_BCRYPT]
    salt = bcrypt.gensalt()
    hash_bytes = bcrypt.hashpw(password_bytes, salt)
    return hash_bytes.decode("utf-8")


def verificar_password(plain_password: str, hashed_password: str) -> bool:
    plain_bytes = plain_password.encode("utf-8")[:MAX_BYTES_BCRYPT]

    try:
        hashed_bytes = hashed_password.encode("utf-8")
        return bcrypt.checkpw(plain_bytes, hashed_bytes)
    except (ValueError, TypeError):
        # Hash con formato inválido o corrupto: se trata como contraseña incorrecta.
        return False


def crear_token_acceso(usuario_id: int, email: str) -> str:
    """Genera un JWT firmado con el id y el email del usuario."""
    ahora = datetime.now(timezone.utc)
    payload = {
        "sub": str(usuario_id),
        "email": email,
        "iat": ahora,
        "exp": ahora + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decodificar_token(token: str) -> dict:
    """Valida la firma y la expiración del token. Lanza jwt.PyJWTError si no es válido."""
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
