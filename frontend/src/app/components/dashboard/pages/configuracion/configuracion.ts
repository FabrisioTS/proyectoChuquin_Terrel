import { Component, effect, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AutenticacionService } from '../../../../services/autenticacion-service';
import { ConfiguracionService } from '../../../../services/configuracion-service';
import { Configuracion as ConfiguracionPortal } from '../../../../interfaces/Configuracion';

const PASSWORD_SEGURA = /^(?=.*[A-Za-z])(?=.*\d).+$/;

@Component({
    selector: 'app-configuracion',
    imports: [ReactiveFormsModule],
    templateUrl: './configuracion.html',
})
export class Configuracion {
    private autenticacionService = inject(AutenticacionService);
    private configuracionService = inject(ConfiguracionService);
    private fb = inject(FormBuilder);

    readonly usuario = this.autenticacionService.usuarioActual;
    readonly sedes = ['Sede Central - San Carlos'];

    readonly formulario = this.fb.group({
        nombres: ['', Validators.required],
        apellidos: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        telefono: [''],
        dni: [''],
        sede: [this.sedes[0], Validators.required],
        notificacionesCitas: [true],
        notificacionesVacunas: [true],
        notificacionesPagos: [false],
    });

    readonly formularioPassword = this.fb.group({
        password_actual: ['', [Validators.required, Validators.maxLength(72)]],
        password: [
            '',
            [
                Validators.required,
                Validators.minLength(8),
                Validators.maxLength(72),
                Validators.pattern(PASSWORD_SEGURA),
            ],
        ],
        confirmar_password: ['', [Validators.required, Validators.maxLength(72)]],
    });

    mostrarPasswordActual = false;
    mostrarPasswordNueva = false;
    mostrarPasswordConfirmacion = false;
    cambiandoPassword = false;
    guardando = false;
    errorPassword: string | null = null;
    exitoPassword: string | null = null;

    constructor() {
        // El formulario se sincroniza con los datos que llegan del backend,
        // tanto al cargar la página como después de guardar los cambios.
        effect(() => {
            const usuario = this.autenticacionService.usuarioActual();
            const configuracion = this.configuracionService.configuracion();

            this.formulario.patchValue(
                {
                    nombres: usuario?.nombres ?? configuracion.nombres,
                    apellidos: usuario?.apellidos ?? configuracion.apellidos,
                    email: usuario?.email ?? configuracion.email,
                    telefono: usuario?.telefono ?? configuracion.telefono,
                    dni: usuario?.dni ?? configuracion.dni,
                    sede: configuracion.sede || this.sedes[0],
                    notificacionesCitas: configuracion.notificacionesCitas,
                    notificacionesVacunas: configuracion.notificacionesVacunas,
                    notificacionesPagos: configuracion.notificacionesPagos,
                },
                { emitEvent: false },
            );
        });
    }

    async guardar(): Promise<void> {
        if (this.formulario.invalid) {
            this.formulario.markAllAsTouched();
            return;
        }

        const valor = this.formulario.getRawValue();
        const configuracion: ConfiguracionPortal = {
            nombres: (valor.nombres ?? '').trim(),
            apellidos: (valor.apellidos ?? '').trim(),
            email: (valor.email ?? '').trim(),
            telefono: (valor.telefono ?? '').trim(),
            dni: (valor.dni ?? '').trim(),
            sede: valor.sede ?? 'Sede Central - San Carlos',
            notificacionesCitas: Boolean(valor.notificacionesCitas),
            notificacionesVacunas: Boolean(valor.notificacionesVacunas),
            notificacionesPagos: Boolean(valor.notificacionesPagos),
        };

        this.guardando = true;

        try {
            await this.configuracionService.guardar(configuracion);

            const { default: Swal } = await import('sweetalert2');
            await Swal.fire({
                icon: 'success',
                title: 'Configuración guardada',
                text: 'Tus datos y preferencias se actualizaron correctamente.',
                confirmButtonColor: '#c2410c',
            });
        } catch (error) {
            try {
                const { default: Swal } = await import('sweetalert2');
                await Swal.fire({
                    icon: 'error',
                    title: 'No se pudo guardar la configuración',
                    text: (error as Error).message,
                    confirmButtonColor: '#c2410c',
                });
            } catch {
                // Sin modal no se puede informar el error.
            }
        } finally {
            this.guardando = false;
        }
    }

    cambiarPassword(): void {
        this.errorPassword = null;
        this.exitoPassword = null;

        if (this.formularioPassword.invalid) {
            this.formularioPassword.markAllAsTouched();
            this.errorPassword = 'Revisa los campos de contraseña antes de continuar.';
            return;
        }

        const valor = this.formularioPassword.getRawValue();
        const passwordNueva = valor.password ?? '';
        const confirmacion = valor.confirmar_password ?? '';

        if (passwordNueva !== confirmacion) {
            this.errorPassword = 'Las contraseñas nuevas no coinciden.';
            return;
        }

        this.cambiandoPassword = true;

        this.autenticacionService
            .cambiar_password({
                password_actual: valor.password_actual ?? '',
                password: passwordNueva,
                confirmar_password: confirmacion,
            })
            .subscribe({
                next: async (respuesta) => {
                    this.cambiandoPassword = false;
                    this.exitoPassword = respuesta.mensaje;
                    this.formularioPassword.reset();

                    try {
                        const { default: Swal } = await import('sweetalert2');
                        await Swal.fire({
                            icon: 'success',
                            title: 'Contraseña actualizada',
                            text: 'Tu contraseña se cambió correctamente. Úsala en tu próximo inicio de sesión.',
                            confirmButtonColor: '#c2410c',
                        });
                    } catch {
                        // El cambio ya se guardó aunque el modal no esté disponible.
                    }
                },
                error: (err: Error) => {
                    this.cambiandoPassword = false;
                    this.errorPassword = err.message;
                },
            });
    }
}
