import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { manejarErrorHttp } from '../utils/error-http';
import { Pago } from '../interfaces/Pago';
import { ItemCarritoDetalle } from '../interfaces/Producto';

interface PagoApi {
    id: number;
    usuario_id: number | null;
    codigo: string;
    concepto: string;
    fecha: string;
    monto: number;
    metodo: string | null;
    estado: string;
    mascota_nombre: string | null;
}

function mapearPago(api: PagoApi): Pago {
    return {
        id: api.id,
        codigo: api.codigo,
        concepto: api.concepto,
        fecha: api.fecha,
        monto: api.monto,
        metodo: api.metodo ?? '',
        estado: api.estado as Pago['estado'],
        mascotaNombre: api.mascota_nombre ?? undefined,
    };
}

@Injectable({
    providedIn: 'root',
})
export class PagosService {
    private http = inject(HttpClient);
    private readonly API = `${environment.apiUrl}/pagos`;

    private _pagos = signal<Pago[]>([]);
    readonly cargando = signal(false);
    readonly error = signal<string | null>(null);

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

    async cargar(): Promise<void> {
        this.cargando.set(true);
        this.error.set(null);

        try {
            const datos = await firstValueFrom(
                this.http
                    .get<PagoApi[]>(`${this.API}/`)
                    .pipe(catchError(manejarErrorHttp)),
            );
            this._pagos.set(datos.map(mapearPago));
        } catch (error) {
            this.error.set((error as Error).message);
        } finally {
            this.cargando.set(false);
        }
    }

    /** Envía el carrito al backend: valida stock, descuenta y genera comprobante. */
    async checkout(
        items: ItemCarritoDetalle[],
        metodo = 'Tarjeta',
    ): Promise<Pago> {
        const api = await firstValueFrom(
            this.http
                .post<PagoApi>(`${this.API}/checkout`, {
                    items: items.map((item) => ({
                        producto_id: item.producto.id,
                        cantidad: item.cantidad,
                    })),
                    metodo,
                })
                .pipe(catchError(manejarErrorHttp)),
        );
        const pago = mapearPago(api);
        this._pagos.update((pagos) => [pago, ...pagos]);
        return pago;
    }

    async marcarPagado(id: number): Promise<void> {
        const api = await firstValueFrom(
            this.http
                .patch<PagoApi>(`${this.API}/${id}/pagar`, {})
                .pipe(catchError(manejarErrorHttp)),
        );
        const pago = mapearPago(api);
        this._pagos.update((pagos) =>
            pagos.map((item) => (item.id === id ? pago : item)),
        );
    }
}
