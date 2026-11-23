import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

export interface ErrorCampo {
    campo: string;
    mensaje: string;
}

export interface ErrorApi extends Error {
    campos: ErrorCampo[];
    estado?: number;
}

interface DetalleValidacion {
    loc?: Array<string | number>;
    msg?: string;
    type?: string;
    ctx?: Record<string, unknown>;
}

/** Convierte un error HTTP de FastAPI en un ErrorApi legible en español. */
export function manejarErrorHttp(error: HttpErrorResponse): Observable<never> {
    let mensaje = 'Ocurrió un error en el servidor.';
    const campos: ErrorCampo[] = [];

    if (Array.isArray(error.error?.detail)) {
        for (const detalle of error.error.detail as DetalleValidacion[]) {
            const campo = detalle.loc?.length
                ? String(detalle.loc[detalle.loc.length - 1])
                : 'general';

            campos.push({
                campo,
                mensaje: traducirMensajeValidacion(detalle),
            });
        }

        mensaje = campos.length
            ? 'Revisa los datos marcados e inténtalo nuevamente.'
            : 'Los datos enviados no son válidos.';
    } else if (typeof error.error?.detail === 'string') {
        mensaje = error.error.detail;
    } else if (error.status === 0) {
        mensaje =
            'No se pudo conectar con el servidor backend. Verifique que FastAPI esté corriendo.';
    } else if (error.status === 401) {
        mensaje = 'Tu sesión expiró o las credenciales son incorrectas.';
    } else if (error.status === 403) {
        mensaje = 'No tienes permisos para realizar esta acción.';
    } else if (error.status === 404) {
        mensaje = 'El recurso solicitado no existe.';
    } else if (error.status === 409) {
        mensaje = 'Ya existe un registro con esos datos.';
    } else if (error.status >= 500) {
        mensaje = 'Ocurrió un error interno en el servidor. Inténtalo más tarde.';
    }

    const errorApi = new Error(mensaje) as ErrorApi;
    errorApi.campos = campos;
    errorApi.estado = error.status;

    return throwError(() => errorApi);
}

function traducirMensajeValidacion(detalle: DetalleValidacion): string {
    const mensaje = detalle.msg ?? 'El valor ingresado no es válido.';
    const ctx = detalle.ctx ?? {};

    switch (detalle.type) {
        case 'missing':
            return 'Este campo es obligatorio.';
        case 'string_too_short': {
            const minimo = Number(ctx['min_length'] ?? 0);
            return minimo > 0
                ? `Debe tener al menos ${minimo} caracteres.`
                : 'El texto es demasiado corto.';
        }
        case 'string_too_long': {
            const maximo = Number(ctx['max_length'] ?? 0);
            return maximo > 0
                ? `No debe superar los ${maximo} caracteres.`
                : 'El texto es demasiado largo.';
        }
        case 'string_pattern_mismatch':
            return 'El formato ingresado no es válido.';
        case 'value_error':
            return mensaje.replace(/^Value error,\s*/i, '').trim();
        case 'int_parsing':
        case 'float_parsing':
            return 'Debe ingresar un valor numérico válido.';
        default:
            return traducirMensajeIngles(mensaje);
    }
}

function traducirMensajeIngles(mensaje: string): string {
    const texto = mensaje.toLowerCase();

    if (texto.includes('valid email')) {
        return 'Ingresa un correo electrónico válido. Debe incluir "@" y un dominio.';
    }
    if (texto.includes('at least') && texto.includes('character')) {
        return 'El texto no cumple con la cantidad mínima de caracteres.';
    }
    if (texto.includes('at most') && texto.includes('character')) {
        return 'El texto supera la cantidad máxima de caracteres.';
    }
    if (texto.includes('field required')) {
        return 'Este campo es obligatorio.';
    }
    if (texto.includes('string should match pattern')) {
        return 'El formato ingresado no es válido.';
    }

    return mensaje;
}
