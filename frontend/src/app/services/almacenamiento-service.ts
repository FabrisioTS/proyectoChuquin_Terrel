import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Acceso seguro a localStorage: durante el SSR no existe, por lo que se
 * devuelve siempre el valor por defecto.
 */
@Injectable({
    providedIn: 'root',
})
export class AlmacenamientoService {
    private platformId = inject(PLATFORM_ID);

    leer<T>(clave: string, porDefecto: T): T {
        if (!isPlatformBrowser(this.platformId)) {
            return porDefecto;
        }

        const guardado = localStorage.getItem(clave);

        if (!guardado) {
            return porDefecto;
        }

        try {
            return JSON.parse(guardado) as T;
        } catch {
            return porDefecto;
        }
    }

    guardar(clave: string, valor: unknown): void {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        localStorage.setItem(clave, JSON.stringify(valor));
    }
}
