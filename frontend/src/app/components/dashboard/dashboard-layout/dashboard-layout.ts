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
import { ConfiguracionService } from '../../../services/configuracion-service';
import { NotificacionesService } from '../../../services/notificaciones-service';
import { BusquedaService } from '../../../services/busqueda-service';

interface ItemMenu {
    etiqueta: string;
    ruta: string;
    icono: string;
    exacto?: boolean;
}

@Component({
    selector: 'app-dashboard-layout',
    imports: [RouterLink, RouterLinkActive, RouterOutlet],
    templateUrl: './dashboard-layout.html',
    styleUrl: './dashboard-layout.css',
})
export class DashboardLayout {
    private autenticacionService = inject(AutenticacionService);
    private mascotasService = inject(MascotasService);
    private configuracionService = inject(ConfiguracionService);
    private notificacionesService = inject(NotificacionesService);
    private busquedaService = inject(BusquedaService);
    private router = inject(Router);
    private platformId = inject(PLATFORM_ID);

    readonly usuarioActual = this.autenticacionService.usuarioActual;
    readonly totalMascotas = this.mascotasService.total;
    readonly sede = this.configuracionService.sede;
    readonly notificaciones = this.notificacionesService.notificaciones;
    readonly totalNotificaciones = this.notificacionesService.total;
    readonly terminoBusqueda = this.busquedaService.termino;

    readonly menuAbierto = signal(false);
    readonly mostrarNotificaciones = signal(false);

    readonly nombreCompleto = computed(() => {
        const usuario = this.usuarioActual();
        const nombre = `${usuario?.nombres ?? ''} ${usuario?.apellidos ?? ''}`.trim();
        return nombre || 'Propietario';
    });

    readonly iniciales = computed(() => {
        const usuario = this.usuarioActual();
        const nombres = usuario?.nombres?.trim().charAt(0) ?? 'P';
        const apellidos = usuario?.apellidos?.trim().charAt(0) ?? '';
        return `${nombres}${apellidos}`.toUpperCase();
    });

    readonly menu: ItemMenu[] = [
        {
            etiqueta: 'Inicio / Resumen',
            ruta: '/dashboard',
            exacto: true,
            icono: 'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
        },
        {
            etiqueta: 'Mis Mascotas',
            ruta: '/dashboard/mascotas',
            icono: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
        },
        {
            etiqueta: 'Citas y Consultas',
            ruta: '/dashboard/citas',
            icono: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
        },
        {
            etiqueta: 'Historial Médico',
            ruta: '/dashboard/historial',
            icono: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
        },
        {
            etiqueta: 'Vacunas y Tratamientos',
            ruta: '/dashboard/vacunas',
            icono: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
        },
        {
            etiqueta: 'Pagos / Comprobantes',
            ruta: '/dashboard/pagos',
            icono: 'M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z',
        },
        {
            etiqueta: 'Productos',
            ruta: '/dashboard/productos',
            icono: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
        },
        {
            etiqueta: 'Configuración',
            ruta: '/dashboard/configuracion',
            icono: 'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
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
                this.mostrarNotificaciones.set(false);
                this.busquedaService.limpiar();
                this.irAlInicio();
            });
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
}
