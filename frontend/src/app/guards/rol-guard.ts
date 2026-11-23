import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

import { AutenticacionService } from '../services/autenticacion-service';
import { RolUsuario } from '../interfaces/Usuario';

/**
 * Permite el acceso solo a los roles indicados. Si el usuario tiene otro rol
 * se le redirige a su portal correspondiente. Durante el SSR se deja pasar
 * para que el navegador haga la validación real.
 */
export function rolGuard(roles: RolUsuario[]): CanActivateFn {
    return () => {
        const autenticacionService = inject(AutenticacionService);
        const router = inject(Router);
        const platformId = inject(PLATFORM_ID);

        if (!isPlatformBrowser(platformId)) {
            return true;
        }

        if (roles.includes(autenticacionService.rol())) {
            return true;
        }

        return router.createUrlTree([autenticacionService.rutaInicio()]);
    };
}
