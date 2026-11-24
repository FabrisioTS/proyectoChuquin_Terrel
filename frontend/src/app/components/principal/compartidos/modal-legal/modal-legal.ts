import { Component, computed, input, output } from '@angular/core';

import {
  POLITICA_PRIVACIDAD,
  REGLAS_LIBRO_RECLAMACIONES,
  SeccionLegal,
  TERMINOS_CONDICIONES,
} from '../../../../data/legal';
import { DocumentoLegal } from '../documento-legal';

@Component({
  selector: 'app-modal-legal',
  templateUrl: './modal-legal.html',
})
export class ModalLegal {
  readonly tipo = input.required<DocumentoLegal>();
  readonly cerrar = output<void>();

  readonly titulo = computed(() => {
    switch (this.tipo()) {
      case 'reclamaciones':
        return 'Libro de Reclamaciones';
      case 'terminos':
        return 'Términos y Condiciones';
      case 'privacidad':
        return 'Política de Privacidad';
    }
  });

  readonly subtitulo = computed(() => {
    switch (this.tipo()) {
      case 'reclamaciones':
        return 'Reglas de atención, plazos de respuesta y devoluciones.';
      case 'terminos':
        return 'Condiciones para el uso del portal y de los servicios de la clínica.';
      case 'privacidad':
        return 'Tratamiento y protección de tus datos personales.';
    }
  });

  readonly contenido = computed<SeccionLegal[]>(() => {
    switch (this.tipo()) {
      case 'reclamaciones':
        return REGLAS_LIBRO_RECLAMACIONES;
      case 'terminos':
        return TERMINOS_CONDICIONES;
      case 'privacidad':
        return POLITICA_PRIVACIDAD;
    }
  });
}
