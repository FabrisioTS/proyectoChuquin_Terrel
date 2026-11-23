export interface UsuarioRegistro {
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string;
    dni: string;
    password: string;
    confirmar_password: string;
}


export interface UsuarioLogin {
    email: string;
    password: string;
}


export interface UsuarioResponse {
    id: number;
    nombres: string;
    apellidos: string;
    email: string;
    telefono: string;
    dni: string;
}


export interface TokenResponse {
    access_token: string;
    token_type: string;
    usuario: UsuarioResponse;
}


export interface RecuperarPasswordSolicitud {
    email: string;
    dni: string;
}

export interface RecuperarPasswordRespuesta {
    mensaje: string;
    token_recuperacion: string;
}

export interface RestablecerPassword {
    token: string;
    password: string;
    confirmar_password: string;
}

export interface CambiarPassword {
    password_actual: string;
    password: string;
    confirmar_password: string;
}

export interface MensajeRespuesta {
    mensaje: string;
}
