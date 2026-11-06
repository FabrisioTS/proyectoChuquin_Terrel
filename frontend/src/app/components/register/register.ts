import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { form, required, FormField } from '@angular/forms/signals';

import { AutenticacionService } from '../../services/autenticacion-service';
import { UsuarioRegistro } from '../../interfaces/Usuario';

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
    required(esquema.apellidos, { message: 'El apellido es obligatorio' });
    required(esquema.email, { message: 'El correo electrónico es obligatorio' });
    required(esquema.telefono, { message: 'El teléfono es obligatorio' });
    required(esquema.dni, { message: 'El DNI es obligatorio' });
    required(esquema.password, { message: 'La contraseña es obligatoria' });
    required(esquema.confirmar_password, { message: 'Debe confirmar la contraseña' });
  });

  cargando = signal<boolean>(false);
  mensajeError = signal<string | null>(null);

  guardar(evento: Event): void {
    evento.preventDefault();

    const payload = this.usuarioModelo();

    if (payload.password !== payload.confirmar_password) {
      this.mensajeError.set('Las contraseñas no coinciden. Por favor, verifícalas.');
      return;
    }

    this.mensajeError.set(null);
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
        this.mensajeError.set(err.message);
      }
    });
  }
}