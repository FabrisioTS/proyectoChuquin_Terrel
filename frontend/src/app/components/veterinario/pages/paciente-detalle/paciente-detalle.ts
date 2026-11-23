import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { VeterinarioService } from '../../../../services/veterinario-service';
import { HistorialService } from '../../../../services/historial-service';
import { VacunasService } from '../../../../services/vacunas-service';
import { CitasService } from '../../../../services/citas-service';
import { EstadoCita } from '../../../../interfaces/Cita';
import { EstadoRegistroSanitario, Vacuna } from '../../../../interfaces/Vacuna';
import { formatearFecha, formatearHora } from '../../../../utils/fechas';

@Component({
    selector: 'app-vet-paciente-detalle',
    imports: [RouterLink],
    templateUrl: './paciente-detalle.html',
})
export class PacienteDetalle {
    private route = inject(ActivatedRoute);
    private veterinarioService = inject(VeterinarioService);
    private historialService = inject(HistorialService);
    private vacunasService = inject(VacunasService);
    private citasService = inject(CitasService);

    readonly mascotaId = Number(this.route.snapshot.paramMap.get('id'));

    readonly paciente = computed(
        () =>
            this.veterinarioService
                .pacientes()
                .find((paciente) => paciente.mascota.id === this.mascotaId) ?? null,
    );

    readonly historial = computed(() =>
        this.historialService
            .historial()
            .filter((registro) => registro.mascotaId === this.mascotaId)
            .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    );

    readonly vacunas = computed(() =>
        this.vacunasService
            .vacunas()
            .filter((vacuna) => vacuna.mascotaId === this.mascotaId)
            .sort((a, b) => b.fechaAplicacion.localeCompare(a.fechaAplicacion)),
    );

    readonly citas = computed(() =>
        this.citasService
            .citas()
            .filter((cita) => cita.mascotaId === this.mascotaId)
            .sort((a, b) =>
                `${b.fecha}${b.hora}`.localeCompare(`${a.fecha}${a.hora}`),
            ),
    );

    readonly formatearFecha = formatearFecha;
    readonly formatearHora = formatearHora;

    estadoVacuna(vacuna: Vacuna): EstadoRegistroSanitario {
        return this.vacunasService.estado(vacuna);
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

    claseVacuna(estado: EstadoRegistroSanitario): string {
        switch (estado) {
            case 'Vigente':
                return 'bg-emerald-50 text-emerald-700';
            case 'Próximo':
                return 'bg-amber-50 text-amber-700';
            default:
                return 'bg-rose-50 text-rose-700';
        }
    }

    iniciales(nombre: string): string {
        return (nombre.trim().charAt(0) || 'P').toUpperCase();
    }
}
