export interface Historial {
    id: number;
    mascotaId: number;
    mascotaNombre: string;
    fecha: string;
    doctor: string;
    motivo: string;
    diagnostico: string;
    tratamiento: string;
    receta: string;
}

export interface HistorialFormulario {
    mascotaId: number;
    fecha: string;
    doctor: string;
    motivo: string;
    diagnostico: string;
    tratamiento: string;
    receta: string;
}
