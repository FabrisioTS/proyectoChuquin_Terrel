import {
    Component,
    OnDestroy,
    OnInit,
    PLATFORM_ID,
    computed,
    inject,
    signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

import { AutenticacionService } from '../../../../services/autenticacion-service';
import { VeterinarioService } from '../../../../services/veterinario-service';
import { CodigoTemporalInfo } from '../../../../interfaces/Veterinario';
import { formatearFecha, formatearHora } from '../../../../utils/fechas';

@Component({
    selector: 'app-vet-panel',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './panel.html',
})
export class Panel implements OnInit, OnDestroy {
    private autenticacionService = inject(AutenticacionService);
    private veterinarioService = inject(VeterinarioService);
    private platformId = inject(PLATFORM_ID);

    readonly usuario = this.autenticacionService.usuarioActual;
    readonly esAdmin = this.autenticacionService.esAdmin;
    readonly resumen = this.veterinarioService.resumen;
    readonly agenda = this.veterinarioService.agenda;
    readonly historialReciente = this.veterinarioService.historialReciente;
    readonly cargando = this.veterinarioService.cargando;
    readonly error = this.veterinarioService.error;

    readonly codigoTemporal = signal<CodigoTemporalInfo | null>(null);
    readonly cargandoCodigo = signal(false);
    readonly codigoCopiado = signal(false);
    readonly segundosRestantes = signal<number>(0);

    private timerId?: ReturnType<typeof setInterval>;

    readonly tiempoRestanteFormateado = computed(() => {
        const seg = this.segundosRestantes();
        if (seg <= 0) return '00:00';
        const mins = Math.floor(seg / 60);
        const s = seg % 60;
        return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    });

    readonly saludo = computed(() => {
        const hora = new Date().getHours();

        if (hora < 12) {
            return 'Buenos días';
        }

        if (hora < 19) {
            return 'Buenas tardes';
        }

        return 'Buenas noches';
    });

    readonly nombre = computed(() => this.usuario()?.nombres ?? 'doctor(a)');

    readonly formatearFecha = formatearFecha;
    readonly formatearHora = formatearHora;

    ngOnInit(): void {
        if (this.esAdmin()) {
            this.cargarCodigoTemporal();
            this.iniciarTemporizador();
        }
    }

    ngOnDestroy(): void {
        this.detenerTemporizador();
    }

    private iniciarTemporizador(): void {
        if (!isPlatformBrowser(this.platformId)) return;
        this.detenerTemporizador();
        this.timerId = setInterval(() => {
            const actual = this.segundosRestantes();
            if (actual > 1) {
                this.segundosRestantes.set(actual - 1);
            } else if (actual === 1) {
                this.segundosRestantes.set(0);
                this.cargarCodigoTemporal();
            }
        }, 1000);
    }

    private detenerTemporizador(): void {
        if (this.timerId) {
            clearInterval(this.timerId);
            this.timerId = undefined;
        }
    }

    async cargarCodigoTemporal(): Promise<void> {
        if (!this.esAdmin()) return;
        this.cargandoCodigo.set(true);
        try {
            const info = await this.veterinarioService.obtenerCodigoTemporal();
            this.codigoTemporal.set(info);
            this.segundosRestantes.set(info.expira_en_segundos);
        } catch {
            // Silencioso si aún no está inicializado
        } finally {
            this.cargandoCodigo.set(false);
        }
    }

    async regenerarCodigo(): Promise<void> {
        if (!this.esAdmin()) return;
        this.cargandoCodigo.set(true);
        try {
            const info = await this.veterinarioService.regenerarCodigoTemporal();
            this.codigoTemporal.set(info);
            this.segundosRestantes.set(info.expira_en_segundos);
            this.codigoCopiado.set(false);
        } catch {
            // Silencioso si falla
        } finally {
            this.cargandoCodigo.set(false);
        }
    }

    async copiarCodigo(): Promise<void> {
        const cod = this.codigoTemporal()?.codigo;
        if (!cod || !isPlatformBrowser(this.platformId)) return;
        try {
            await navigator.clipboard.writeText(cod);
            this.codigoCopiado.set(true);
            setTimeout(() => this.codigoCopiado.set(false), 2500);
        } catch {
            // Fallback si clipboard no está disponible
        }
    }

    async actualizar(): Promise<void> {
        await this.veterinarioService.cargarTodo();
        if (this.esAdmin()) {
            await this.cargarCodigoTemporal();
        }
    }
}
