import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CanActivateFn, Router } from '@angular/router';

import { AutenticacionService } from '../services/autenticacion-service';

/**
 * El portal `/dashboard` es exclusivo del propietario. Si un veterinario o
 * administrador intenta entrar, se le redirige a `/veterinario`.
 */
export const propietarioGuard: CanActivateFn = () => {
    const autenticacionService = inject(AutenticacionService);
    const router = inject(Router);
    const platformId = inject(PLATFORM_ID);

    if (!isPlatformBrowser(platformId)) {
        return true;
    }

    if (!autenticacionService.esVeterinario()) {
        return true;
    }

    return router.createUrlTree(['/veterinario']);
};
