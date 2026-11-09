export type EstadoPago = 'Pagado' | 'Pendiente' | 'Vencido';

export interface Pago {
    id: number;
    codigo: string;
    concepto: string;
    fecha: string;
    monto: number;
    metodo: string;
    estado: EstadoPago;
    mascotaNombre?: string;
}
