import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { VeterinarioService } from '../../../../services/veterinario-service';
import { BusquedaService } from '../../../../services/busqueda-service';
import { ClienteConMascotas } from '../../../../interfaces/Veterinario';

@Component({
    selector: 'app-vet-clientes',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './clientes.html',
})
export class Clientes {
    private veterinarioService = inject(VeterinarioService);
    private busquedaService = inject(BusquedaService);

    readonly clientes = this.veterinarioService.clientes;
    readonly cargando = this.veterinarioService.cargando;
    readonly error = this.veterinarioService.error;

    readonly filtroLocal = signal('');

    // Seguimiento de clientes con sección de mascotas expandida (por defecto abiertos)
    readonly expandidos = signal<Record<number, boolean>>({});

    readonly totalMascotas = computed(() =>
        this.clientes().reduce((acc, c) => acc + (c.mascotas?.length || 0), 0),
    );

    readonly filtrados = computed(() => {
        const globalTerm = this.busquedaService.termino().toLowerCase().trim();
        const localTerm = this.filtroLocal().toLowerCase().trim();
        const termino = localTerm || globalTerm;

        if (!termino) {
            return this.clientes();
        }

        return this.clientes().filter((cliente) => {
            const nombresMascotas = (cliente.mascotas || [])
                .map((m) => `${m.nombre} ${m.especie} ${m.raza}`)
                .join(' ');

            const texto = [
                cliente.nombres,
                cliente.apellidos,
                cliente.dni,
                cliente.telefono,
                cliente.email,
                nombresMascotas,
            ]
                .join(' ')
                .toLowerCase();

            return texto.includes(termino);
        });
    });

    toggleExpandido(clienteId: number): void {
        this.expandidos.update((map) => ({
            ...map,
            [clienteId]: !this.estaExpandido(clienteId),
        }));
    }

    estaExpandido(clienteId: number): boolean {
        const val = this.expandidos()[clienteId];
        return val === undefined ? true : val;
    }

    iniciales(cliente: ClienteConMascotas): string {
        const n = cliente.nombres?.trim().charAt(0) ?? 'C';
        const a = cliente.apellidos?.trim().charAt(0) ?? '';
        return `${n}${a}`.toUpperCase();
    }

    generarLinkWhatsapp(cliente: ClienteConMascotas): string {
        const telLimpio = (cliente.telefono || '').replace(/\D/g, '');
        const mensaje = encodeURIComponent(
            `Hola ${cliente.nombres}, te saludamos cordialmente de la Clínica Veterinaria Pariona.`,
        );
        return `https://wa.me/51${telLimpio}?text=${mensaje}`;
    }
}
