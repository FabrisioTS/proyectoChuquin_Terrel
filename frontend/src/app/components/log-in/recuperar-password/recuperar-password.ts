import { Component, inject, output, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  maxLength,
  minLength,
  pattern,
  required,
  validate,
} from '@angular/forms/signals';

import { AutenticacionService } from '../../../services/autenticacion-service';
import {
  RecuperarPasswordSolicitud,
  RestablecerPassword,
} from '../../../interfaces/Usuario';

const DNI_PERU = /^\d{8}$/;
const PASSWORD_SEGURA = /^(?=.*[A-Za-z])(?=.*\d).+$/;

@Component({
  selector: 'app-recuperar-password',
  imports: [FormField],
  templateUrl: './recuperar-password.html',
})
export class RecuperarPassword {
  private autenticacionService = inject(AutenticacionService);

  /** El login escucha este evento para cerrar el modal. */
  readonly cerrar = output<void>();
  /** Devuelve el correo verificado para precargarlo en el formulario de login. */
  readonly recuperado = output<string>();

  readonly paso = signal<1 | 2>(1);
  readonly cargando = signal(false);
  readonly mensajeError = signal<string | null>(null);
  readonly token = signal<string | null>(null);
  readonly mostrarPassword = signal(false);
  readonly mostrarConfirmacion = signal(false);

  readonly identidadModelo = signal<RecuperarPasswordSolicitud>({
    email: '',
    dni: '',
  });

  readonly identidadFormulario = form(this.identidadModelo, (esquema) => {
    required(esquema.email, { message: 'El correo electrónico es obligatorio' });
    email(esquema.email, { message: 'Ingresa un correo electrónico válido' });
    maxLength(esquema.email, 150, {
      message: 'El correo no debe superar los 150 caracteres',
    });
    required(esquema.dni, { message: 'El DNI es obligatorio' });
    minLength(esquema.dni, 8, { message: 'El DNI debe tener 8 dígitos' });
    maxLength(esquema.dni, 8, {
      message: 'El DNI no debe superar los 8 dígitos',
    });
    pattern(esquema.dni, DNI_PERU, {
      message: 'El DNI debe tener exactamente 8 dígitos numéricos',
    });
  });

  readonly passwordModelo = signal({
    password: '',
    confirmar_password: '',
  });

  readonly passwordFormulario = form(this.passwordModelo, (esquema) => {
    required(esquema.password, { message: 'La contraseña es obligatoria' });
    minLength(esquema.password, 8, {
      message: 'La contraseña debe tener al menos 8 caracteres',
    });
    maxLength(esquema.password, 72, {
      message: 'La contraseña no debe superar los 72 caracteres',
    });
    pattern(esquema.password, PASSWORD_SEGURA, {
      message: 'La contraseña debe incluir al menos una letra y un número',
    });

    required(esquema.confirmar_password, {
      message: 'Debe confirmar la contraseña',
    });
    maxLength(esquema.confirmar_password, 72, {
      message: 'La contraseña no debe superar los 72 caracteres',
    });
    validate(esquema.confirmar_password, ({ value, valueOf }) =>
      value() === valueOf(esquema.password)
        ? undefined
        : {
            kind: 'passwordMismatch',
            message: 'Las contraseñas no coinciden',
          },
    );
  });

  verificarIdentidad(evento: Event): void {
    evento.preventDefault();

    if (this.identidadFormulario().invalid()) {
      this.identidadFormulario().markAsTouched();
      this.mensajeError.set('Revisa los datos marcados antes de continuar.');
      return;
    }

    this.mensajeError.set(null);
    this.cargando.set(true);

    this.autenticacionService.recuperar_password(this.identidadModelo()).subscribe({
      next: (respuesta) => {
        this.cargando.set(false);
        this.token.set(respuesta.token_recuperacion);
        this.paso.set(2);
      },
      error: (err: Error) => {
        this.cargando.set(false);
        this.mensajeError.set(err.message);
      },
    });
  }

  restablecer(evento: Event): void {
    evento.preventDefault();

    if (this.passwordFormulario().invalid()) {
      this.passwordFormulario().markAsTouched();
      this.mensajeError.set('Revisa los datos marcados antes de continuar.');
      return;
    }

    const token = this.token();

    if (!token) {
      this.mensajeError.set(
        'La verificación expiró. Confirma tu identidad nuevamente.',
      );
      this.paso.set(1);
      return;
    }

    this.mensajeError.set(null);
    this.cargando.set(true);

    const datos: RestablecerPassword = {
      token,
      ...this.passwordModelo(),
    };

    this.autenticacionService.restablecer_password(datos).subscribe({
      next: async () => {
        this.cargando.set(false);
        const emailVerificado = this.identidadModelo().email;

        try {
          const { default: Swal } = await import('sweetalert2');
          await Swal.fire({
            icon: 'success',
            title: 'Contraseña actualizada',
            text: 'Ya puedes iniciar sesión con tu nueva contraseña.',
            confirmButtonText: 'Aceptar',
            confirmButtonColor: '#c2410c',
          });
        } catch {
          // El cambio ya se guardó aunque el modal no esté disponible.
        }

        this.recuperado.emit(emailVerificado);
        this.cerrar.emit();
      },
      error: (err: Error) => {
        this.cargando.set(false);
        this.mensajeError.set(err.message);
      },
    });
  }

  volver(): void {
    this.mensajeError.set(null);
    this.token.set(null);
    this.passwordModelo.set({ password: '', confirmar_password: '' });
    this.paso.set(1);
  }

  cerrarModal(): void {
    if (this.cargando()) {
      return;
    }

    this.cerrar.emit();
  }
}
