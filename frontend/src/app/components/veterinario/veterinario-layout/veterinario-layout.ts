import {
    Component,
    ElementRef,
    PLATFORM_ID,
    ViewChild,
    computed,
    inject,
    signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
    NavigationEnd,
    Router,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
} from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

import { AutenticacionService } from '../../../services/autenticacion-service';
import { MascotasService } from '../../../services/mascotas-service';
import { CitasService } from '../../../services/citas-service';
import { HistorialService } from '../../../services/historial-service';
import { VacunasService } from '../../../services/vacunas-service';
import { PagosService } from '../../../services/pagos-service';
import { ProductosService } from '../../../services/productos-service';
import { VeterinarioService } from '../../../services/veterinario-service';
import { BusquedaService } from '../../../services/busqueda-service';

interface ItemMenu {
    etiqueta: string;
    ruta: string;
    icono: string;
    exacto?: boolean;
}

@Component({
    selector: 'app-veterinario-layout',
    imports: [RouterLink, RouterLinkActive, RouterOutlet],
    templateUrl: './veterinario-layout.html',
    styleUrl: './veterinario-layout.css',
})
export class VeterinarioLayout {
    private autenticacionService = inject(AutenticacionService);
    private mascotasService = inject(MascotasService);
    private citasService = inject(CitasService);
    private historialService = inject(HistorialService);
    private vacunasService = inject(VacunasService);
    private pagosService = inject(PagosService);
    private productosService = inject(ProductosService);
    private veterinarioService = inject(VeterinarioService);
    private busquedaService = inject(BusquedaService);
    private router = inject(Router);
    private platformId = inject(PLATFORM_ID);

    readonly usuarioActual = this.autenticacionService.usuarioActual;
    readonly terminoBusqueda = this.busquedaService.termino;
    readonly esAdmin = this.autenticacionService.esAdmin;

    readonly menuAbierto = signal(false);

    readonly nombreCompleto = computed(() => {
        const usuario = this.usuarioActual();
        const nombre = `${usuario?.nombres ?? ''} ${usuario?.apellidos ?? ''}`.trim();
        return nombre || 'Veterinario';
    });

    readonly iniciales = computed(() => {
        const usuario = this.usuarioActual();
        const nombres = usuario?.nombres?.trim().charAt(0) ?? 'V';
        const apellidos = usuario?.apellidos?.trim().charAt(0) ?? '';
        return `${nombres}${apellidos}`.toUpperCase();
    });

    readonly rolEtiqueta = computed(() =>
        this.esAdmin() ? 'Administrador' : 'Veterinario',
    );

    readonly menu: ItemMenu[] = [
        {
            etiqueta: 'Panel',
            ruta: '/veterinario',
            icono: 'dashboard',
            exacto: true,
        },
        {
            etiqueta: 'Pacientes',
            ruta: '/veterinario/pacientes',
            icono: 'pets',
        },
        {
            etiqueta: 'Agenda',
            ruta: '/veterinario/agenda',
            icono: 'calendar_month',
        },
        {
            etiqueta: 'Historial clínico',
            ruta: '/veterinario/historial',
            icono: 'assignment',
        },
        {
            etiqueta: 'Vacunas y tratamientos',
            ruta: '/veterinario/vacunas',
            icono: 'vaccines',
        },
        {
            etiqueta: 'Pagos',
            ruta: '/veterinario/pagos',
            icono: 'receipt_long',
        },
    ];

    @ViewChild('contenedor') private contenedor?: ElementRef<HTMLElement>;

    constructor() {
        this.router.events
            .pipe(
                filter((evento) => evento instanceof NavigationEnd),
                takeUntilDestroyed(),
            )
            .subscribe(() => {
                this.menuAbierto.set(false);
                this.busquedaService.limpiar();
                this.irAlInicio();
            });

        if (isPlatformBrowser(this.platformId)) {
            void this.cargarDatos();
        }
    }

    actualizarBusqueda(evento: Event): void {
        this.busquedaService.establecer((evento.target as HTMLInputElement).value);
    }

    irAlInicio(): void {
        if (!isPlatformBrowser(this.platformId)) {
            return;
        }

        setTimeout(() => {
            const elemento = this.contenedor?.nativeElement;

            if (!elemento) {
                return;
            }

            if (typeof elemento.scrollTo === 'function') {
                elemento.scrollTo({ top: 0 });
            } else {
                elemento.scrollTop = 0;
            }
        }, 0);
    }

    async cerrarSesion(): Promise<void> {
        try {
            const { default: Swal } = await import('sweetalert2');
            const resultado = await Swal.fire({
                icon: 'question',
                title: '¿Cerrar sesión?',
                text: 'Volverás a la pantalla de inicio de sesión.',
                showCancelButton: true,
                confirmButtonText: 'Sí, cerrar sesión',
                cancelButtonText: 'Cancelar',
                confirmButtonColor: '#c2410c',
            });

            if (!resultado.isConfirmed) {
                return;
            }
        } catch {
            // Si el modal falla, se permite cerrar sesión igualmente.
        }

        this.autenticacionService.cerrar_sesion();
        this.router.navigate(['/login']);
    }

    private async cargarDatos(): Promise<void> {
        await Promise.all([
            this.mascotasService.cargar(),
            this.citasService.cargar(),
            this.historialService.cargar(),
            this.vacunasService.cargar(),
            this.pagosService.cargar(),
            this.productosService.cargar(),
            this.veterinarioService.cargarTodo(),
        ]);
    }
}
