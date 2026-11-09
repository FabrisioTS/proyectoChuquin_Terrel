export type TipoNotificacion = 'cita' | 'vacuna' | 'pago';

export interface Notificacion {
    id: string;
    tipo: TipoNotificacion;
    titulo: string;
    detalle: string;
    ruta: string;
}
