import { Component, signal } from '@angular/core';

import { DocumentoLegal } from './compartidos/documento-legal';
import { ModalLegal } from './compartidos/modal-legal/modal-legal';
import { WhatsappFlotante } from './compartidos/whatsapp-flotante/whatsapp-flotante';
import { Carrusel } from './secciones/carrusel/carrusel';
import { Contacto } from './secciones/contacto/contacto';
import { Equipo } from './secciones/equipo/equipo';
import { Footer } from './secciones/footer/footer';
import { Hero } from './secciones/hero/hero';
import { Navbar } from './secciones/navbar/navbar';
import { Nosotros } from './secciones/nosotros/nosotros';
import { PreguntasFrecuentes } from './secciones/preguntas-frecuentes/preguntas-frecuentes';
import { Servicios } from './secciones/servicios/servicios';
import { Testimonios } from './secciones/testimonios/testimonios';
import { Tienda } from './secciones/tienda/tienda';
import { Ubicacion } from './secciones/ubicacion/ubicacion';

@Component({
  selector: 'app-principal',
  imports: [
    Navbar,
    Hero,
    Carrusel,
    Nosotros,
    Servicios,
    Tienda,
    Equipo,
    Testimonios,
    PreguntasFrecuentes,
    Ubicacion,
    Contacto,
    Footer,
    WhatsappFlotante,
    ModalLegal,
  ],
  templateUrl: './principal.html',
  styleUrl: './principal.css',
})
export class Principal {
  readonly modalLegal = signal<DocumentoLegal | null>(null);

  abrirLegal(tipo: DocumentoLegal): void {
    this.modalLegal.set(tipo);
  }

  cerrarLegal(): void {
    this.modalLegal.set(null);
  }
}
