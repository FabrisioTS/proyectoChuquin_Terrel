export type EspecieMascota = 'CANINO' | 'FELINO' | 'OTRO';

export interface Mascota {
    id: number;
    nombre: string;
    especie: EspecieMascota;
    raza: string;
    edad: number;
    sexo: string;
    peso: number;
    microchip: string;
    diagnostico: string;
    cobertura: string;
    foto: string;
}

export type MascotaFormulario = Omit<Mascota, 'id' | 'foto'> & { foto?: string };
