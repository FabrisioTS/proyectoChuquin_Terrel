import { Component, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { mostrarAlerta } from '../../../../utils/alertas';
import { SolicitudesService } from '../../../../services/solicitudes-service';
import { SolicitudCitaFormulario } from '../../../../interfaces/Solicitud';

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.html',
})
export class Contacto {
  private solicitudesService = inject(SolicitudesService);
  readonly cargando = signal(false);

  async enviarSolicitudCita(evento: Event): Promise<void> {
    evento.preventDefault();

    const formulario = evento.target as HTMLFormElement;
    const datos = new FormData(formulario);
    const tipoMascota = (String(datos.get('pet_type') ?? 'perro').toLowerCase()) as 'perro' | 'gato' | 'otro';
    const nombre = String(datos.get('nombre') ?? '').trim();
    const mascota = String(datos.get('mascota') ?? '').trim();
    const telefono = String(datos.get('telefono') ?? '').replace(/\D/g, '');
    const servicio = String(datos.get('servicio') ?? 'Consulta Preventiva').trim();
    const fecha = String(datos.get('fecha') ?? '').trim() || null;
    const turno = String(datos.get('turno') ?? '').trim() || null;
    const notas = String(datos.get('notas') ?? '').trim() || null;

    if (nombre.length < 2) {
      await mostrarAlerta(
        'error',
        'Revisa tu nombre',
        'Ingresa el nombre completo del propietario.',
      );
      return;
    }

    if (mascota.length < 2) {
      await mostrarAlerta(
        'error',
        'Revisa el nombre de tu mascota',
        'Ingresa el nombre de tu mascota.',
      );
      return;
    }

    if (!/^9\d{8}$/.test(telefono)) {
      await mostrarAlerta(
        'error',
        'Teléfono inválido',
        'Ingresa un número de celular de 9 dígitos que empiece con 9. Ejemplo: 987654321.',
      );
      return;
    }

    const payload: SolicitudCitaFormulario = {
      tipo_mascota: tipoMascota,
      nombre_propietario: nombre,
      telefono,
      nombre_mascota: mascota,
      servicio,
      fecha_deseada: fecha,
      turno,
      notas,
    };

    this.cargando.set(true);

    try {
      const respuesta = await firstValueFrom(
        this.solicitudesService.enviarSolicitud(payload)
      );

      await mostrarAlerta(
        'success',
        '¡Solicitud enviada correctamente!',
        `Gracias, ${nombre}. La solicitud #${respuesta.id} para ${mascota} quedó registrada en nuestro sistema. Nuestro equipo se comunicará contigo al ${telefono} para confirmar el turno.`,
      );

      formulario.reset();
    } catch (error) {
      await mostrarAlerta(
        'error',
        'No se pudo registrar la solicitud',
        (error as Error).message || 'Ocurrió un error al contactar al servidor. Por favor, inténtalo nuevamente.',
      );
    } finally {
      this.cargando.set(false);
    }
  }
}
