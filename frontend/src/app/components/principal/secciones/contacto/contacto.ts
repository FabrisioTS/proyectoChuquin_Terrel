import { Component } from '@angular/core';

import { mostrarAlerta } from '../../../../utils/alertas';

@Component({
  selector: 'app-contacto',
  templateUrl: './contacto.html',
})
export class Contacto {
  async enviarSolicitudCita(evento: Event): Promise<void> {
    evento.preventDefault();

    const formulario = evento.target as HTMLFormElement;
    const datos = new FormData(formulario);
    const nombre = String(datos.get('nombre') ?? '').trim();
    const mascota = String(datos.get('mascota') ?? '').trim();
    const telefono = String(datos.get('telefono') ?? '').replace(/\D/g, '');

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

    await mostrarAlerta(
      'success',
      '¡Solicitud enviada!',
      `Gracias, ${nombre}. Recibimos la solicitud para ${mascota}. Nuestro equipo se comunicará contigo al ${telefono} para confirmar la cita.`,
    );

    formulario.reset();
  }
}
