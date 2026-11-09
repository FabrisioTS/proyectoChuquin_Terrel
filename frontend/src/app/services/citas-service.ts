import { Injectable, computed, inject, signal } from '@angular/core';
import { AlmacenamientoService } from './almacenamiento-service';
import { Cita, CitaFormulario, EstadoCita } from '../interfaces/Cita';
import { diasHasta, fechaRelativa } from '../utils/fechas';

const CLAVE = 'portal_citas_v1';

@Injectable({
    providedIn: 'root',
})
export class CitasService {
    private almacenamiento = inject(AlmacenamientoService);
    private _citas = signal<Cita[]>(this.almacenamiento.leer(CLAVE, this.semilla()));

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

    crear(datos: CitaFormulario, mascotaNombre: string): Cita {
        const cita: Cita = {
            ...datos,
            id: this.siguienteId(),
            mascotaNombre,
            especialidad: 'Medicina general',
            sede: 'Sede Central San Borja',
            direccion: 'Av. Los Sauces 482, Lima',
            estado: 'Pendiente',
            indicaciones: 'Llegar 10 minutos antes con la cartilla de vacunación de la mascota.',
        };

        this._citas.update((citas) => [...citas, cita]);
        this.persistir();
        return cita;
    }

    confirmar(id: number): void {
        this.cambiarEstado(id, 'Confirmada');
    }

    cancelar(id: number): void {
        this.cambiarEstado(id, 'Cancelada');
    }

    reprogramar(id: number, fecha: string, hora: string): void {
        this._citas.update((citas) =>
            citas.map((cita) =>
                cita.id === id ? { ...cita, fecha, hora, estado: 'Pendiente' } : cita,
            ),
        );
        this.persistir();
    }

    eliminar(id: number): void {
        this._citas.update((citas) => citas.filter((cita) => cita.id !== id));
        this.persistir();
    }

    obtener(id: number): Cita | undefined {
        return this._citas().find((cita) => cita.id === id);
    }

    private cambiarEstado(id: number, estado: EstadoCita): void {
        this._citas.update((citas) =>
            citas.map((cita) => (cita.id === id ? { ...cita, estado } : cita)),
        );
        this.persistir();
    }

    private siguienteId(): number {
        return this._citas().reduce((maximo, cita) => Math.max(maximo, cita.id), 0) + 1;
    }

    private persistir(): void {
        this.almacenamiento.guardar(CLAVE, this._citas());
    }

    private semilla(): Cita[] {
        return [
            {
                id: 1,
                mascotaId: 1,
                mascotaNombre: 'Simba',
                motivo: 'Control post-operatorio y chequeo de rutina',
                doctor: 'Dra. Mariana Pariona',
                especialidad: 'Cirugía y medicina general',
                fecha: fechaRelativa(1),
                hora: '10:30',
                sede: 'Sede Central San Borja',
                direccion: 'Av. Los Sauces 482, Lima',
                estado: 'Confirmada',
                indicaciones:
                    'Mantener ayuno de sólidos de mínimo 4 horas previas a la consulta para ecografía de control. Traer cartilla física y arnés seguro.',
            },
            {
                id: 2,
                mascotaId: 2,
                mascotaNombre: 'Milo',
                motivo: 'Vacunación anual y control dermatológico',
                doctor: 'Dr. Alonso Requena',
                especialidad: 'Dermatología felina',
                fecha: fechaRelativa(9),
                hora: '09:00',
                sede: 'Sede Central San Borja',
                direccion: 'Av. Los Sauces 482, Lima',
                estado: 'Pendiente',
                indicaciones: 'No bañar a la mascota 48 horas antes de la aplicación de la vacuna.',
            },
            {
                id: 3,
                mascotaId: 1,
                mascotaNombre: 'Simba',
                motivo: 'Consulta por sensibilidad en la piel',
                doctor: 'Dra. Mariana Pariona',
                especialidad: 'Dermatología',
                fecha: fechaRelativa(-18),
                hora: '16:00',
                sede: 'Sede Central San Borja',
                direccion: 'Av. Los Sauces 482, Lima',
                estado: 'Atendida',
                indicaciones: 'Se indicó shampoo medicado por 14 días.',
            },
            {
                id: 4,
                mascotaId: 2,
                mascotaNombre: 'Milo',
                motivo: 'Chequeo general y desparasitación',
                doctor: 'Dr. Alonso Requena',
                especialidad: 'Medicina preventiva',
                fecha: fechaRelativa(-45),
                hora: '11:15',
                sede: 'Sede Central San Borja',
                direccion: 'Av. Los Sauces 482, Lima',
                estado: 'Atendida',
                indicaciones: 'Peso estable. Continuar con antipulgas mensual.',
            },
        ];
    }
}
