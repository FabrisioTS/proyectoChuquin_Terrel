import { Injectable, computed, inject, signal } from '@angular/core';
import { AlmacenamientoService } from './almacenamiento-service';
import { Historial, HistorialFormulario } from '../interfaces/Historial';
import { fechaRelativa } from '../utils/fechas';

const CLAVE = 'portal_historial_v1';

@Injectable({
    providedIn: 'root',
})
export class HistorialService {
    private almacenamiento = inject(AlmacenamientoService);
    private _historial = signal<Historial[]>(this.almacenamiento.leer(CLAVE, this.semilla()));

    readonly historial = this._historial.asReadonly();
    readonly total = computed(() => this._historial().length);

    readonly recientes = computed(() =>
        [...this._historial()].sort((a, b) => b.fecha.localeCompare(a.fecha)),
    );

    crear(datos: HistorialFormulario, mascotaNombre: string): Historial {
        const registro: Historial = {
            ...datos,
            id: this.siguienteId(),
            mascotaNombre,
        };

        this._historial.update((historial) => [...historial, registro]);
        this.persistir();
        return registro;
    }

    eliminar(id: number): void {
        this._historial.update((historial) => historial.filter((item) => item.id !== id));
        this.persistir();
    }

    private siguienteId(): number {
        return this._historial().reduce((maximo, item) => Math.max(maximo, item.id), 0) + 1;
    }

    private persistir(): void {
        this.almacenamiento.guardar(CLAVE, this._historial());
    }

    private semilla(): Historial[] {
        return [
            {
                id: 1,
                mascotaId: 1,
                mascotaNombre: 'Simba',
                fecha: fechaRelativa(-18),
                doctor: 'Dra. Mariana Pariona',
                motivo: 'Consulta por sensibilidad en la piel',
                diagnostico: 'Dermatitis alérgica leve por contacto.',
                tratamiento: 'Shampoo medicado cada 3 días por 14 días.',
                receta: 'Clorexidina 2% shampoo. Prednisolona 5 mg por 5 días.',
            },
            {
                id: 2,
                mascotaId: 1,
                mascotaNombre: 'Simba',
                fecha: fechaRelativa(-60),
                doctor: 'Dra. Mariana Pariona',
                motivo: 'Control post-operatorio',
                diagnostico: 'Herida quirúrgica en correcta evolución.',
                tratamiento: 'Limpieza diaria y antibiótico por 7 días.',
                receta: 'Amoxicilina 250 mg cada 12 horas por 7 días.',
            },
            {
                id: 3,
                mascotaId: 2,
                mascotaNombre: 'Milo',
                fecha: fechaRelativa(-45),
                doctor: 'Dr. Alonso Requena',
                motivo: 'Chequeo general y desparasitación',
                diagnostico: 'Paciente sano, peso y constantes normales.',
                tratamiento: 'Desparasitación interna y externa mensual.',
                receta: 'NexGard Spectra 1 tableta mensual. Praziquantel según peso.',
            },
            {
                id: 4,
                mascotaId: 2,
                mascotaNombre: 'Milo',
                fecha: fechaRelativa(-120),
                doctor: 'Dra. Mariana Pariona',
                motivo: 'Revisión de vacunas',
                diagnostico: 'Esquema de vacunación incompleto.',
                tratamiento: 'Se reprograma triple felina.',
                receta: 'Triple felina al día siguiente de la consulta.',
            },
        ];
    }
}
