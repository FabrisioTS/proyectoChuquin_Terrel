export type EstadoCita = 'Confirmada' | 'Pendiente' | 'Cancelada' | 'Atendida';

export interface Cita {
    id: number;
    mascotaId: number;
    mascotaNombre: string;
    motivo: string;
    doctor: string;
    especialidad: string;
    fecha: string;
    hora: string;
    sede: string;
    direccion: string;
    estado: EstadoCita;
    indicaciones: string;
}

export interface CitaFormulario {
    mascotaId: number;
    motivo: string;
    doctor: string;
    fecha: string;
    hora: string;
}
