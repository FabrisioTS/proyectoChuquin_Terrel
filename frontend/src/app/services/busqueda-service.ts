import { Injectable, signal } from '@angular/core';

/**
 * Término de búsqueda compartido entre el topbar y la sección activa.
 */
@Injectable({
    providedIn: 'root',
})
export class BusquedaService {
    private _termino = signal('');

    readonly termino = this._termino.asReadonly();

    establecer(termino: string): void {
        this._termino.set(termino);
    }

    limpiar(): void {
        this._termino.set('');
    }
}
