import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { CitasService } from '../../../../services/citas-service';
import { MascotasService } from '../../../../services/mascotas-service';
import { BusquedaService } from '../../../../services/busqueda-service';
import { Cita, CitaFormulario, EstadoCita } from '../../../../interfaces/Cita';
import {
    fechaRelativa,
    formatearFecha,
    formatearHora,
    hoyISO,
} from '../../../../utils/fechas';

type FiltroCitas = 'proximas' | 'pasadas' | 'todas';

@Component({
    selector: 'app-citas',
    imports: [ReactiveFormsModule],
    templateUrl: './citas.html',
})
export class Citas {
    private citasService = inject(CitasService);
    private mascotasService = inject(MascotasService);
    private busquedaService = inject(BusquedaService);
    private fb = inject(FormBuilder);

    readonly proxima = this.citasService.proxima;
    readonly pendientes = this.citasService.pendientes;
    readonly atendidas = this.citasService.atendidas;
    readonly mascotas = this.mascotasService.mascotas;
    readonly hoy = hoyISO();

    readonly filtro = signal<FiltroCitas>('proximas');
    readonly mostrarFormulario = signal(false);
    readonly editandoId = signal<number | null>(null);

    readonly citas = computed(() => {
        let lista: Cita[];

        switch (this.filtro()) {
            case 'pasadas':
                lista = this.citasService.pasadas();
                break;
            case 'todas':
                lista = this.citasService.citas();
                break;
            default:
                lista = this.citasService.proximas();
                break;
        }

        const termino = this.busquedaService.termino().toLowerCase().trim();

        if (termino) {
            lista = lista.filter((cita) =>
                `${cita.mascotaNombre} ${cita.motivo} ${cita.doctor} ${cita.estado}`
                    .toLowerCase()
                    .includes(termino),
            );
        }

        return [...lista].sort((a, b) => `${a.fecha}${a.hora}`.localeCompare(`${b.fecha}${b.hora}`));
    });

    readonly formulario = this.fb.group({
        mascotaId: [0, Validators.required],
        doctor: ['Dra. Mariana Pariona', Validators.required],
        motivo: ['', Validators.required],
        fecha: [fechaRelativa(1), Validators.required],
        hora: ['10:00', Validators.required],
    });

    abrirFormulario(cita?: Cita): void {
        this.editandoId.set(cita?.id ?? null);

        if (cita) {
            this.formulario.patchValue({
                mascotaId: cita.mascotaId,
                doctor: cita.doctor,
                motivo: cita.motivo,
                fecha: cita.fecha,
                hora: cita.hora,
            });
        } else {
            this.formulario.reset({
                mascotaId: this.mascotas()[0]?.id ?? 0,
                doctor: 'Dra. Mariana Pariona',
                motivo: '',
                fecha: fechaRelativa(1),
                hora: '10:00',
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
        const id = this.editandoId();

        if (id !== null) {
            this.citasService.reprogramar(id, valor.fecha ?? '', valor.hora ?? '');
            this.cerrarFormulario();
            await this.mostrarExito('Cita reprogramada', 'El turno quedó pendiente de confirmación.');
            return;
        }

        const mascota = this.mascotasService.obtener(Number(valor.mascotaId));

        if (!mascota) {
            return;
        }

        const datos: CitaFormulario = {
            mascotaId: mascota.id,
            motivo: (valor.motivo ?? '').trim(),
            doctor: (valor.doctor ?? '').trim(),
            fecha: valor.fecha ?? this.hoy,
            hora: valor.hora ?? '10:00',
        };

        this.citasService.crear(datos, mascota.nombre);
        this.cerrarFormulario();
        await this.mostrarExito('Cita solicitada', 'Tu turno quedó registrado como pendiente.');
    }

    confirmar(cita: Cita): void {
        this.citasService.confirmar(cita.id);
    }

    async cancelar(cita: Cita): Promise<void> {
        try {
            const { default: Swal } = await import('sweetalert2');
            const resultado = await Swal.fire({
                icon: 'warning',
                title: '¿Cancelar esta cita?',
                text: `${cita.motivo} • ${formatearFecha(cita.fecha)}`,
                showCancelButton: true,
                confirmButtonText: 'Sí, cancelar',
                cancelButtonText: 'Volver',
                confirmButtonColor: '#e11d48',
            });

            if (!resultado.isConfirmed) {
                return;
            }
        } catch {
            // Sin modal, se cancela directamente.
        }

        this.citasService.cancelar(cita.id);
    }

    cambiarFiltro(filtro: FiltroCitas): void {
        this.filtro.set(filtro);
    }

    claseEstado(estado: EstadoCita): string {
        switch (estado) {
            case 'Confirmada':
                return 'bg-emerald-100 text-emerald-800';
            case 'Pendiente':
                return 'bg-amber-100 text-amber-800';
            case 'Cancelada':
                return 'bg-rose-100 text-rose-700';
            default:
                return 'bg-slate-200 text-slate-700';
        }
    }

    readonly formatearFecha = formatearFecha;
    readonly formatearHora = formatearHora;

    private async mostrarExito(titulo: string, texto: string): Promise<void> {
        try {
            const { default: Swal } = await import('sweetalert2');
            await Swal.fire({
                icon: 'success',
                title: titulo,
                text: texto,
                confirmButtonColor: '#005c53',
            });
        } catch {
            // El cambio ya quedó guardado.
        }
    }
}
