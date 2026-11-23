import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { HistorialService } from '../../../../services/historial-service';
import { MascotasService } from '../../../../services/mascotas-service';
import { BusquedaService } from '../../../../services/busqueda-service';
import { Historial as HistorialRegistro } from '../../../../interfaces/Historial';
import { formatearFecha, hoyISO } from '../../../../utils/fechas';

@Component({
    selector: 'app-vet-historial',
    imports: [ReactiveFormsModule],
    templateUrl: './historial.html',
})
export class Historial {
    private historialService = inject(HistorialService);
    private mascotasService = inject(MascotasService);
    private busquedaService = inject(BusquedaService);
    private fb = inject(FormBuilder);

    readonly mascotas = this.mascotasService.mascotas;
    readonly total = this.historialService.total;
    readonly mascotaFiltro = signal(0);
    readonly expandido = signal<number | null>(null);
    readonly mostrarFormulario = signal(false);
    readonly guardando = signal(false);
    readonly error = signal<string | null>(null);

    readonly registros = computed(() => {
        const mascotaId = this.mascotaFiltro();
        const termino = this.busquedaService.termino().toLowerCase().trim();

        return this.historialService
            .recientes()
            .filter((registro) => mascotaId === 0 || registro.mascotaId === mascotaId)
            .filter((registro) => {
                if (!termino) {
                    return true;
                }

                return `${registro.mascotaNombre} ${registro.motivo} ${registro.diagnostico} ${registro.doctor} ${registro.tratamiento}`
                    .toLowerCase()
                    .includes(termino);
            });
    });

    readonly formulario = this.fb.group({
        mascotaId: [0, Validators.required],
        fecha: [hoyISO(), Validators.required],
        doctor: ['Dra. Mariana Pariona', Validators.required],
        motivo: ['', Validators.required],
        diagnostico: ['', Validators.required],
        tratamiento: ['', Validators.required],
        receta: [''],
    });

    abrirFormulario(): void {
        this.error.set(null);
        this.formulario.reset({
            mascotaId: this.mascotas()[0]?.id ?? 0,
            fecha: hoyISO(),
            doctor: 'Dra. Mariana Pariona',
            motivo: '',
            diagnostico: '',
            tratamiento: '',
            receta: '',
        });
        this.mostrarFormulario.set(true);
    }

    cerrarFormulario(): void {
        this.mostrarFormulario.set(false);
    }

    async guardar(): Promise<void> {
        if (this.formulario.invalid) {
            this.formulario.markAllAsTouched();
            return;
        }

        const valor = this.formulario.getRawValue();
        const mascota = this.mascotasService.obtener(Number(valor.mascotaId));

        if (!mascota) {
            this.error.set('Selecciona una mascota válida.');
            return;
        }

        this.guardando.set(true);
        this.error.set(null);

        try {
            await this.historialService.crear(
                {
                    mascotaId: mascota.id,
                    fecha: valor.fecha ?? hoyISO(),
                    doctor: (valor.doctor ?? '').trim(),
                    motivo: (valor.motivo ?? '').trim(),
                    diagnostico: (valor.diagnostico ?? '').trim(),
                    tratamiento: (valor.tratamiento ?? '').trim(),
                    receta: (valor.receta ?? '').trim(),
                },
                mascota.nombre,
            );

            this.cerrarFormulario();
            await this.notificar(
                'Consulta registrada',
                'El historial clínico se actualizó correctamente.',
                'success',
            );
        } catch (error) {
            this.error.set((error as Error).message);
        } finally {
            this.guardando.set(false);
        }
    }

    async eliminar(registro: HistorialRegistro): Promise<void> {
        try {
            const { default: Swal } = await import('sweetalert2');
            const resultado = await Swal.fire({
                icon: 'warning',
                title: '¿Eliminar este registro?',
                text: 'Se quitará del historial médico de la mascota.',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#E31E24',
            });

            if (!resultado.isConfirmed) {
                return;
            }
        } catch {
            // Sin modal, se elimina directamente.
        }

        try {
            await this.historialService.eliminar(registro.id);
        } catch (error) {
            this.error.set((error as Error).message);
        }
    }

    cambiarMascota(evento: Event): void {
        this.mascotaFiltro.set(Number((evento.target as HTMLSelectElement).value));
    }

    alternar(id: number): void {
        this.expandido.set(this.expandido() === id ? null : id);
    }

    readonly formatearFecha = formatearFecha;

    private async notificar(
        titulo: string,
        texto: string,
        icono: 'success' | 'error',
    ): Promise<void> {
        try {
            const { default: Swal } = await import('sweetalert2');
            await Swal.fire({
                icon: icono,
                title: titulo,
                text: texto,
                confirmButtonColor: '#0f766e',
            });
        } catch {
            // El cambio ya quedó guardado aunque el modal no esté disponible.
        }
    }
}
