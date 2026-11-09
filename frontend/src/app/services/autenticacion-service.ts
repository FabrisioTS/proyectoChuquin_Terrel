import { Injectable, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
    TokenResponse,
    UsuarioLogin,
    UsuarioRegistro,
    UsuarioResponse,
} from '../interfaces/Usuario';
import { environment } from '../../environments/environment';

const TOKEN_KEY = 'access_token';
const USUARIO_KEY = 'usuario_actual';

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

@Injectable({
    providedIn: 'root',
})
export class AutenticacionService {
    private http = inject(HttpClient);
    private platformId = inject(PLATFORM_ID);
    private readonly API_URL = `${environment.apiUrl}/auth`;

    // Usuario actual restaurado desde el almacenamiento local (si existe).
    usuarioActual = signal<UsuarioResponse | null>(this.leerUsuarioGuardado());

    registrar_usuario(datos: UsuarioRegistro): Observable<UsuarioResponse> {
        return this.http
            .post<UsuarioResponse>(`${this.API_URL}/register`, datos)
            .pipe(catchError(this.manejadorErrores));
    }

    logear_usuario(datos: UsuarioLogin): Observable<TokenResponse> {
        return this.http.post<TokenResponse>(`${this.API_URL}/login`, datos).pipe(
            tap((respuesta) => this.guardarSesion(respuesta)),
            catchError(this.manejadorErrores),
        );
    }

    obtener_perfil(): Observable<UsuarioResponse> {
        return this.http.get<UsuarioResponse>(`${this.API_URL}/me`).pipe(
            tap((usuario) => {
                this.usuarioActual.set(usuario);
                this.escribirStorage(USUARIO_KEY, JSON.stringify(usuario));
            }),
            catchError(this.manejadorErrores),
        );
    }

    obtenerToken(): string | null {
        return this.leerStorage(TOKEN_KEY);
    }

    estaAutenticado(): boolean {
        return !!this.obtenerToken();
    }

    cerrar_sesion(): void {
        this.usuarioActual.set(null);
        this.eliminarStorage(TOKEN_KEY);
        this.eliminarStorage(USUARIO_KEY);
    }

    /**
     * Actualiza los datos del perfil en memoria y en localStorage.
     * El backend actual no expone un endpoint de edición de perfil.
     */
    actualizarPerfilLocal(datos: Partial<UsuarioResponse>): void {
        const actual = this.usuarioActual();

        if (!actual) {
            return;
        }

        const actualizado = { ...actual, ...datos };
        this.usuarioActual.set(actualizado);
        this.escribirStorage(USUARIO_KEY, JSON.stringify(actualizado));
    }

    private guardarSesion(respuesta: TokenResponse): void {
        this.usuarioActual.set(respuesta.usuario);
        this.escribirStorage(TOKEN_KEY, respuesta.access_token);
        this.escribirStorage(USUARIO_KEY, JSON.stringify(respuesta.usuario));
    }

    private leerUsuarioGuardado(): UsuarioResponse | null {
        const guardado = this.leerStorage(USUARIO_KEY);

        if (!guardado) {
            return null;
        }

        try {
            return JSON.parse(guardado) as UsuarioResponse;
        } catch {
            return null;
        }
    }

    // El SSR no tiene localStorage: se valida la plataforma antes de usarlo.
    private leerStorage(clave: string): string | null {
        if (!isPlatformBrowser(this.platformId)) {
            return null;
        }
        return localStorage.getItem(clave);
    }

    private escribirStorage(clave: string, valor: string): void {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }
        localStorage.setItem(clave, valor);
    }

    private eliminarStorage(clave: string): void {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }
        localStorage.removeItem(clave);
    }

    private manejadorErrores = (error: HttpErrorResponse): Observable<never> => {
        let mensaje = 'Ocurrió un error en el servidor.';
        const campos: ErrorCampo[] = [];

        if (Array.isArray(error.error?.detail)) {
            for (const detalle of error.error.detail as DetalleValidacion[]) {
                const campo = detalle.loc?.length
                    ? String(detalle.loc[detalle.loc.length - 1])
                    : 'general';

                campos.push({
                    campo,
                    mensaje: this.traducirMensajeValidacion(detalle),
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
            mensaje = 'Correo electrónico o contraseña incorrectos.';
        } else if (error.status === 403) {
            mensaje = 'No tienes permisos para realizar esta acción.';
        } else if (error.status === 409) {
            mensaje = 'Ya existe un registro con esos datos.';
        } else if (error.status >= 500) {
            mensaje = 'Ocurrió un error interno en el servidor. Inténtalo más tarde.';
        }

        const errorApi = new Error(mensaje) as ErrorApi;
        errorApi.campos = campos;
        errorApi.estado = error.status;

        return throwError(() => errorApi);
    };

    private traducirMensajeValidacion(detalle: DetalleValidacion): string {
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
                return this.traducirMensajeIngles(mensaje);
        }
    }

    private traducirMensajeIngles(mensaje: string): string {
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
    };
}
