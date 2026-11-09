import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PRODUCTOS_SEMILLA } from '../../data/productos';
import {
  POLITICA_PRIVACIDAD,
  REGLAS_LIBRO_RECLAMACIONES,
  SeccionLegal,
  TERMINOS_CONDICIONES,
} from '../../data/legal';
import { Producto } from '../../interfaces/Producto';

type ModalLegal = 'reclamaciones' | 'terminos' | 'privacidad' | null;

interface Testimonio {
  nombre: string;
  mascota: string;
  iniciales: string;
  texto: string;
}

interface PreguntaFrecuente {
  pregunta: string;
  respuesta: string;
}

@Component({
  selector: 'app-principal',
  imports: [RouterLink],
  templateUrl: './principal.html',
  styleUrl: './principal.css'
})
export class Principal {
  readonly accesoriosDestacados: Producto[] = PRODUCTOS_SEMILLA
    .filter((producto) => producto.categoria === 'Accesorios')
    .slice(0, 4);

  readonly testimonios: Testimonio[] = [
    {
      nombre: 'Lucía Ramírez',
      mascota: 'Tutora de Nala',
      iniciales: 'LR',
      texto: 'La atención fue rápida y muy cálida. Nala llegó con dolor de estómago y salió diagnosticada y medicada en menos de una hora.',
    },
    {
      nombre: 'Jorge Huamán',
      mascota: 'Tutor de Rocky',
      iniciales: 'JH',
      texto: 'Me explicaron cada paso del tratamiento con paciencia. Se nota que aman lo que hacen y que el equipamiento es de primer nivel.',
    },
    {
      nombre: 'Camila Torres',
      mascota: 'Tutora de Misha',
      iniciales: 'CT',
      texto: 'El servicio de urgencias 24/7 nos salvó la noche. El equipo respondió de inmediato y nos mantuvo informados todo el tiempo.',
    },
  ];

  readonly preguntasFrecuentes: PreguntaFrecuente[] = [
    {
      pregunta: '¿Necesito reservar una cita para la consulta general?',
      respuesta: 'Recomendamos reservar por el formulario de la página o por WhatsApp para elegir el horario. Las emergencias se atienden sin cita, las 24 horas.',
    },
    {
      pregunta: '¿Qué debo llevar a la primera consulta?',
      respuesta: 'Lleva el carné de vacunas, exámenes previos si los tienes y los datos de contacto del tutor. Si tu mascota toma medicamentos, trae la lista o las cajas.',
    },
    {
      pregunta: '¿Atienden gatos y otras especies?',
      respuesta: 'Sí. Atendemos perros, gatos y pequeños mamíferos. Contamos con salas de espera divididas por especie para reducir el estrés durante la visita.',
    },
    {
      pregunta: '¿Cómo funciona la tienda del portal?',
      respuesta: 'Puedes comprar alimentos, accesorios e insumos desde el portal. Los pedidos se reservan y se pagan al recogerlos en la sede o mediante los canales indicados por el equipo.',
    },
    {
      pregunta: '¿Qué pasa si no puedo asistir a mi cita?',
      respuesta: 'Avísanos con al menos 24 horas de anticipación para reprogramar sin cargo. Las cancelaciones con menos de 12 horas pueden generar un cargo administrativo, según las reglas del Libro de Reclamaciones.',
    },
  ];

  readonly modalLegal = signal<ModalLegal>(null);

  readonly tituloModal = computed(() => {
    switch (this.modalLegal()) {
      case 'reclamaciones':
        return 'Libro de Reclamaciones';
      case 'terminos':
        return 'Términos y Condiciones';
      case 'privacidad':
        return 'Política de Privacidad';
      default:
        return '';
    }
  });

  readonly subtituloModal = computed(() => {
    switch (this.modalLegal()) {
      case 'reclamaciones':
        return 'Reglas de atención, plazos de respuesta y devoluciones.';
      case 'terminos':
        return 'Condiciones para el uso del portal y de los servicios de la clínica.';
      case 'privacidad':
        return 'Tratamiento y protección de tus datos personales.';
      default:
        return '';
    }
  });

  readonly contenidoModal = computed<SeccionLegal[]>(() => {
    switch (this.modalLegal()) {
      case 'reclamaciones':
        return REGLAS_LIBRO_RECLAMACIONES;
      case 'terminos':
        return TERMINOS_CONDICIONES;
      case 'privacidad':
        return POLITICA_PRIVACIDAD;
      default:
        return [];
    }
  });

  abrirLegal(tipo: Exclude<ModalLegal, null>): void {
    this.modalLegal.set(tipo);
  }

  cerrarLegal(): void {
    this.modalLegal.set(null);
  }

  formatearPrecio(precio: number): string {
    return `S/ ${precio.toFixed(2)}`;
  }

  async enviarSolicitudCita(evento: Event): Promise<void> {
    evento.preventDefault();

    const formulario = evento.target as HTMLFormElement;
    const datos = new FormData(formulario);
    const nombre = String(datos.get('nombre') ?? '').trim();
    const mascota = String(datos.get('mascota') ?? '').trim();
    const telefono = String(datos.get('telefono') ?? '').replace(/\D/g, '');

    if (nombre.length < 2) {
      await this.alerta('error', 'Revisa tu nombre', 'Ingresa el nombre completo del propietario.');
      return;
    }

    if (mascota.length < 2) {
      await this.alerta('error', 'Revisa el nombre de tu mascota', 'Ingresa el nombre de tu mascota.');
      return;
    }

    if (!/^9\d{8}$/.test(telefono)) {
      await this.alerta(
        'error',
        'Teléfono inválido',
        'Ingresa un número de celular de 9 dígitos que empiece con 9. Ejemplo: 987654321.',
      );
      return;
    }

    await this.alerta(
      'success',
      '¡Solicitud enviada!',
      `Gracias, ${nombre}. Recibimos la solicitud para ${mascota}. Nuestro equipo se comunicará contigo al ${telefono} para confirmar la cita.`,
    );

    formulario.reset();
  }

  async suscribirNewsletter(evento: Event): Promise<void> {
    evento.preventDefault();

    const formulario = evento.target as HTMLFormElement;
    const datos = new FormData(formulario);
    const email = String(datos.get('email') ?? '').trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      await this.alerta(
        'error',
        'Correo inválido',
        'Ingresa un correo electrónico válido para unirte al Club Pariona Pet.',
      );
      return;
    }

    await this.alerta(
      'success',
      '¡Bienvenido al Club Pariona Pet!',
      'Te enviaremos consejos veterinarios, recordatorios de vacunación y promociones exclusivas.',
    );

    formulario.reset();
  }

  private async alerta(
    icono: 'success' | 'error' | 'info',
    titulo: string,
    texto: string,
  ): Promise<void> {
    try {
      const { default: Swal } = await import('sweetalert2');
      await Swal.fire({
        icon: icono,
        title: titulo,
        text: texto,
        confirmButtonText: 'Aceptar',
        confirmButtonColor: '#059669',
      });
    } catch {
      // Si el modal no está disponible, la página sigue funcionando.
    }
  }
}
