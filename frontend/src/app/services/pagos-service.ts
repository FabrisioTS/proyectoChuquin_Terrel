import { Injectable, computed, inject, signal } from '@angular/core';
import { AlmacenamientoService } from './almacenamiento-service';
import { Pago } from '../interfaces/Pago';
import { fechaRelativa } from '../utils/fechas';

const CLAVE = 'portal_pagos_v1';

@Injectable({
    providedIn: 'root',
})
export class PagosService {
    private almacenamiento = inject(AlmacenamientoService);
    private _pagos = signal<Pago[]>(this.almacenamiento.leer(CLAVE, this.semilla()));

    readonly pagos = this._pagos.asReadonly();
    readonly pendientes = computed(() =>
        this._pagos().filter((pago) => pago.estado !== 'Pagado'),
    );
    readonly totalPagado = computed(() =>
        this._pagos()
            .filter((pago) => pago.estado === 'Pagado')
            .reduce((total, pago) => total + pago.monto, 0),
    );
    readonly totalPendiente = computed(() =>
        this._pagos()
            .filter((pago) => pago.estado !== 'Pagado')
            .reduce((total, pago) => total + pago.monto, 0),
    );

    registrar(
        concepto: string,
        monto: number,
        mascotaNombre?: string,
        metodo = 'Tarjeta',
        estado: Pago['estado'] = 'Pagado',
    ): Pago {
        const id = this._pagos().reduce((maximo, pago) => Math.max(maximo, pago.id), 0) + 1;
        const pago: Pago = {
            id,
            codigo: `PAG-${id.toString().padStart(4, '0')}`,
            concepto,
            fecha: fechaRelativa(0),
            monto,
            metodo,
            estado,
            mascotaNombre,
        };

        this._pagos.update((pagos) => [pago, ...pagos]);
        this.persistir();
        return pago;
    }

    marcarPagado(id: number): void {
        this._pagos.update((pagos) =>
            pagos.map((pago) => (pago.id === id ? { ...pago, estado: 'Pagado' } : pago)),
        );
        this.persistir();
    }

    private persistir(): void {
        this.almacenamiento.guardar(CLAVE, this._pagos());
    }

    private semilla(): Pago[] {
        return [
            {
                id: 1,
                codigo: 'PAG-0001',
                concepto: 'Consulta dermatológica - Simba',
                fecha: fechaRelativa(-18),
                monto: 120,
                metodo: 'Tarjeta',
                estado: 'Pagado',
                mascotaNombre: 'Simba',
            },
            {
                id: 2,
                codigo: 'PAG-0002',
                concepto: 'Vacuna Séxtuple Canina - Simba',
                fecha: fechaRelativa(-30),
                monto: 85,
                metodo: 'Efectivo',
                estado: 'Pagado',
                mascotaNombre: 'Simba',
            },
            {
                id: 3,
                codigo: 'PAG-0003',
                concepto: 'Chequeo general y desparasitación - Milo',
                fecha: fechaRelativa(-45),
                monto: 95,
                metodo: 'Yape',
                estado: 'Pagado',
                mascotaNombre: 'Milo',
            },
            {
                id: 4,
                codigo: 'PAG-0004',
                concepto: 'Control post-operatorio - Simba',
                fecha: fechaRelativa(1),
                monto: 150,
                metodo: 'Pendiente en caja',
                estado: 'Pendiente',
                mascotaNombre: 'Simba',
            },
            {
                id: 5,
                codigo: 'PAG-0005',
                concepto: 'Plan Preventivo Senior - cuota mensual',
                fecha: fechaRelativa(12),
                monto: 79,
                metodo: 'Débito automático',
                estado: 'Pendiente',
                mascotaNombre: 'Simba',
            },
        ];
    }
}
