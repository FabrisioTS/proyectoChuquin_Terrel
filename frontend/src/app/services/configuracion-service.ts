import { Injectable, computed, inject, signal } from '@angular/core';
import { AlmacenamientoService } from './almacenamiento-service';
import { Configuracion } from '../interfaces/Configuracion';

const CLAVE = 'portal_configuracion_v1';

@Injectable({
    providedIn: 'root',
})
export class ConfiguracionService {
    private almacenamiento = inject(AlmacenamientoService);
    private _configuracion = signal<Configuracion>(
        this.almacenamiento.leer(CLAVE, this.semilla()),
    );

    readonly configuracion = this._configuracion.asReadonly();
    readonly sede = computed(() => this._configuracion().sede);

    guardar(configuracion: Configuracion): void {
        this._configuracion.set(configuracion);
        this.almacenamiento.guardar(CLAVE, configuracion);
    }

    private semilla(): Configuracion {
        return {
            nombres: '',
            apellidos: '',
            email: '',
            telefono: '',
            dni: '',
            sede: 'Sede Central - San Carlos',
            notificacionesCitas: true,
            notificacionesVacunas: true,
            notificacionesPagos: false,
        };
    }
}
