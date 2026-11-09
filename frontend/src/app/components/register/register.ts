import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { email, form, FormField, maxLength, minLength, pattern, required, validate } from '@angular/forms/signals';

import {
  AutenticacionService,
  ErrorApi,
  ErrorCampo,
} from '../../services/autenticacion-service';
import { UsuarioRegistro } from '../../interfaces/Usuario';
import { TERMINOS_CONDICIONES } from '../../data/legal';

const ETIQUETAS_CAMPO: Record<string, string> = {
  nombres: 'Nombres',
  apellidos: 'Apellidos',
  email: 'Correo electrónico',
  telefono: 'Teléfono',
  dni: 'DNI',
  password: 'Contraseña',
  confirmar_password: 'Confirmar contraseña',
};

const SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/;
const TELEFONO_PERU = /^9\d{8}$/;
const DNI_PERU = /^\d{8}$/;
const PASSWORD_SEGURA = /^(?=.*[A-Za-z])(?=.*\d).+$/;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormField, RouterLink],
  styleUrl: './register.css',
  templateUrl: './register.html',
})
export class Register {
  private autenticacionService = inject(AutenticacionService);
  private router = inject(Router);

  readonly terminosCondiciones = TERMINOS_CONDICIONES;

  usuarioModelo = signal<UsuarioRegistro>({
    nombres: '',
    apellidos: '',
    email: '',
    telefono: '',
    dni: '',
    password: '',
    confirmar_password: ''
  });

  usuarioFormulario = form(this.usuarioModelo, (esquema) => {
    required(esquema.nombres, { message: 'El nombre es obligatorio' });
    minLength(esquema.nombres, 2, { message: 'El nombre debe tener al menos 2 caracteres' });
    maxLength(esquema.nombres, 100, { message: 'El nombre no debe superar los 100 caracteres' });
    pattern(esquema.nombres, SOLO_LETRAS, { message: 'El nombre solo debe contener letras y espacios' });

    required(esquema.apellidos, { message: 'El apellido es obligatorio' });
    minLength(esquema.apellidos, 2, { message: 'El apellido debe tener al menos 2 caracteres' });
    maxLength(esquema.apellidos, 100, { message: 'El apellido no debe superar los 100 caracteres' });
    pattern(esquema.apellidos, SOLO_LETRAS, { message: 'El apellido solo debe contener letras y espacios' });

    required(esquema.email, { message: 'El correo electrónico es obligatorio' });
    email(esquema.email, { message: 'Ingresa un correo electrónico válido con "@" y dominio' });
    maxLength(esquema.email, 150, { message: 'El correo no debe superar los 150 caracteres' });

    required(esquema.telefono, { message: 'El teléfono es obligatorio' });
    minLength(esquema.telefono, 9, { message: 'El teléfono debe tener 9 dígitos' });
    maxLength(esquema.telefono, 9, { message: 'El teléfono no debe superar los 9 dígitos' });
    pattern(esquema.telefono, TELEFONO_PERU, {
      message: 'El teléfono debe tener 9 dígitos y empezar con 9',
    });

    required(esquema.dni, { message: 'El DNI es obligatorio' });
    minLength(esquema.dni, 8, { message: 'El DNI debe tener 8 dígitos' });
    maxLength(esquema.dni, 8, { message: 'El DNI no debe superar los 8 dígitos' });
    pattern(esquema.dni, DNI_PERU, { message: 'El DNI debe tener exactamente 8 dígitos numéricos' });

    required(esquema.password, { message: 'La contraseña es obligatoria' });
    minLength(esquema.password, 8, { message: 'La contraseña debe tener al menos 8 caracteres' });
    maxLength(esquema.password, 72, { message: 'La contraseña no debe superar los 72 caracteres' });
    pattern(esquema.password, PASSWORD_SEGURA, {
      message: 'La contraseña debe incluir al menos una letra y un número',
    });

    required(esquema.confirmar_password, { message: 'Debe confirmar la contraseña' });
    maxLength(esquema.confirmar_password, 72, {
      message: 'La contraseña no debe superar los 72 caracteres',
    });
    validate(esquema.confirmar_password, ({ value, valueOf }) =>
      value() === valueOf(esquema.password)
        ? undefined
        : { kind: 'passwordMismatch', message: 'Las contraseñas no coinciden' },
    );
  });

  cargando = signal<boolean>(false);
  mensajeError = signal<string | null>(null);
  erroresServidor = signal<ErrorCampo[]>([]);

  terminosAceptados = signal<boolean>(false);
  mostrarTerminos = signal<boolean>(false);
  aceptoEnModal = signal<boolean>(false);
  errorTerminos = signal<boolean>(false);

  etiquetaCampo(campo: string): string {
    return ETIQUETAS_CAMPO[campo] ?? campo;
  }

  abrirTerminos(): void {
    this.aceptoEnModal.set(this.terminosAceptados());
    this.mostrarTerminos.set(true);
  }

  cerrarTerminos(): void {
    this.mostrarTerminos.set(false);
  }

  confirmarTerminos(): void {
    if (!this.aceptoEnModal()) {
      return;
    }

    this.terminosAceptados.set(true);
    this.errorTerminos.set(false);
    this.mostrarTerminos.set(false);
  }

  cambiarAceptacionModal(evento: Event): void {
    this.aceptoEnModal.set((evento.target as HTMLInputElement).checked);
  }

  cambiarAceptacionTerminos(evento: Event): void {
    const aceptado = (evento.target as HTMLInputElement).checked;
    this.terminosAceptados.set(aceptado);

    if (aceptado) {
      this.errorTerminos.set(false);
    }
  }

  guardar(evento: Event): void {
    evento.preventDefault();

    if (this.usuarioFormulario().invalid()) {
      this.usuarioFormulario().markAsTouched();
      this.mensajeError.set('Revisa los campos marcados antes de continuar.');
      this.erroresServidor.set([]);
      return;
    }

    if (!this.terminosAceptados()) {
      this.errorTerminos.set(true);
      this.abrirTerminos();
      return;
    }

    const payload = this.usuarioModelo();

    if (payload.password !== payload.confirmar_password) {
      this.mensajeError.set('Las contraseñas no coinciden. Por favor, verifícalas.');
      return;
    }

    this.mensajeError.set(null);
    this.erroresServidor.set([]);
    this.errorTerminos.set(false);
    this.cargando.set(true);

    this.autenticacionService.registrar_usuario(payload).subscribe({
      next: async () => {
        this.cargando.set(false);

        try {
          const { default: Swal } = await import('sweetalert2');
          await Swal.fire({
            icon: 'success',
            title: 'Usuario registrado exitosamente',
            text: 'Tu cuenta de propietario ha sido creada. Ya puedes iniciar sesión.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#005c53',
            allowOutsideClick: false,
            allowEscapeKey: false,
          });
        } catch {
          // Si el modal falla, no se bloquea el registro ni la redirección.
        }

        this.router.navigate(['/login']);
      },
      error: (err: Error) => {
        this.cargando.set(false);
        const errorApi = err as ErrorApi;
        this.erroresServidor.set(errorApi.campos ?? []);
        this.mensajeError.set(err.message);
      }
    });
  }
}
