import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AutenticacionService } from '../services/autenticacion-service';
import { environment } from '../../environments/environment';

/**
 * Agrega el token JWT a las peticiones dirigidas al backend y,
 * si el token expiró o es inválido (401), cierra la sesión y manda al login.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const autenticacionService = inject(AutenticacionService);
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    const esPeticionAlBackend = req.url.startsWith(environment.apiUrl);
    const esLogin = req.url.endsWith('/auth/login');
    const token = autenticacionService.obtenerToken();

    const peticion =
        esPeticionAlBackend && token
            ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
            : req;

    return next(peticion).pipe(
        catchError((error: HttpErrorResponse) => {
            if (
                esPeticionAlBackend &&
                !esLogin &&
                error.status === 401 &&
                isPlatformBrowser(platformId)
            ) {
                autenticacionService.cerrar_sesion();
                router.navigate(['/login']);
            }
            return throwError(() => error);
        }),
    );
};
