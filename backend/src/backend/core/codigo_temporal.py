"""Gestor de código temporal dinámico para registro de veterinarios.

Genera códigos únicos temporales (formato VET-######) que rotan automáticamente
cada 15 minutos o cuando el administrador solicite regenerarlo.
Solo el administrador autenticado tiene acceso a consultar este código.
"""

from datetime import datetime, timedelta, timezone
import secrets
import string


class GestorCodigoTemporal:
    DURACION_MINUTOS = 15

    def __init__(self) -> None:
        self._codigo: str = ""
        self._expira_en: datetime = datetime.now(timezone.utc)
        self.regenerar_codigo()

    def _generar_valor(self) -> str:
        # 6 dígitos numéricos aleatorios precedidos de VET-
        digitos = "".join(secrets.choice(string.digits) for _ in range(6))
        return f"VET-{digitos}"

    def regenerar_codigo(self) -> dict[str, object]:
        self._codigo = self._generar_valor()
        self._expira_en = datetime.now(timezone.utc) + timedelta(
            minutes=self.DURACION_MINUTOS
        )
        return self.obtener_codigo_actual()

    def obtener_codigo_actual(self) -> dict[str, object]:
        ahora = datetime.now(timezone.utc)
        if ahora >= self._expira_en:
            return self.regenerar_codigo()

        segundos_restantes = max(0, int((self._expira_en - ahora).total_seconds()))
        return {
            "codigo": self._codigo,
            "expira_en_segundos": segundos_restantes,
            "valido_hasta": self._expira_en.isoformat(),
        }

    def validar_codigo(self, codigo_candidato: str | None) -> bool:
        if not codigo_candidato:
            return False

        ahora = datetime.now(timezone.utc)
        if ahora >= self._expira_en:
            self.regenerar_codigo()
            return False

        # Comparación en tiempo constante para mitigar timing attacks
        candidato = codigo_candidato.strip().upper()
        return secrets.compare_digest(candidato, self._codigo)


gestor_codigo_veterinario = GestorCodigoTemporal()
