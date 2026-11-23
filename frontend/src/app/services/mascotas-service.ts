import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { manejarErrorHttp } from '../utils/error-http';
import {
    EspecieMascota,
    Mascota,
    MascotaFormulario,
} from '../interfaces/Mascota';

interface MascotaApi {
    id: number;
    usuario_id: number | null;
    nombre: string;
    especie: string;
    raza: string | null;
    edad: number | null;
    sexo: string | null;
    peso: number | null;
    microchip: string | null;
    diagnostico: string | null;
    cobertura: string | null;
    foto: string | null;
    activo: boolean;
}

function mapearMascota(api: MascotaApi): Mascota {
    return {
        id: api.id,
        nombre: api.nombre,
        especie: api.especie as EspecieMascota,
        raza: api.raza ?? '',
        edad: api.edad ?? 0,
        sexo: api.sexo ?? '',
        peso: api.peso ?? 0,
        microchip: api.microchip ?? '',
        diagnostico: api.diagnostico ?? '',
        cobertura: api.cobertura ?? '',
        foto: api.foto ?? '',
    };
}

@Injectable({
    providedIn: 'root',
})
export class MascotasService {
    private http = inject(HttpClient);
    private readonly API = `${environment.apiUrl}/mascotas`;

    private _mascotas = signal<Mascota[]>([]);
    readonly cargando = signal(false);
    readonly error = signal<string | null>(null);

    readonly mascotas = this._mascotas.asReadonly();
    readonly total = computed(() => this._mascotas().length);
    readonly nombres = computed(() =>
        this._mascotas().map((mascota) => mascota.nombre).join(' y '),
    );

    async cargar(): Promise<void> {
        this.cargando.set(true);
        this.error.set(null);

        try {
            const datos = await firstValueFrom(
                this.http
                    .get<MascotaApi[]>(`${this.API}/`)
                    .pipe(catchError(manejarErrorHttp)),
            );
            this._mascotas.set(datos.map(mapearMascota));
        } catch (error) {
            this.error.set((error as Error).message);
        } finally {
            this.cargando.set(false);
        }
    }

    async crear(datos: MascotaFormulario): Promise<Mascota> {
        const api = await firstValueFrom(
            this.http
                .post<MascotaApi>(`${this.API}/`, datos)
                .pipe(catchError(manejarErrorHttp)),
        );
        const mascota = mapearMascota(api);
        this._mascotas.update((mascotas) => [...mascotas, mascota]);
        return mascota;
    }

    async actualizar(id: number, datos: MascotaFormulario): Promise<void> {
        const api = await firstValueFrom(
            this.http
                .put<MascotaApi>(`${this.API}/${id}`, datos)
                .pipe(catchError(manejarErrorHttp)),
        );
        const actualizada = mapearMascota(api);
        this._mascotas.update((mascotas) =>
            mascotas.map((mascota) => (mascota.id === id ? actualizada : mascota)),
        );
    }

    async eliminar(id: number): Promise<void> {
        await firstValueFrom(
            this.http
                .delete(`${this.API}/${id}`)
                .pipe(catchError(manejarErrorHttp)),
        );
        this._mascotas.update((mascotas) =>
            mascotas.filter((mascota) => mascota.id !== id),
        );
    }

    obtener(id: number): Mascota | undefined {
        return this._mascotas().find((mascota) => mascota.id === id);
    }
}
