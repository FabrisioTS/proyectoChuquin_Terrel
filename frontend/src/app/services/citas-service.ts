import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { manejarErrorHttp } from '../utils/error-http';
import { Cita, CitaFormulario, EstadoCita } from '../interfaces/Cita';
import { diasHasta } from '../utils/fechas';

interface CitaApi {
    id: number;
    usuario_id: number | null;
    mascota_id: number;
    veterinario_id: number | null;
    mascota_nombre: string;
    motivo: string;
    doctor: string | null;
    especialidad: string | null;
    fecha: string;
    hora: string;
    sede: string | null;
    direccion: string | null;
    estado: string;
    indicaciones: string | null;
}

function mapearCita(api: CitaApi): Cita {
    return {
        id: api.id,
        mascotaId: api.mascota_id,
        mascotaNombre: api.mascota_nombre,
        motivo: api.motivo,
        doctor: api.doctor ?? '',
        especialidad: api.especialidad ?? '',
        fecha: api.fecha,
        hora: (api.hora ?? '').slice(0, 5),
        sede: api.sede ?? '',
        direccion: api.direccion ?? '',
        estado: api.estado as EstadoCita,
        indicaciones: api.indicaciones ?? '',
    };
}

@Injectable({
    providedIn: 'root',
})
export class CitasService {
    private http = inject(HttpClient);
    private readonly API = `${environment.apiUrl}/citas`;

    private _citas = signal<Cita[]>([]);
    readonly cargando = signal(false);
    readonly error = signal<string | null>(null);

    readonly citas = this._citas.asReadonly();

    readonly proximas = computed(() =>
        this._citas()
            .filter(
                (cita) =>
                    (cita.estado === 'Confirmada' || cita.estado === 'Pendiente') &&
                    diasHasta(cita.fecha) >= 0,
            )
            .sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`)),
    );

    readonly proxima = computed(() => this.proximas()[0] ?? null);

    readonly pasadas = computed(() =>
        this._citas()
            .filter((cita) => diasHasta(cita.fecha) < 0 || cita.estado === 'Atendida')
            .sort((a, b) => `${b.fecha}${b.hora}`.localeCompare(`${a.fecha}${a.hora}`)),
    );

    readonly pendientes = computed(
        () => this._citas().filter((cita) => cita.estado === 'Pendiente').length,
    );

    readonly atendidas = computed(
        () => this._citas().filter((cita) => cita.estado === 'Atendida').length,
    );

    async cargar(): Promise<void> {
        this.cargando.set(true);
        this.error.set(null);

        try {
            const datos = await firstValueFrom(
                this.http
                    .get<CitaApi[]>(`${this.API}/`)
                    .pipe(catchError(manejarErrorHttp)),
            );
            this._citas.set(datos.map(mapearCita));
        } catch (error) {
            this.error.set((error as Error).message);
        } finally {
            this.cargando.set(false);
        }
    }

    async crear(datos: CitaFormulario, _mascotaNombre: string): Promise<Cita> {
        const api = await firstValueFrom(
            this.http
                .post<CitaApi>(`${this.API}/`, {
                    mascota_id: datos.mascotaId,
                    motivo: datos.motivo,
                    doctor: datos.doctor || null,
                    fecha: datos.fecha,
                    hora: datos.hora,
                })
                .pipe(catchError(manejarErrorHttp)),
        );
        const cita = mapearCita(api);
        this._citas.update((citas) => [...citas, cita]);
        return cita;
    }

    async confirmar(id: number): Promise<void> {
        await this.actualizarEstado(id, 'Confirmada');
    }

    async cancelar(id: number): Promise<void> {
        await this.actualizarEstado(id, 'Cancelada');
    }

    async marcarAtendida(id: number): Promise<void> {
        await this.actualizarEstado(id, 'Atendida');
    }

    async actualizarEstado(id: number, estado: EstadoCita): Promise<void> {
        const api = await firstValueFrom(
            this.http
                .patch<CitaApi>(`${this.API}/${id}/estado`, { estado })
                .pipe(catchError(manejarErrorHttp)),
        );
        this.reemplazar(mapearCita(api));
    }

    async reprogramar(id: number, fecha: string, hora: string): Promise<void> {
        const cita = this.obtener(id);

        if (!cita) {
            return;
        }

        const api = await firstValueFrom(
            this.http
                .put<CitaApi>(`${this.API}/${id}`, {
                    motivo: cita.motivo,
                    doctor: cita.doctor || null,
                    fecha,
                    hora,
                })
                .pipe(catchError(manejarErrorHttp)),
        );
        this.reemplazar(mapearCita(api));
    }

    async eliminar(id: number): Promise<void> {
        await firstValueFrom(
            this.http
                .delete(`${this.API}/${id}`)
                .pipe(catchError(manejarErrorHttp)),
        );
        this._citas.update((citas) => citas.filter((cita) => cita.id !== id));
    }

    obtener(id: number): Cita | undefined {
        return this._citas().find((cita) => cita.id === id);
    }

    private reemplazar(cita: Cita): void {
        this._citas.update((citas) =>
            citas.map((item) => (item.id === cita.id ? cita : item)),
        );
    }
}
