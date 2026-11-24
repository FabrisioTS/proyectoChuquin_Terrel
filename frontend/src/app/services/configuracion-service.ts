import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { manejarErrorHttp } from '../utils/error-http';
import { Configuracion } from '../interfaces/Configuracion';
import { AutenticacionService } from './autenticacion-service';

interface ConfiguracionApi {
    usuario_id: number;
    sede: string | null;
    notificaciones_citas: boolean;
    notificaciones_vacunas: boolean;
    notificaciones_pagos: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class ConfiguracionService {
    private http = inject(HttpClient);
    private autenticacionService = inject(AutenticacionService);
    private readonly API = `${environment.apiUrl}/configuracion`;

    private _configuracion = signal<Configuracion>(this.semilla());
    readonly cargando = signal(false);
    readonly error = signal<string | null>(null);

    readonly configuracion = this._configuracion.asReadonly();
    readonly sede = computed(() => this._configuracion().sede);

    async cargar(): Promise<void> {
        this.cargando.set(true);
        this.error.set(null);

        try {
            const api = await firstValueFrom(
                this.http
                    .get<ConfiguracionApi>(`${this.API}/`)
                    .pipe(catchError(manejarErrorHttp)),
            );
            this._configuracion.set(this.combinar(api));
        } catch (error) {
            this.error.set((error as Error).message);
        } finally {
            this.cargando.set(false);
        }
    }

    async guardar(configuracion: Configuracion): Promise<void> {
        const api = await firstValueFrom(
            this.http
                .put<ConfiguracionApi>(`${this.API}/`, {
                    sede: configuracion.sede || null,
                    notificaciones_citas: configuracion.notificacionesCitas,
                    notificaciones_vacunas: configuracion.notificacionesVacunas,
                    notificaciones_pagos: configuracion.notificacionesPagos,
                })
                .pipe(catchError(manejarErrorHttp)),
        );

        await firstValueFrom(
            this.autenticacionService.actualizarPerfil({
                nombres: configuracion.nombres,
                apellidos: configuracion.apellidos,
                email: configuracion.email,
                telefono: configuracion.telefono,
            }),
        );

        this._configuracion.set(this.combinar(api));
    }

    private combinar(api: ConfiguracionApi): Configuracion {
        const usuario = this.autenticacionService.usuarioActual();

        return {
            nombres: usuario?.nombres ?? '',
            apellidos: usuario?.apellidos ?? '',
            email: usuario?.email ?? '',
            telefono: usuario?.telefono ?? '',
            dni: usuario?.dni ?? '',
            sede: api.sede ?? '',
            notificacionesCitas: api.notificaciones_citas,
            notificacionesVacunas: api.notificaciones_vacunas,
            notificacionesPagos: api.notificaciones_pagos,
        };
    }

    private semilla(): Configuracion {
        return {
            nombres: '',
            apellidos: '',
            email: '',
            telefono: '',
            dni: '',
            sede: '',
            notificacionesCitas: true,
            notificacionesVacunas: true,
            notificacionesPagos: false,
        };
    }
}
