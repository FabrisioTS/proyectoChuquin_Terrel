import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AutenticacionService } from '../../../../services/autenticacion-service';
import { VeterinarioService } from '../../../../services/veterinario-service';
import { formatearFecha, formatearHora } from '../../../../utils/fechas';

@Component({
    selector: 'app-vet-panel',
    imports: [RouterLink],
    templateUrl: './panel.html',
})
export class Panel {
    private autenticacionService = inject(AutenticacionService);
    private veterinarioService = inject(VeterinarioService);

    readonly usuario = this.autenticacionService.usuarioActual;
    readonly resumen = this.veterinarioService.resumen;
    readonly agenda = this.veterinarioService.agenda;
    readonly historialReciente = this.veterinarioService.historialReciente;
    readonly cargando = this.veterinarioService.cargando;
    readonly error = this.veterinarioService.error;

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

    readonly nombre = computed(() => this.usuario()?.nombres ?? 'doctor(a)');

    readonly formatearFecha = formatearFecha;
    readonly formatearHora = formatearHora;

    async actualizar(): Promise<void> {
        await this.veterinarioService.cargarTodo();
    }
}
