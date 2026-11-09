export type TipoRegistroSanitario = 'Vacuna' | 'Tratamiento' | 'Desparasitación';
export type EstadoRegistroSanitario = 'Vigente' | 'Próximo' | 'Vencido';

export interface Vacuna {
    id: number;
    mascotaId: number;
    mascotaNombre: string;
    nombre: string;
    tipo: TipoRegistroSanitario;
    fechaAplicacion: string;
    proximaDosis: string;
    lote: string;
    observaciones: string;
}

export interface VacunaFormulario {
    mascotaId: number;
    nombre: string;
    tipo: TipoRegistroSanitario;
    fechaAplicacion: string;
    proximaDosis: string;
    lote: string;
    observaciones: string;
}
