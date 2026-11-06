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
