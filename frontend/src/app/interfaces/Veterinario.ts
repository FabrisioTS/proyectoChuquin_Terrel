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

/** Cliente registrado con sus mascotas asociadas. */
export interface ClienteConMascotas {
    id: number;
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string;
    dni: string;
    mascotas: Mascota[];
}

/** Información del código temporal dinámico para registro de veterinarios. */
export interface CodigoTemporalInfo {
    codigo: string;
    expira_en_segundos: number;
    valido_hasta: string;
}

/** Contadores del panel principal del veterinario. */
export interface ResumenVeterinario {
    pacientes: number;
    citasHoy: number;
    vacunasProximas: number;
    pagosPendientes: number;
    clientes?: number;
    totalVentas?: number;
}
