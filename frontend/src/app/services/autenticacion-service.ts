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

        if (error.error?.detail) {
            if (Array.isArray(error.error.detail)) {
                const primerError = error.error.detail[0];
                const campo = primerError.loc ? primerError.loc[primerError.loc.length - 1] : 'campo';
                mensaje = `Error en '${campo}': ${primerError.msg}`;
            } else if (typeof error.error.detail === 'string') {
                mensaje = error.error.detail;
            }
        } else if (error.status === 0) {
            mensaje =
                'No se pudo conectar con el servidor backend. Verifique que FastAPI esté corriendo.';
        }

        return throwError(() => new Error(mensaje));
    };
}
