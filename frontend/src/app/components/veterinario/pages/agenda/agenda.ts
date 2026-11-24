import { Component, computed, inject, signal } from '@angular/core';

import { CitasService } from '../../../../services/citas-service';
import { BusquedaService } from '../../../../services/busqueda-service';
import { Cita, EstadoCita } from '../../../../interfaces/Cita';
import { formatearFecha, formatearHora, hoyISO } from '../../../../utils/fechas';

type FiltroAgenda = 'hoy' | 'proximas' | 'todas';

@Component({
    selector: 'app-vet-agenda',
    templateUrl: './agenda.html',
})
export class Agenda {
    private citasService = inject(CitasService);
    private busquedaService = inject(BusquedaService);

    readonly hoy = hoyISO();
    readonly filtro = signal<FiltroAgenda>('proximas');
    readonly error = signal<string | null>(null);
    readonly procesando = signal<number | null>(null);

    readonly citas = computed(() => {
        let lista = this.citasService.citas();

        switch (this.filtro()) {
            case 'hoy':
                lista = lista.filter((cita) => cita.fecha === this.hoy);
                break;
            case 'proximas':
                lista = lista.filter(
                    (cita) =>
                        cita.fecha >= this.hoy &&
                        cita.estado !== 'Cancelada' &&
                        cita.estado !== 'Atendida',
                );
                break;
        }

        const termino = this.busquedaService.termino().toLowerCase().trim();

        if (termino) {
            lista = lista.filter((cita) =>
                `${cita.mascotaNombre} ${cita.motivo} ${cita.doctor} ${cita.estado}`
                    .toLowerCase()
                    .includes(termino),
            );
        }

        return [...lista].sort((a, b) =>
            `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`),
        );
    });

    cambiarFiltro(filtro: FiltroAgenda): void {
        this.filtro.set(filtro);
    }

    async confirmar(cita: Cita): Promise<void> {
        await this.ejecutar(cita.id, () => this.citasService.confirmar(cita.id));
    }

    async atender(cita: Cita): Promise<void> {
        await this.ejecutar(cita.id, () => this.citasService.marcarAtendida(cita.id));
    }

    async cancelar(cita: Cita): Promise<void> {
        try {
            const { default: Swal } = await import('sweetalert2');
            const resultado = await Swal.fire({
                icon: 'warning',
                title: '¿Cancelar esta cita?',
                text: `${cita.motivo} • ${formatearFecha(cita.fecha)}`,
                showCancelButton: true,
                confirmButtonText: 'Sí, cancelar',
                cancelButtonText: 'Volver',
                confirmButtonColor: '#E31E24',
            });

            if (!resultado.isConfirmed) {
                return;
            }
        } catch {
            // Sin modal, se cancela directamente.
        }

        await this.ejecutar(cita.id, () => this.citasService.cancelar(cita.id));
    }

    claseEstado(estado: EstadoCita): string {
        switch (estado) {
            case 'Confirmada':
                return 'bg-emerald-100 text-emerald-800';
            case 'Pendiente':
                return 'bg-amber-100 text-amber-800';
            case 'Cancelada':
                return 'bg-rose-100 text-rose-700';
            default:
                return 'bg-slate-200 text-slate-700';
        }
    }

    readonly formatearFecha = formatearFecha;
    readonly formatearHora = formatearHora;

    private async ejecutar(
        citaId: number,
        accion: () => Promise<void>,
    ): Promise<void> {
        this.procesando.set(citaId);
        this.error.set(null);

        try {
            await accion();
        } catch (error) {
            this.error.set((error as Error).message);
        } finally {
            this.procesando.set(null);
        }
    }
}
