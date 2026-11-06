import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';
import { AutenticacionService } from '../services/autenticacion-service';

/**
 * Protege las rutas privadas: sin token redirige al login.
 * Durante el SSR se deja pasar para que el navegador haga la validación real.
 */
export const authGuard: CanActivateFn = () => {
    const autenticacionService = inject(AutenticacionService);
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    if (!isPlatformBrowser(platformId)) {
        return true;
    }

    if (autenticacionService.estaAutenticado()) {
        return true;
    }

    return router.createUrlTree(['/login']);
};
