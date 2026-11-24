import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { manejarErrorHttp } from '../utils/error-http';
import { Cita, EstadoCita } from '../interfaces/Cita';
import { Historial } from '../interfaces/Historial';
import { EspecieMascota, Mascota } from '../interfaces/Mascota';
import {
    ClienteConMascotas,
    CodigoTemporalInfo,
    Dueno,
    Paciente,
    ResumenVeterinario,
} from '../interfaces/Veterinario';

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

interface DuenoApi {
    id: number;
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string;
    dni: string;
}

interface ClienteApi {
    id: number;
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string;
    dni: string;
    mascotas: MascotaApi[];
}

interface PacienteApi {
    mascota: MascotaApi;
    dueno: DuenoApi | null;
}

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

interface ResumenApi {
    pacientes: number;
    citas_hoy: number;
    vacunas_proximas: number;
    pagos_pendientes: number;
    clientes?: number;
    total_ventas?: number;
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

function mapearDueno(api: DuenoApi | null): Dueno | null {
    return api ? { ...api } : null;
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
export class VeterinarioService {
    private http = inject(HttpClient);
    private readonly API = `${environment.apiUrl}/veterinario`;

    private _resumen = signal<ResumenVeterinario | null>(null);
    private _pacientes = signal<Paciente[]>([]);
    private _clientes = signal<ClienteConMascotas[]>([]);
    private _agenda = signal<Cita[]>([]);
    private _historialReciente = signal<Historial[]>([]);

    readonly cargando = signal(false);
    readonly error = signal<string | null>(null);

    readonly resumen = this._resumen.asReadonly();
    readonly pacientes = this._pacientes.asReadonly();
    readonly clientes = this._clientes.asReadonly();
    readonly agenda = this._agenda.asReadonly();
    readonly historialReciente = this._historialReciente.asReadonly();

    /** Carga todas las vistas agregadas del portal veterinario. */
    async cargarTodo(): Promise<void> {
        this.cargando.set(true);
        this.error.set(null);

        try {
            await Promise.all([
                this.cargarResumen(),
                this.cargarPacientes(),
                this.cargarClientes(),
                this.cargarAgenda(),
                this.cargarHistorialReciente(),
            ]);
        } catch (error) {
            this.error.set((error as Error).message);
        } finally {
            this.cargando.set(false);
        }
    }

    async cargarResumen(): Promise<void> {
        try {
            const api = await firstValueFrom(
                this.http
                    .get<ResumenApi>(`${this.API}/resumen`)
                    .pipe(catchError(manejarErrorHttp)),
            );
            this._resumen.set({
                pacientes: api.pacientes,
                citasHoy: api.citas_hoy,
                vacunasProximas: api.vacunas_proximas,
                pagosPendientes: api.pagos_pendientes,
                clientes: api.clientes ?? 0,
                totalVentas: api.total_ventas ?? 0,
            });
        } catch (error) {
            this.error.set((error as Error).message);
        }
    }

    async cargarPacientes(): Promise<void> {
        try {
            const datos = await firstValueFrom(
                this.http
                    .get<PacienteApi[]>(`${this.API}/pacientes`)
                    .pipe(catchError(manejarErrorHttp)),
            );
            this._pacientes.set(
                datos.map((item) => ({
                    mascota: mapearMascota(item.mascota),
                    dueno: mapearDueno(item.dueno),
                })),
            );
        } catch (error) {
            this.error.set((error as Error).message);
        }
    }

    async cargarAgenda(fecha?: string): Promise<void> {
        try {
            const datos = await firstValueFrom(
                this.http
                    .get<CitaApi[]>(`${this.API}/agenda`, {
                        params: fecha ? { fecha } : {},
                    })
                    .pipe(catchError(manejarErrorHttp)),
            );
            this._agenda.set(datos.map(mapearCita));
        } catch (error) {
            this.error.set((error as Error).message);
        }
    }

    async cargarHistorialReciente(): Promise<void> {
        try {
            const datos = await firstValueFrom(
                this.http
                    .get<HistorialApi[]>(`${this.API}/historial-reciente`)
                    .pipe(catchError(manejarErrorHttp)),
            );
            this._historialReciente.set(datos.map(mapearHistorial));
        } catch (error) {
            this.error.set((error as Error).message);
        }
    }

    obtenerPaciente(mascotaId: number): Paciente | undefined {
        return this._pacientes().find(
            (paciente) => paciente.mascota.id === mascotaId,
        );
    }

    async cargarClientes(): Promise<void> {
        try {
            const datos = await firstValueFrom(
                this.http
                    .get<ClienteApi[]>(`${this.API}/clientes`)
                    .pipe(catchError(manejarErrorHttp)),
            );
            this._clientes.set(
                datos.map((item) => ({
                    id: item.id,
                    nombres: item.nombres,
                    apellidos: item.apellidos,
                    email: item.email,
                    telefono: item.telefono,
                    dni: item.dni,
                    mascotas: (item.mascotas || []).map(mapearMascota),
                })),
            );
        } catch (error) {
            this.error.set((error as Error).message);
        }
    }

    async obtenerCodigoTemporal(): Promise<CodigoTemporalInfo> {
        return firstValueFrom(
            this.http
                .get<CodigoTemporalInfo>(
                    `${environment.apiUrl}/auth/admin/codigo-veterinario`,
                )
                .pipe(catchError(manejarErrorHttp)),
        );
    }

    async regenerarCodigoTemporal(): Promise<CodigoTemporalInfo> {
        return firstValueFrom(
            this.http
                .post<CodigoTemporalInfo>(
                    `${environment.apiUrl}/auth/admin/codigo-veterinario/regenerar`,
                    {},
                )
                .pipe(catchError(manejarErrorHttp)),
        );
    }
}
