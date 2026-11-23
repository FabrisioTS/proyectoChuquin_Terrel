import { Mascota } from './Mascota';

/** Datos del propietario de un paciente. */
export interface Dueno {
    id: number;
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string;
    dni: string;
}

/** Mascota junto con los datos de su dueño (vista del veterinario). */
export interface Paciente {
    mascota: Mascota;
    dueno: Dueno | null;
}

/** Contadores del panel principal del veterinario. */
export interface ResumenVeterinario {
    pacientes: number;
    citasHoy: number;
    vacunasProximas: number;
    pagosPendientes: number;
}
