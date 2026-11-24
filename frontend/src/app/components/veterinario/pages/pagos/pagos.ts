import { Component, computed, inject, signal } from '@angular/core';

import { PagosService } from '../../../../services/pagos-service';
import { BusquedaService } from '../../../../services/busqueda-service';
import { EstadoPago, Pago } from '../../../../interfaces/Pago';
import { formatearFecha, formatearMoneda } from '../../../../utils/fechas';

type FiltroPago = 'Todos' | EstadoPago;

@Component({
    selector: 'app-vet-pagos',
    templateUrl: './pagos.html',
})
export class Pagos {
    private pagosService = inject(PagosService);
    private busquedaService = inject(BusquedaService);

    readonly totalPagado = this.pagosService.totalPagado;
    readonly totalPendiente = this.pagosService.totalPendiente;
    readonly cantidad = computed(() => this.pagosService.pagos().length);
    readonly filtro = signal<FiltroPago>('Todos');

    readonly formatearFecha = formatearFecha;
    readonly formatearMoneda = formatearMoneda;

    // Estado del modal de nuevo cobro / venta
    readonly modalAbierto = signal(false);
    readonly concepto = signal('');
    readonly monto = signal<number | null>(null);
    readonly metodo = signal('Efectivo');
    readonly mascotaNombre = signal('');
    readonly estado = signal<'Pagado' | 'Pendiente'>('Pagado');
    readonly guardando = signal(false);
    readonly errorModal = signal<string | null>(null);

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

    abrirModal(): void {
        this.concepto.set('');
        this.monto.set(null);
        this.metodo.set('Efectivo');
        this.mascotaNombre.set('');
        this.estado.set('Pagado');
        this.errorModal.set(null);
        this.modalAbierto.set(true);
    }

    cerrarModal(): void {
        this.modalAbierto.set(false);
    }

    async guardarCobro(evento: Event): Promise<void> {
        evento.preventDefault();
        const c = this.concepto().trim();
        const m = Number(this.monto());

        if (!c) {
            this.errorModal.set('El concepto es obligatorio (ej. Consulta general, Antipulgas, Alimento).');
            return;
        }

        if (!m || m <= 0) {
            this.errorModal.set('Ingresa un monto válido mayor a 0.');
            return;
        }

        this.errorModal.set(null);
        this.guardando.set(true);

        try {
            await this.pagosService.registrarCobroDirecto({
                concepto: c,
                monto: m,
                metodo: this.metodo(),
                mascota_nombre: this.mascotaNombre().trim() || undefined,
                estado: this.estado(),
            });

            this.modalAbierto.set(false);

            try {
                const { default: Swal } = await import('sweetalert2');
                await Swal.fire({
                    icon: 'success',
                    title: 'Cobro registrado exitosamente',
                    text: `Se ha generado el comprobante por ${formatearMoneda(m)}.`,
                    timer: 2000,
                    showConfirmButton: false,
                });
            } catch {
                // Notificación silenciosa
            }
        } catch (error) {
            this.errorModal.set((error as Error).message || 'Error al registrar el cobro.');
        } finally {
            this.guardando.set(false);
        }
    }

    async marcarComoPagado(pago: Pago): Promise<void> {
        try {
            await this.pagosService.marcarPagado(pago.id);
            try {
                const { default: Swal } = await import('sweetalert2');
                await Swal.fire({
                    icon: 'success',
                    title: 'Comprobante regularizado',
                    text: `El pago ${pago.codigo} ha sido marcado como Pagado.`,
                    timer: 1800,
                    showConfirmButton: false,
                });
            } catch {
                // Notificación opcional
            }
        } catch (error) {
            // Silencioso
        }
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
                        <p><strong>Paciente:</strong> ${pago.mascotaNombre || 'No especificado'}</p>
                        <p><strong>Método:</strong> ${pago.metodo}</p>
                        <p><strong>Estado:</strong> ${pago.estado}</p>
                        <p style="font-size:20px;font-weight:800;color:#0f766e;margin-top:12px">
                            Total: ${formatearMoneda(pago.monto)}
                        </p>
                    </div>
                `,
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#0f766e',
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

    claseEstado(estado: EstadoPago): string {
        switch (estado) {
            case 'Pagado':
                return 'bg-emerald-50 text-emerald-700';
            case 'Pendiente':
                return 'bg-amber-50 text-amber-700';
            case 'Vencido':
                return 'bg-rose-50 text-rose-700';
        }
    }
}
