import { Component, ElementRef, HostListener, inject, signal, viewChild } from '@angular/core';
import {
    AccesibilidadService,
    Vision,
} from '../../services/accesibilidad-service';

interface OpcionVision {
    valor: Vision;
    etiqueta: string;
    pista: string;
    color: string;
}

@Component({
    selector: 'app-accesibilidad',
    templateUrl: './accesibilidad.html',
    styleUrl: './accesibilidad.css',
})
export class Accesibilidad {
    protected readonly servicio = inject(AccesibilidadService);
    protected readonly abierto = signal(false);

    private readonly host = inject(ElementRef) as ElementRef<HTMLElement>;
    private readonly boton = viewChild<ElementRef<HTMLButtonElement>>('boton');

    protected readonly opcionesVision: OpcionVision[] = [
        { valor: 'normal', etiqueta: 'Normal', pista: 'Colores originales', color: '#f7941d' },
        { valor: 'grises', etiqueta: 'Grises', pista: 'Sin color', color: '#64748b' },
        { valor: 'protanopia', etiqueta: 'Protanopía', pista: 'Rojo reducido', color: '#e31e24' },
        { valor: 'deuteranopia', etiqueta: 'Deuteranopía', pista: 'Verde reducido', color: '#16a34a' },
        { valor: 'tritanopia', etiqueta: 'Tritanopía', pista: 'Azul reducido', color: '#29abe2' },
    ];

    protected alternarPanel(): void {
        this.abierto.update((valor) => !valor);
    }

    protected cerrar(): void {
        this.abierto.set(false);
    }

    protected elegirVision(vision: Vision): void {
        this.servicio.cambiarVision(vision);
    }

    @HostListener('document:keydown.escape')
    protected alPresionarEscape(): void {
        if (this.abierto()) {
            this.cerrar();
            this.boton()?.nativeElement.focus();
        }
    }

    @HostListener('document:click', ['$event'])
    protected alHacerClicFuera(evento: MouseEvent): void {
        if (this.abierto() && !this.host.nativeElement.contains(evento.target as Node)) {
            this.cerrar();
        }
    }
}
