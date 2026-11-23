import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  DestroyRef,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';

interface FotoCarrusel {
  src: string;
  alt: string;
  etiqueta: string;
  titulo: string;
}

const INTERVALO_MS = 4000;
const DURACION_TRANSICION_MS = 700;

@Component({
  selector: 'app-carrusel',
  templateUrl: './carrusel.html',
})
export class Carrusel {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);
  private temporizador: ReturnType<typeof setInterval> | null = null;
  private reinicio: ReturnType<typeof setTimeout> | null = null;

  readonly fotos: FotoCarrusel[] = [
    {
      src: 'images/perrop.jpeg',
      alt: 'Perro atendido en la Clínica Veterinaria Pariona',
      etiqueta: 'Paciente canino',
      titulo: 'Atención integral para perros',
    },
    {
      src: 'images/pug.jpeg',
      alt: 'Pug en la Clínica Veterinaria Pariona',
      etiqueta: 'Paciente canino',
      titulo: 'Cada mascota, un trato único',
    },
    {
      src: 'images/snauser.png',
      alt: 'Schnauzer en la Clínica Veterinaria Pariona',
      etiqueta: 'Paciente canino',
      titulo: 'Cuidado en cada etapa de su vida',
    },
    {
      src: 'images/snauser2.jpeg',
      alt: 'Schnauzer durante su consulta en la clínica',
      etiqueta: 'Paciente canino',
      titulo: 'Diagnósticos con equipos modernos',
    },
    {
      src: 'images/gato.jpg',
      alt: 'Gato atendido en la Clínica Veterinaria Pariona',
      etiqueta: 'Paciente felino',
      titulo: 'Espacios pensados para gatos',
    },
    {
      src: 'images/gatochino.jpeg',
      alt: 'Gato curioso en la Clínica Veterinaria Pariona',
      etiqueta: 'Paciente felino',
      titulo: 'Menos estrés, más bienestar',
    },
    {
      src: 'images/gatosiames.jpeg',
      alt: 'Gato siamés en la Clínica Veterinaria Pariona',
      etiqueta: 'Paciente felino',
      titulo: 'Acompañamiento en cada visita',
    },
  ];

  /** Copia duplicada para que el desplazamiento sea continuo e infinito. */
  readonly slides: FotoCarrusel[] = [...this.fotos, ...this.fotos];

  readonly indice = signal(0);
  readonly pausado = signal(false);
  readonly sinTransicion = signal(false);

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.temporizador = setInterval(() => {
      if (!this.pausado()) {
        this.siguiente();
      }
    }, INTERVALO_MS);

    this.destroyRef.onDestroy(() => this.detener());
  }

  siguiente(): void {
    this.cancelarReinicio();

    const total = this.fotos.length;

    if (this.indice() >= total) {
      this.saltarSinAnimacion(0);
      return;
    }

    this.indice.update((indice) => indice + 1);

    // Al llegar al clon de la primera imagen, se vuelve al inicio sin animación.
    if (this.indice() === total) {
      this.reinicio = setTimeout(
        () => this.saltarSinAnimacion(0),
        DURACION_TRANSICION_MS + 60,
      );
    }
  }

  anterior(): void {
    this.cancelarReinicio();

    const total = this.fotos.length;

    if (this.indice() === 0) {
      // Salta al clon final y retrocede una posición para no cortar la animación.
      this.sinTransicion.set(true);
      this.indice.set(total);

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.sinTransicion.set(false);
          this.indice.set(total - 1);
        });
      });

      return;
    }

    this.indice.update((indice) => indice - 1);
  }

  irA(indice: number): void {
    this.cancelarReinicio();
    this.sinTransicion.set(false);
    this.indice.set(indice);
  }

  pausar(): void {
    this.pausado.set(true);
  }

  reanudar(): void {
    this.pausado.set(false);
  }

  private saltarSinAnimacion(indice: number): void {
    this.sinTransicion.set(true);
    this.indice.set(indice);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => this.sinTransicion.set(false));
    });
  }

  private cancelarReinicio(): void {
    if (this.reinicio !== null) {
      clearTimeout(this.reinicio);
      this.reinicio = null;
    }
  }

  private detener(): void {
    if (this.temporizador !== null) {
      clearInterval(this.temporizador);
      this.temporizador = null;
    }

    this.cancelarReinicio();
  }
}
