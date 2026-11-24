export interface SolicitudCitaFormulario {
    tipo_mascota: 'perro' | 'gato' | 'otro';
    nombre_propietario: string;
    telefono: string;
    nombre_mascota: string;
    servicio: string;
    fecha_deseada?: string | null;
    turno?: string | null;
    notas?: string | null;
}

export interface SolicitudCitaRespuesta {
    id: number;
    tipo_mascota: string;
    nombre_propietario: string;
    telefono: string;
    nombre_mascota: string;
    servicio: string;
    fecha_deseada: string | null;
    turno: string | null;
    notas: string | null;
    estado: string;
    creado_en: string;
}
