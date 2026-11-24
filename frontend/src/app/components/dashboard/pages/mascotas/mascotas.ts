import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { MascotasService } from '../../../../services/mascotas-service';
import { BusquedaService } from '../../../../services/busqueda-service';
import { EspecieMascota, Mascota, MascotaFormulario } from '../../../../interfaces/Mascota';

@Component({
    selector: 'app-mascotas',
    imports: [ReactiveFormsModule, RouterLink],
    templateUrl: './mascotas.html',
})
export class Mascotas {
    private mascotasService = inject(MascotasService);
    private busquedaService = inject(BusquedaService);
    private fb = inject(FormBuilder);

    readonly total = this.mascotasService.total;

    readonly mascotas = computed(() => {
        const termino = this.busquedaService.termino().toLowerCase().trim();

        return this.mascotasService.mascotas().filter((mascota) => {
            if (!termino) {
                return true;
            }

            const texto = `${mascota.nombre} ${mascota.raza} ${mascota.especie} ${mascota.microchip}`;
            return texto.toLowerCase().includes(termino);
        });
    });

    readonly mostrarFormulario = signal(false);
    readonly editandoId = signal<number | null>(null);

    readonly formulario = this.fb.group({
        nombre: ['', Validators.required],
        especie: ['CANINO', Validators.required],
        raza: ['', Validators.required],
        edad: [1, [Validators.required, Validators.min(0)]],
        sexo: ['Macho', Validators.required],
        peso: [1, [Validators.required, Validators.min(0)]],
        microchip: [''],
        diagnostico: ['Salud Óptima'],
        cobertura: ['Plan Preventivo'],
    });

    abrirFormulario(mascota?: Mascota): void {
        this.editandoId.set(mascota?.id ?? null);

        if (mascota) {
            this.formulario.patchValue({
                nombre: mascota.nombre,
                especie: mascota.especie,
                raza: mascota.raza,
                edad: mascota.edad,
                sexo: mascota.sexo,
                peso: mascota.peso,
                microchip: mascota.microchip,
                diagnostico: mascota.diagnostico,
                cobertura: mascota.cobertura,
            });
        } else {
            this.formulario.reset({
                nombre: '',
                especie: 'CANINO',
                raza: '',
                edad: 1,
                sexo: 'Macho',
                peso: 1,
                microchip: '',
                diagnostico: 'Salud Óptima',
                cobertura: 'Plan Preventivo',
            });
        }

        this.mostrarFormulario.set(true);
    }

    cerrarFormulario(): void {
        this.mostrarFormulario.set(false);
        this.editandoId.set(null);
        this.formulario.reset();
    }

    async guardar(): Promise<void> {
        if (this.formulario.invalid) {
            this.formulario.markAllAsTouched();
            return;
        }

        const valor = this.formulario.getRawValue();
        const datos: MascotaFormulario = {
            nombre: (valor.nombre ?? '').trim(),
            especie: (valor.especie ?? 'OTRO') as EspecieMascota,
            raza: (valor.raza ?? '').trim(),
            edad: Number(valor.edad),
            sexo: (valor.sexo ?? '').trim(),
            peso: Number(valor.peso),
            microchip: (valor.microchip ?? '').trim(),
            diagnostico: (valor.diagnostico ?? '').trim(),
            cobertura: (valor.cobertura ?? '').trim(),
        };

        const id = this.editandoId();

        try {
            if (id !== null) {
                await this.mascotasService.actualizar(id, datos);
            } else {
                await this.mascotasService.crear(datos);
            }

            this.cerrarFormulario();

            const { default: Swal } = await import('sweetalert2');
            await Swal.fire({
                icon: 'success',
                title: id !== null ? 'Mascota actualizada' : 'Mascota registrada',
                text: 'La información se guardó correctamente.',
                confirmButtonColor: '#c2410c',
            });
        } catch (error) {
            await this.mostrarError(error);
        }
    }

    async eliminar(mascota: Mascota): Promise<void> {
        try {
            const { default: Swal } = await import('sweetalert2');
            const resultado = await Swal.fire({
                icon: 'warning',
                title: `¿Eliminar a ${mascota.nombre}?`,
                text: 'Se quitará la ficha de tu cuenta. Esta acción no se puede deshacer.',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#E31E24',
            });

            if (!resultado.isConfirmed) {
                return;
            }

            await this.mascotasService.eliminar(mascota.id);
            await Swal.fire({
                icon: 'success',
                title: 'Mascota eliminada',
                confirmButtonColor: '#c2410c',
            });
        } catch (error) {
            await this.mostrarError(error);
        }
    }

    private async mostrarError(error: unknown): Promise<void> {
        try {
            const { default: Swal } = await import('sweetalert2');
            await Swal.fire({
                icon: 'error',
                title: 'No se pudo completar la operación',
                text: (error as Error).message,
                confirmButtonColor: '#c2410c',
            });
        } catch {
            // Sin modal no se puede informar el error.
        }
    }
}
