import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AutenticacionService } from '../../../../services/autenticacion-service';
import { MascotasService } from '../../../../services/mascotas-service';
import { CitasService } from '../../../../services/citas-service';
import { VacunasService } from '../../../../services/vacunas-service';
import { HistorialService } from '../../../../services/historial-service';
import { Vacuna } from '../../../../interfaces/Vacuna';
import { formatearFecha, formatearHora } from '../../../../utils/fechas';

@Component({
    selector: 'app-inicio',
    imports: [RouterLink],
    templateUrl: './inicio.html',
})
export class Inicio {
    private autenticacionService = inject(AutenticacionService);
    private mascotasService = inject(MascotasService);
    private citasService = inject(CitasService);
    private vacunasService = inject(VacunasService);
    private historialService = inject(HistorialService);

    readonly usuario = this.autenticacionService.usuarioActual;
    readonly proximaCita = this.citasService.proxima;
    readonly totalMascotas = this.mascotasService.total;
    readonly nombresMascotas = this.mascotasService.nombres;
    readonly totalHistoriales = this.historialService.total;
    readonly vacunasVigentes = this.vacunasService.vigentes;
    readonly totalVacunas = this.vacunasService.total;
    readonly vencidas = this.vacunasService.vencidas;

    readonly porcentajeVacunas = computed(() => {
        const total = this.totalVacunas();
        return total === 0 ? 0 : Math.round((this.vacunasVigentes() / total) * 100);
    });

    readonly recordatorios = computed(() =>
        [...this.vacunasService.proximas(), ...this.vacunasService.vacunas().filter((vacuna) => this.vacunasService.estado(vacuna) === 'Vencido')]
            .sort((a, b) => a.proximaDosis.localeCompare(b.proximaDosis))
            .slice(0, 4),
    );

    readonly historialReciente = computed(() => this.historialService.recientes().slice(0, 3));

    readonly saludo = computed(() => {
        const hora = new Date().getHours();

        if (hora < 12) {
            return 'Buenos días';
        }

        if (hora < 19) {
            return 'Buenas tardes';
        }

        return 'Buenas noches';
    });

    readonly formatearFecha = formatearFecha;
    readonly formatearHora = formatearHora;
    readonly estadoVacuna = (vacuna: Vacuna) => this.vacunasService.estado(vacuna);
}
