import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AlmacenamientoService } from './almacenamiento-service';

export type Vision = 'normal' | 'grises' | 'protanopia' | 'deuteranopia' | 'tritanopia';

export interface AjustesAccesibilidad {
    escalaTexto: number;
    espaciado: boolean;
    fuenteLegible: boolean;
    altoContraste: boolean;
    vision: Vision;
    resaltarEnlaces: boolean;
    cursorGrande: boolean;
    reducirMovimiento: boolean;
}

const CLAVE = 'portal_accesibilidad_v1';
const ESCALAS = [100, 110, 120, 130, 140] as const;

export const AJUSTES_POR_DEFECTO: AjustesAccesibilidad = {
    escalaTexto: 100,
    espaciado: false,
    fuenteLegible: false,
    altoContraste: false,
    vision: 'normal',
    resaltarEnlaces: false,
    cursorGrande: false,
    reducirMovimiento: false,
};

/**
 * Gestiona las preferencias de accesibilidad. El estado vive en signals y se
 * refleja como clases en <html>, por lo que aplica a toda la aplicación sin
 * importar la ruta activa. Se guarda en localStorage para persistir.
 */
@Injectable({
    providedIn: 'root',
})
export class AccesibilidadService {
    private almacenamiento = inject(AlmacenamientoService);

    private _ajustes = signal<AjustesAccesibilidad>(
        this.normalizar(this.almacenamiento.leer<AjustesAccesibilidad>(CLAVE, AJUSTES_POR_DEFECTO)),
    );

    readonly ajustes = this._ajustes.asReadonly();

    readonly escalaTexto = computed(() => this._ajustes().escalaTexto);
    readonly puedeAgrandar = computed(() => this.escalaTexto() < ESCALAS[ESCALAS.length - 1]);
    readonly puedeReducir = computed(() => this.escalaTexto() > ESCALAS[0]);
    readonly activos = computed(() => {
        const ajustes = this._ajustes();
        return (
            ajustes.escalaTexto !== 100 ||
            ajustes.espaciado ||
            ajustes.fuenteLegible ||
            ajustes.altoContraste ||
            ajustes.vision !== 'normal' ||
            ajustes.resaltarEnlaces ||
            ajustes.cursorGrande ||
            ajustes.reducirMovimiento
        );
    });

    constructor() {
        if (typeof document !== 'undefined') {
            effect(() => this.aplicar(this._ajustes()));
        }
    }

    agrandarTexto(): void {
        const actual = this.escalaTexto();
        const siguiente = ESCALAS.find((escala) => escala > actual) ?? actual;
        this.actualizar({ escalaTexto: siguiente });
    }

    reducirTexto(): void {
        const actual = this.escalaTexto();
        const anterior = [...ESCALAS].reverse().find((escala) => escala < actual) ?? actual;
        this.actualizar({ escalaTexto: anterior });
    }

    alternar(clave: Exclude<keyof AjustesAccesibilidad, 'escalaTexto' | 'vision'>): void {
        this.actualizar({ [clave]: !this._ajustes()[clave] } as Partial<AjustesAccesibilidad>);
    }

    cambiarVision(vision: Vision): void {
        this.actualizar({ vision });
    }

    restablecer(): void {
        this._ajustes.set({ ...AJUSTES_POR_DEFECTO });
        this.almacenamiento.guardar(CLAVE, this._ajustes());
        this.aplicar(this._ajustes());
    }

    private actualizar(cambios: Partial<AjustesAccesibilidad>): void {
        const ajustes = this.normalizar({ ...this._ajustes(), ...cambios });
        this._ajustes.set(ajustes);
        this.almacenamiento.guardar(CLAVE, ajustes);
        this.aplicar(ajustes);
    }

    private normalizar(ajustes: AjustesAccesibilidad): AjustesAccesibilidad {
        const escala = ESCALAS.includes(ajustes?.escalaTexto as (typeof ESCALAS)[number])
            ? ajustes.escalaTexto
            : 100;

        return { ...AJUSTES_POR_DEFECTO, ...ajustes, escalaTexto: escala };
    }

    private aplicar(ajustes: AjustesAccesibilidad): void {
        if (typeof document === 'undefined') {
            return;
        }

        const raiz = document.documentElement;

        ESCALAS.forEach((escala) => raiz.classList.remove(`a11y-texto-${escala}`));

        raiz.classList.toggle('a11y-texto-110', ajustes.escalaTexto === 110);
        raiz.classList.toggle('a11y-texto-120', ajustes.escalaTexto === 120);
        raiz.classList.toggle('a11y-texto-130', ajustes.escalaTexto === 130);
        raiz.classList.toggle('a11y-texto-140', ajustes.escalaTexto === 140);
        raiz.classList.toggle('a11y-espaciado', ajustes.espaciado);
        raiz.classList.toggle('a11y-fuente-legible', ajustes.fuenteLegible);
        raiz.classList.toggle('a11y-alto-contraste', ajustes.altoContraste);
        raiz.classList.toggle('a11y-enlaces', ajustes.resaltarEnlaces);
        raiz.classList.toggle('a11y-cursor-grande', ajustes.cursorGrande);
        raiz.classList.toggle('a11y-reducir-movimiento', ajustes.reducirMovimiento);
        raiz.classList.toggle('a11y-vision-grises', ajustes.vision === 'grises');
        raiz.classList.toggle('a11y-vision-protanopia', ajustes.vision === 'protanopia');
        raiz.classList.toggle('a11y-vision-deuteranopia', ajustes.vision === 'deuteranopia');
        raiz.classList.toggle('a11y-vision-tritanopia', ajustes.vision === 'tritanopia');
    }
}
