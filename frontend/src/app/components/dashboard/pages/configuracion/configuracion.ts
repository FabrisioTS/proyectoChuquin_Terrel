import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AutenticacionService } from '../../../../services/autenticacion-service';
import { ConfiguracionService } from '../../../../services/configuracion-service';
import { Configuracion as ConfiguracionPortal } from '../../../../interfaces/Configuracion';

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
    readonly sedes = [
        'Sede Central Los Olivos',
        'Sede Central San Borja',
        'Sede Surco',
    ];

    readonly formulario = this.fb.group({
        nombres: ['', Validators.required],
        apellidos: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        telefono: [''],
        dni: [''],
        sede: ['Sede Central Los Olivos', Validators.required],
        notificacionesCitas: [true],
        notificacionesVacunas: [true],
        notificacionesPagos: [false],
    });

    constructor() {
        const usuario = this.autenticacionService.usuarioActual();
        const configuracion = this.configuracionService.configuracion();

        this.formulario.patchValue({
            nombres: usuario?.nombres ?? configuracion.nombres,
            apellidos: usuario?.apellidos ?? configuracion.apellidos,
            email: usuario?.email ?? configuracion.email,
            telefono: usuario?.telefono ?? configuracion.telefono,
            dni: usuario?.dni ?? configuracion.dni,
            sede: configuracion.sede,
            notificacionesCitas: configuracion.notificacionesCitas,
            notificacionesVacunas: configuracion.notificacionesVacunas,
            notificacionesPagos: configuracion.notificacionesPagos,
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
            sede: valor.sede ?? 'Sede Central Los Olivos',
            notificacionesCitas: Boolean(valor.notificacionesCitas),
            notificacionesVacunas: Boolean(valor.notificacionesVacunas),
            notificacionesPagos: Boolean(valor.notificacionesPagos),
        };

        this.configuracionService.guardar(configuracion);
        this.autenticacionService.actualizarPerfilLocal({
            nombres: configuracion.nombres,
            apellidos: configuracion.apellidos,
            email: configuracion.email,
            telefono: configuracion.telefono,
            dni: configuracion.dni,
        });

        try {
            const { default: Swal } = await import('sweetalert2');
            await Swal.fire({
                icon: 'success',
                title: 'Configuración guardada',
                text: 'Tus datos y preferencias se actualizaron correctamente.',
                confirmButtonColor: '#c2410c',
            });
        } catch {
            // Los cambios ya quedaron guardados.
        }
    }
}
