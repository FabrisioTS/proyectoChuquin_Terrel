import { Injectable, computed, inject, signal } from '@angular/core';
import { AlmacenamientoService } from './almacenamiento-service';
import {
    EstadoRegistroSanitario,
    Vacuna,
    VacunaFormulario,
} from '../interfaces/Vacuna';
import { diasHasta, fechaRelativa } from '../utils/fechas';

const CLAVE = 'portal_vacunas_v1';

@Injectable({
    providedIn: 'root',
})
export class VacunasService {
    private almacenamiento = inject(AlmacenamientoService);
    private _vacunas = signal<Vacuna[]>(this.almacenamiento.leer(CLAVE, this.semilla()));

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
        const dias = diasHasta(vacuna.proximaDosis);

        if (dias < 0) {
            return 'Vencido';
        }

        if (dias <= 30) {
            return 'Próximo';
        }

        return 'Vigente';
    }

    crear(datos: VacunaFormulario, mascotaNombre: string): Vacuna {
        const vacuna: Vacuna = {
            ...datos,
            id: this.siguienteId(),
            mascotaNombre,
        };

        this._vacunas.update((vacunas) => [...vacunas, vacuna]);
        this.persistir();
        return vacuna;
    }

    eliminar(id: number): void {
        this._vacunas.update((vacunas) => vacunas.filter((vacuna) => vacuna.id !== id));
        this.persistir();
    }

    private siguienteId(): number {
        return this._vacunas().reduce((maximo, vacuna) => Math.max(maximo, vacuna.id), 0) + 1;
    }

    private persistir(): void {
        this.almacenamiento.guardar(CLAVE, this._vacunas());
    }

    private semilla(): Vacuna[] {
        return [
            {
                id: 1,
                mascotaId: 1,
                mascotaNombre: 'Simba',
                nombre: 'Vacuna Séxtuple Canina',
                tipo: 'Vacuna',
                fechaAplicacion: fechaRelativa(-30),
                proximaDosis: fechaRelativa(335),
                lote: '#VX-994',
                observaciones: 'Aplicada sin reacciones adversas.',
            },
            {
                id: 2,
                mascotaId: 2,
                mascotaNombre: 'Milo',
                nombre: 'Desparasitación NexGard',
                tipo: 'Desparasitación',
                fechaAplicacion: fechaRelativa(-24),
                proximaDosis: fechaRelativa(6),
                lote: '#NG-2210',
                observaciones: 'Control antiparasitario interno y externo.',
            },
            {
                id: 3,
                mascotaId: 1,
                mascotaNombre: 'Simba',
                nombre: 'Antirrábica Anual',
                tipo: 'Vacuna',
                fechaAplicacion: fechaRelativa(-90),
                proximaDosis: fechaRelativa(275),
                lote: '#AR-5521',
                observaciones: 'Certificado oficial emitido por MINSA.',
            },
            {
                id: 4,
                mascotaId: 2,
                mascotaNombre: 'Milo',
                nombre: 'Triple Felina',
                tipo: 'Vacuna',
                fechaAplicacion: fechaRelativa(-400),
                proximaDosis: fechaRelativa(-35),
                lote: '#TF-1180',
                observaciones: 'Requiere refuerzo inmediato.',
            },
            {
                id: 5,
                mascotaId: 2,
                mascotaNombre: 'Milo',
                nombre: 'Tratamiento dermatológico',
                tipo: 'Tratamiento',
                fechaAplicacion: fechaRelativa(-10),
                proximaDosis: fechaRelativa(20),
                lote: '#DM-7781',
                observaciones: 'Aplicar shampoo medicado cada 3 días.',
            },
        ];
    }
}
