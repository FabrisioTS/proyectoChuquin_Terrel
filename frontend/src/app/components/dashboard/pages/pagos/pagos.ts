import { Component, computed, inject, signal } from '@angular/core';

import { PagosService } from '../../../../services/pagos-service';
import { BusquedaService } from '../../../../services/busqueda-service';
import { EstadoPago, Pago } from '../../../../interfaces/Pago';
import { formatearFecha, formatearMoneda } from '../../../../utils/fechas';

type FiltroPago = 'Todos' | EstadoPago;

@Component({
    selector: 'app-pagos',
    templateUrl: './pagos.html',
})
export class Pagos {
    private pagosService = inject(PagosService);
    private busquedaService = inject(BusquedaService);

    readonly totalPagado = this.pagosService.totalPagado;
    readonly totalPendiente = this.pagosService.totalPendiente;
    readonly cantidad = computed(() => this.pagosService.pagos().length);
    readonly filtro = signal<FiltroPago>('Todos');

    readonly pagos = computed(() => {
        const estado = this.filtro();
        const termino = this.busquedaService.termino().toLowerCase().trim();

        return this.pagosService
            .pagos()
            .filter((pago) => estado === 'Todos' || pago.estado === estado)
            .filter((pago) => {
                if (!termino) {
                    return true;
                }

                return `${pago.codigo} ${pago.concepto} ${pago.metodo} ${pago.mascotaNombre ?? ''}`
                    .toLowerCase()
                    .includes(termino);
            })
            .sort((a, b) => b.fecha.localeCompare(a.fecha));
    });

    cambiarFiltro(evento: Event): void {
        this.filtro.set((evento.target as HTMLSelectElement).value as FiltroPago);
    }

    async verComprobante(pago: Pago): Promise<void> {
        try {
            const { default: Swal } = await import('sweetalert2');
            await Swal.fire({
                title: `Comprobante ${pago.codigo}`,
                html: `
                    <div style="text-align:left;font-size:13px;line-height:1.7;color:#334155">
                        <p><strong>Concepto:</strong> ${pago.concepto}</p>
                        <p><strong>Fecha:</strong> ${formatearFecha(pago.fecha)}</p>
                        <p><strong>Método:</strong> ${pago.metodo}</p>
                        <p><strong>Estado:</strong> ${pago.estado}</p>
                        <p style="font-size:20px;font-weight:800;color:#c2410c;margin-top:12px">
                            Total: ${formatearMoneda(pago.monto)}
                        </p>
                    </div>
                `,
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#c2410c',
            });
        } catch {
            // Sin modal no se muestra el detalle.
        }
    }

    descargar(pago: Pago): void {
        const contenido = [
            'CLÍNICA VETERINARIA PARIONA',
            'RUC: 20512345678',
            'Av. Los Sauces 482, San Borja - Lima',
            '----------------------------------------',
            `COMPROBANTE: ${pago.codigo}`,
            `FECHA: ${formatearFecha(pago.fecha)}`,
            `CONCEPTO: ${pago.concepto}`,
            `PACIENTE: ${pago.mascotaNombre ?? 'No aplica'}`,
            `MÉTODO: ${pago.metodo}`,
            `ESTADO: ${pago.estado}`,
            '----------------------------------------',
            `TOTAL: ${formatearMoneda(pago.monto)}`,
            '',
            'Gracias por confiar en nosotros.',
        ].join('\n');

        const blob = new Blob([contenido], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const enlace = document.createElement('a');
        enlace.href = url;
        enlace.download = `${pago.codigo}.txt`;
        enlace.click();
        URL.revokeObjectURL(url);
    }

    async marcarPagado(pago: Pago): Promise<void> {
        try {
            await this.pagosService.marcarPagado(pago.id);
        } catch (error) {
            try {
                const { default: Swal } = await import('sweetalert2');
                await Swal.fire({
                    icon: 'error',
                    title: 'No se pudo registrar el pago',
                    text: (error as Error).message,
                    confirmButtonColor: '#c2410c',
                });
            } catch {
                // Sin modal no se puede informar el error.
            }
        }
    }

    claseEstado(estado: EstadoPago): string {
        switch (estado) {
            case 'Pagado':
                return 'bg-emerald-50 text-emerald-700';
            case 'Pendiente':
                return 'bg-amber-50 text-amber-700';
            default:
                return 'bg-rose-50 text-rose-700';
        }
    }

    readonly formatearFecha = formatearFecha;
    readonly formatearMoneda = formatearMoneda;
}
