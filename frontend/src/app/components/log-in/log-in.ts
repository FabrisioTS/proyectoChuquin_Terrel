import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { email, form, FormField, required } from '@angular/forms/signals';

import { AutenticacionService } from '../../services/autenticacion-service';
import { UsuarioLogin } from '../../interfaces/Usuario';

@Component({
  imports: [FormField, RouterLink],
  selector: 'app-log-in',
  styleUrl: './log-in.css',
  templateUrl: './log-in.html',
})
export class LogIn {
  private autenticacionService = inject(AutenticacionService);
  private router = inject(Router);

  usuarioModelo = signal<UsuarioLogin>({
    email: '',
    password: '',
  });

  usuarioFormulario = form(this.usuarioModelo, (esquema) => {
    required(esquema.email, { message: 'El correo electrónico es obligatorio' });
    email(esquema.email, { message: 'Ingresa un correo electrónico válido' });
    required(esquema.password, { message: 'La contraseña es obligatoria' });
  });

  cargando = signal<boolean>(false);
  mensajeError = signal<string | null>(null);
  mostrarPassword = signal<boolean>(false);

  guardar(evento: Event): void {
    evento.preventDefault();

    if (this.usuarioFormulario().invalid()) {
      this.usuarioFormulario().markAsTouched();
      return;
    }

    this.mensajeError.set(null);
    this.cargando.set(true);

    this.autenticacionService.logear_usuario(this.usuarioModelo()).subscribe({
      next: async (respuesta) => {
        this.cargando.set(false);

        try {
          const { default: Swal } = await import('sweetalert2');
          await Swal.fire({
            icon: 'success',
            title: `Bienvenido, ${respuesta.usuario.nombres}`,
            text: 'Has iniciado sesión correctamente.',
            confirmButtonText: 'Ir al dashboard',
            confirmButtonColor: '#005c53',
          });
        } catch {
          // Si el modal falla, no se bloquea el acceso al dashboard.
        }

        this.router.navigate(['/dashboard']);
      },
      error: (err: Error) => {
        this.cargando.set(false);
        this.mensajeError.set(err.message);
      },
    });
  }
}
