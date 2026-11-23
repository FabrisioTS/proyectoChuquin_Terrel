import hashlib
from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError

from .config import (
    ACCESS_TOKEN_EXPIRE_MINUTES,
    ALGORITHM,
    RESET_TOKEN_EXPIRE_MINUTES,
    SECRET_KEY,
)

# Argon2id: configuración recomendada por OWASP (64 MiB, 3 iteraciones).
_hasher = PasswordHasher(
    time_cost=3,
    memory_cost=65536,
    parallelism=4,
    hash_len=32,
    salt_len=16,
)

PREFIJOS_ARGON2 = ("$argon2id$", "$argon2i$", "$argon2d$")
PREFIJOS_BCRYPT = ("$2a$", "$2b$", "$2y$")

# bcrypt solo usa los primeros 72 bytes de la contraseña (hashes antiguos).
MAX_BYTES_BCRYPT = 72


def hash_password(password: str) -> str:
    """Genera un hash Argon2id con sal aleatoria."""
    return _hasher.hash(password)


def verificar_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica una contraseña contra un hash Argon2 o bcrypt (legado)."""
    if not isinstance(hashed_password, str) or not hashed_password:
        return False

    if hashed_password.startswith(PREFIJOS_ARGON2):
        try:
            return _hasher.verify(hashed_password, plain_password)
        except (VerificationError, InvalidHashError, TypeError, ValueError):
            return False

    if hashed_password.startswith(PREFIJOS_BCRYPT):
        try:
            return bcrypt.checkpw(
                plain_password.encode("utf-8")[:MAX_BYTES_BCRYPT],
                hashed_password.encode("utf-8"),
            )
        except (ValueError, TypeError):
            return False

    # Hash con formato desconocido o corrupto: contraseña incorrecta.
    return False


def necesita_rehash(hashed_password: str) -> bool:
    """Indica si el hash debe regenerarse (bcrypt legado o Argon2 desactualizado)."""
    if not hashed_password:
        return True

    if hashed_password.startswith(PREFIJOS_ARGON2):
        try:
            return _hasher.check_needs_rehash(hashed_password)
        except (InvalidHashError, ValueError):
            return True

    # Los hashes bcrypt siempre se migran a Argon2 al iniciar sesión.
    return True


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


def huella_password(hashed_password: str) -> str:
    """Huella corta del hash actual, usada para invalidar tokens ya utilizados."""
    return hashlib.sha256(hashed_password.encode("utf-8")).hexdigest()[:16]


def crear_token_recuperacion(
    usuario_id: int, email: str, password_hash: str
) -> str:
    """Genera un JWT de un solo uso para restablecer la contraseña.

    Incluye la huella del hash actual: cuando la contraseña cambia, el token
    deja de ser válido aunque todavía no haya expirado.
    """
    ahora = datetime.now(timezone.utc)
    payload = {
        "sub": str(usuario_id),
        "email": email,
        "tipo": "pwd_reset",
        "huella": huella_password(password_hash),
        "iat": ahora,
        "exp": ahora + timedelta(minutes=RESET_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decodificar_token_recuperacion(token: str) -> dict:
    """Valida el token de recuperación y comprueba que sea de ese tipo."""
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

    if payload.get("tipo") != "pwd_reset":
        raise jwt.InvalidTokenError("Token de recuperación inválido")

    return payload
