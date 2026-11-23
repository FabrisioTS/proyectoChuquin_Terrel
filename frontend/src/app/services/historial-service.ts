import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { manejarErrorHttp } from '../utils/error-http';
import { Historial, HistorialFormulario } from '../interfaces/Historial';

interface HistorialApi {
    id: number;
    usuario_id: number | null;
    mascota_id: number;
    veterinario_id: number | null;
    mascota_nombre: string;
    fecha: string;
    doctor: string | null;
    motivo: string | null;
    diagnostico: string | null;
    tratamiento: string | null;
    receta: string | null;
}

function mapearHistorial(api: HistorialApi): Historial {
    return {
        id: api.id,
        mascotaId: api.mascota_id,
        mascotaNombre: api.mascota_nombre,
        fecha: api.fecha,
        doctor: api.doctor ?? '',
        motivo: api.motivo ?? '',
        diagnostico: api.diagnostico ?? '',
        tratamiento: api.tratamiento ?? '',
        receta: api.receta ?? '',
    };
}

@Injectable({
    providedIn: 'root',
})
export class HistorialService {
    private http = inject(HttpClient);
    private readonly API = `${environment.apiUrl}/historial`;

    private _historial = signal<Historial[]>([]);
    readonly cargando = signal(false);
    readonly error = signal<string | null>(null);

    readonly historial = this._historial.asReadonly();
    readonly total = computed(() => this._historial().length);

    readonly recientes = computed(() =>
        [...this._historial()].sort((a, b) => b.fecha.localeCompare(a.fecha)),
    );

    async cargar(): Promise<void> {
        this.cargando.set(true);
        this.error.set(null);

        try {
            const datos = await firstValueFrom(
                this.http
                    .get<HistorialApi[]>(`${this.API}/`)
                    .pipe(catchError(manejarErrorHttp)),
            );
            this._historial.set(datos.map(mapearHistorial));
        } catch (error) {
            this.error.set((error as Error).message);
        } finally {
            this.cargando.set(false);
        }
    }

    async cargarPorMascota(mascotaId: number): Promise<Historial[]> {
        const datos = await firstValueFrom(
            this.http
                .get<HistorialApi[]>(
                    `${environment.apiUrl}/mascotas/${mascotaId}/historial`,
                )
                .pipe(catchError(manejarErrorHttp)),
        );
        return datos.map(mapearHistorial);
    }

    async crear(
        datos: HistorialFormulario,
        _mascotaNombre: string,
    ): Promise<Historial> {
        const api = await firstValueFrom(
            this.http
                .post<HistorialApi>(`${this.API}/`, {
                    mascota_id: datos.mascotaId,
                    fecha: datos.fecha,
                    doctor: datos.doctor || null,
                    motivo: datos.motivo || null,
                    diagnostico: datos.diagnostico || null,
                    tratamiento: datos.tratamiento || null,
                    receta: datos.receta || null,
                })
                .pipe(catchError(manejarErrorHttp)),
        );
        const registro = mapearHistorial(api);
        this._historial.update((historial) => [registro, ...historial]);
        return registro;
    }

    async eliminar(id: number): Promise<void> {
        await firstValueFrom(
            this.http
                .delete(`${this.API}/${id}`)
                .pipe(catchError(manejarErrorHttp)),
        );
        this._historial.update((historial) =>
            historial.filter((item) => item.id !== id),
        );
    }
}
