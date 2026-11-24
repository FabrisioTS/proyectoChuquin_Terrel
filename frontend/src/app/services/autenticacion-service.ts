import { Injectable, computed, inject, signal, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import {
    CambiarPassword,
    MensajeRespuesta,
    RecuperarPasswordRespuesta,
    RecuperarPasswordSolicitud,
    RestablecerPassword,
    RolUsuario,
    TokenResponse,
    UsuarioActualizar,
    UsuarioLogin,
    UsuarioRegistro,
    UsuarioRegistroVeterinario,
    UsuarioResponse,
} from '../interfaces/Usuario';
import { environment } from '../../environments/environment';
import { manejarErrorHttp } from '../utils/error-http';

export type { ErrorApi, ErrorCampo } from '../utils/error-http';

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

    readonly rol = computed<RolUsuario>(
        () => this.usuarioActual()?.rol ?? 'propietario',
    );
    readonly esPropietario = computed(() => this.rol() === 'propietario');
    readonly esVeterinario = computed(
        () => this.rol() === 'veterinario' || this.rol() === 'admin',
    );
    readonly esAdmin = computed(() => this.rol() === 'admin');

    registrar_usuario(datos: UsuarioRegistro): Observable<UsuarioResponse> {
        return this.http
            .post<UsuarioResponse>(`${this.API_URL}/register`, datos)
            .pipe(catchError(manejarErrorHttp));
    }

    registrar_veterinario(
        datos: UsuarioRegistroVeterinario,
    ): Observable<UsuarioResponse> {
        return this.http
            .post<UsuarioResponse>(`${this.API_URL}/register-veterinario`, datos)
            .pipe(catchError(manejarErrorHttp));
    }

    logear_usuario(datos: UsuarioLogin): Observable<TokenResponse> {
        return this.http.post<TokenResponse>(`${this.API_URL}/login`, datos).pipe(
            tap((respuesta) => this.guardarSesion(respuesta)),
            catchError(manejarErrorHttp),
        );
    }

    recuperar_password(
        datos: RecuperarPasswordSolicitud,
    ): Observable<RecuperarPasswordRespuesta> {
        return this.http
            .post<RecuperarPasswordRespuesta>(
                `${this.API_URL}/recuperar-password`,
                datos,
            )
            .pipe(catchError(manejarErrorHttp));
    }

    restablecer_password(datos: RestablecerPassword): Observable<MensajeRespuesta> {
        return this.http
            .post<MensajeRespuesta>(`${this.API_URL}/restablecer-password`, datos)
            .pipe(catchError(manejarErrorHttp));
    }

    cambiar_password(datos: CambiarPassword): Observable<MensajeRespuesta> {
        return this.http
            .post<MensajeRespuesta>(`${this.API_URL}/cambiar-password`, datos)
            .pipe(catchError(manejarErrorHttp));
    }

    obtener_perfil(): Observable<UsuarioResponse> {
        return this.http.get<UsuarioResponse>(`${this.API_URL}/me`).pipe(
            tap((usuario) => this.guardarUsuario(usuario)),
            catchError(manejarErrorHttp),
        );
    }

    actualizarPerfil(datos: UsuarioActualizar): Observable<UsuarioResponse> {
        return this.http.put<UsuarioResponse>(`${this.API_URL}/me`, datos).pipe(
            tap((usuario) => this.guardarUsuario(usuario)),
            catchError(manejarErrorHttp),
        );
    }

    obtenerToken(): string | null {
        return this.leerStorage(TOKEN_KEY);
    }

    estaAutenticado(): boolean {
        return !!this.obtenerToken();
    }

    /** Ruta de inicio según el rol del usuario autenticado. */
    rutaInicio(): string {
        return this.esVeterinario() ? '/veterinario' : '/dashboard';
    }

    cerrar_sesion(): void {
        this.usuarioActual.set(null);
        this.eliminarStorage(TOKEN_KEY);
        this.eliminarStorage(USUARIO_KEY);
    }

    private guardarSesion(respuesta: TokenResponse): void {
        this.escribirStorage(TOKEN_KEY, respuesta.access_token);
        this.guardarUsuario(respuesta.usuario);
    }

    private guardarUsuario(usuario: UsuarioResponse): void {
        this.usuarioActual.set(usuario);
        this.escribirStorage(USUARIO_KEY, JSON.stringify(usuario));
    }

    private leerUsuarioGuardado(): UsuarioResponse | null {
        const guardado = this.leerStorage(USUARIO_KEY);

        if (!guardado) {
            return null;
        }

        try {
            const usuario = JSON.parse(guardado) as UsuarioResponse;
            // Compatibilidad con sesiones guardadas antes de existir el rol.
            return { ...usuario, rol: usuario.rol ?? 'propietario' };
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
}
