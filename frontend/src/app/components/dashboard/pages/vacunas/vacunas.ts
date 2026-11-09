import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { VacunasService } from '../../../../services/vacunas-service';
import { MascotasService } from '../../../../services/mascotas-service';
import { BusquedaService } from '../../../../services/busqueda-service';
import {
    EstadoRegistroSanitario,
    TipoRegistroSanitario,
    Vacuna,
    VacunaFormulario,
} from '../../../../interfaces/Vacuna';
import { fechaRelativa, formatearFecha, hoyISO } from '../../../../utils/fechas';

type FiltroEstado = 'Todos' | EstadoRegistroSanitario;

@Component({
    selector: 'app-vacunas',
    imports: [ReactiveFormsModule],
    templateUrl: './vacunas.html',
})
export class Vacunas {
    private vacunasService = inject(VacunasService);
    private mascotasService = inject(MascotasService);
    private busquedaService = inject(BusquedaService);
    private fb = inject(FormBuilder);

    readonly total = this.vacunasService.total;
    readonly vigentes = this.vacunasService.vigentes;
    readonly proximas = this.vacunasService.proximas;
    readonly vencidas = this.vacunasService.vencidas;
    readonly mascotas = this.mascotasService.mascotas;

    readonly mascotaFiltro = signal(0);
    readonly estadoFiltro = signal<FiltroEstado>('Todos');
    readonly mostrarFormulario = signal(false);

    readonly porcentaje = computed(() => {
        const total = this.total();
        return total === 0 ? 0 : Math.round((this.vigentes() / total) * 100);
    });

    readonly registros = computed(() => {
        const mascotaId = this.mascotaFiltro();
        const estado = this.estadoFiltro();
        const termino = this.busquedaService.termino().toLowerCase().trim();

        return this.vacunasService
            .vacunas()
            .filter((vacuna) => mascotaId === 0 || vacuna.mascotaId === mascotaId)
            .filter((vacuna) => estado === 'Todos' || this.estado(vacuna) === estado)
            .filter((vacuna) => {
                if (!termino) {
                    return true;
                }

                return `${vacuna.mascotaNombre} ${vacuna.nombre} ${vacuna.tipo} ${vacuna.lote}`
                    .toLowerCase()
                    .includes(termino);
            })
            .sort((a, b) => a.proximaDosis.localeCompare(b.proximaDosis));
    });

    readonly formulario = this.fb.group({
        mascotaId: [0, Validators.required],
        nombre: ['', Validators.required],
        tipo: ['Vacuna', Validators.required],
        fechaAplicacion: [hoyISO(), Validators.required],
        proximaDosis: [fechaRelativa(30), Validators.required],
        lote: [''],
        observaciones: [''],
    });

    abrirFormulario(): void {
        this.formulario.reset({
            mascotaId: this.mascotas()[0]?.id ?? 0,
            nombre: '',
            tipo: 'Vacuna',
            fechaAplicacion: hoyISO(),
            proximaDosis: fechaRelativa(30),
            lote: '',
            observaciones: '',
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
            return;
        }

        const datos: VacunaFormulario = {
            mascotaId: mascota.id,
            nombre: (valor.nombre ?? '').trim(),
            tipo: (valor.tipo ?? 'Vacuna') as TipoRegistroSanitario,
            fechaAplicacion: valor.fechaAplicacion ?? hoyISO(),
            proximaDosis: valor.proximaDosis ?? fechaRelativa(30),
            lote: (valor.lote ?? '').trim(),
            observaciones: (valor.observaciones ?? '').trim(),
        };

        this.vacunasService.crear(datos, mascota.nombre);
        this.cerrarFormulario();

        try {
            const { default: Swal } = await import('sweetalert2');
            await Swal.fire({
                icon: 'success',
                title: 'Registro sanitario agregado',
                text: 'La cartilla de vacunación se actualizó.',
                confirmButtonColor: '#005c53',
            });
        } catch {
            // El registro ya quedó guardado.
        }
    }

    async eliminar(vacuna: Vacuna): Promise<void> {
        try {
            const { default: Swal } = await import('sweetalert2');
            const resultado = await Swal.fire({
                icon: 'warning',
                title: `¿Eliminar "${vacuna.nombre}"?`,
                text: 'Se quitará de la cartilla de vacunación.',
                showCancelButton: true,
                confirmButtonText: 'Sí, eliminar',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#e11d48',
            });

            if (!resultado.isConfirmed) {
                return;
            }
        } catch {
            // Sin modal, se elimina directamente.
        }

        this.vacunasService.eliminar(vacuna.id);
    }

    estado(vacuna: Vacuna): EstadoRegistroSanitario {
        return this.vacunasService.estado(vacuna);
    }

    cambiarMascota(evento: Event): void {
        this.mascotaFiltro.set(Number((evento.target as HTMLSelectElement).value));
    }

    cambiarEstado(evento: Event): void {
        this.estadoFiltro.set((evento.target as HTMLSelectElement).value as FiltroEstado);
    }

    claseEstado(estado: EstadoRegistroSanitario): string {
        switch (estado) {
            case 'Vigente':
                return 'bg-emerald-50 text-emerald-700';
            case 'Próximo':
                return 'bg-amber-50 text-amber-700';
            default:
                return 'bg-rose-50 text-rose-700';
        }
    }

    readonly formatearFecha = formatearFecha;
}
