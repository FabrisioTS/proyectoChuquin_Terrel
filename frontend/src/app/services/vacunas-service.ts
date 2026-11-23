import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { manejarErrorHttp } from '../utils/error-http';
import {
    EstadoRegistroSanitario,
    TipoRegistroSanitario,
    Vacuna,
    VacunaFormulario,
} from '../interfaces/Vacuna';
import { diasHasta } from '../utils/fechas';

interface VacunaApi {
    id: number;
    usuario_id: number | null;
    mascota_id: number;
    mascota_nombre: string;
    nombre: string;
    tipo: string;
    fecha_aplicacion: string;
    proxima_dosis: string | null;
    lote: string | null;
    observaciones: string | null;
}

function mapearVacuna(api: VacunaApi): Vacuna {
    return {
        id: api.id,
        mascotaId: api.mascota_id,
        mascotaNombre: api.mascota_nombre,
        nombre: api.nombre,
        tipo: api.tipo as TipoRegistroSanitario,
        fechaAplicacion: api.fecha_aplicacion,
        proximaDosis: api.proxima_dosis ?? '',
        lote: api.lote ?? '',
        observaciones: api.observaciones ?? '',
    };
}

@Injectable({
    providedIn: 'root',
})
export class VacunasService {
    private http = inject(HttpClient);
    private readonly API = `${environment.apiUrl}/vacunas`;

    private _vacunas = signal<Vacuna[]>([]);
    readonly cargando = signal(false);
    readonly error = signal<string | null>(null);

    readonly vacunas = this._vacunas.asReadonly();
    readonly total = computed(() => this._vacunas().length);
    readonly vigentes = computed(
        () => this._vacunas().filter((vacuna) => this.estado(vacuna) === 'Vigente').length,
    );
    readonly proximas = computed(() =>
        this._vacunas()
            .filter((vacuna) => this.estado(vacuna) === 'Próximo')
            .sort((a, b) => a.proximaDosis.localeCompare(b.proximaDosis)),
    );
    readonly vencidas = computed(
        () => this._vacunas().filter((vacuna) => this.estado(vacuna) === 'Vencido').length,
    );

    estado(vacuna: Vacuna): EstadoRegistroSanitario {
        if (!vacuna.proximaDosis) {
            return 'Vigente';
        }

        const dias = diasHasta(vacuna.proximaDosis);

        if (dias < 0) {
            return 'Vencido';
        }

        if (dias <= 30) {
            return 'Próximo';
        }

        return 'Vigente';
    }

    async cargar(): Promise<void> {
        this.cargando.set(true);
        this.error.set(null);

        try {
            const datos = await firstValueFrom(
                this.http
                    .get<VacunaApi[]>(`${this.API}/`)
                    .pipe(catchError(manejarErrorHttp)),
            );
            this._vacunas.set(datos.map(mapearVacuna));
        } catch (error) {
            this.error.set((error as Error).message);
        } finally {
            this.cargando.set(false);
        }
    }

    async cargarPorMascota(mascotaId: number): Promise<Vacuna[]> {
        const datos = await firstValueFrom(
            this.http
                .get<VacunaApi[]>(`${this.API}/`, {
                    params: { mascota_id: mascotaId },
                })
                .pipe(catchError(manejarErrorHttp)),
        );
        return datos.map(mapearVacuna);
    }

    async crear(datos: VacunaFormulario, _mascotaNombre: string): Promise<Vacuna> {
        const api = await firstValueFrom(
            this.http
                .post<VacunaApi>(`${this.API}/`, {
                    mascota_id: datos.mascotaId,
                    nombre: datos.nombre,
                    tipo: datos.tipo,
                    fecha_aplicacion: datos.fechaAplicacion,
                    proxima_dosis: datos.proximaDosis || null,
                    lote: datos.lote || null,
                    observaciones: datos.observaciones || null,
                })
                .pipe(catchError(manejarErrorHttp)),
        );
        const vacuna = mapearVacuna(api);
        this._vacunas.update((vacunas) => [vacuna, ...vacunas]);
        return vacuna;
    }

    async eliminar(id: number): Promise<void> {
        await firstValueFrom(
            this.http
                .delete(`${this.API}/${id}`)
                .pipe(catchError(manejarErrorHttp)),
        );
        this._vacunas.update((vacunas) =>
            vacunas.filter((vacuna) => vacuna.id !== id),
        );
    }
}
