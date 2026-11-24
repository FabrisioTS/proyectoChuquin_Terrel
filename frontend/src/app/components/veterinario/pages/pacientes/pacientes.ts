import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { VeterinarioService } from '../../../../services/veterinario-service';
import { BusquedaService } from '../../../../services/busqueda-service';
import { Dueno, Paciente } from '../../../../interfaces/Veterinario';

@Component({
    selector: 'app-vet-pacientes',
    imports: [RouterLink],
    templateUrl: './pacientes.html',
})
export class Pacientes {
    private veterinarioService = inject(VeterinarioService);
    private busquedaService = inject(BusquedaService);

    readonly pacientes = this.veterinarioService.pacientes;
    readonly cargando = this.veterinarioService.cargando;
    readonly error = this.veterinarioService.error;

    readonly filtrados = computed(() => {
        const termino = this.busquedaService.termino().toLowerCase().trim();

        if (!termino) {
            return this.pacientes();
        }

        return this.pacientes().filter(({ mascota, dueno }) => {
            const texto = [
                mascota.nombre,
                mascota.especie,
                mascota.raza,
                mascota.microchip,
                mascota.diagnostico,
                dueno?.nombres ?? '',
                dueno?.apellidos ?? '',
                dueno?.dni ?? '',
            ]
                .join(' ')
                .toLowerCase();

            return texto.includes(termino);
        });
    });

    nombreDueno(dueno: Dueno | null): string {
        return dueno ? `${dueno.nombres} ${dueno.apellidos}`.trim() : 'Sin dueño asignado';
    }

    iniciales(paciente: Paciente): string {
        const nombre = paciente.mascota.nombre.trim().charAt(0) || 'P';
        return nombre.toUpperCase();
    }
}
