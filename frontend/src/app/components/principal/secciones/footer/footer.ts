import { Component, output } from '@angular/core';

import { mostrarAlerta } from '../../../../utils/alertas';
import { DocumentoLegal } from '../../compartidos/documento-legal';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
})
export class Footer {
  readonly abrirLegal = output<DocumentoLegal>();

  async suscribirNewsletter(evento: Event): Promise<void> {
    evento.preventDefault();

    const formulario = evento.target as HTMLFormElement;
    const datos = new FormData(formulario);
    const email = String(datos.get('email') ?? '').trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      await mostrarAlerta(
        'error',
        'Correo inválido',
        'Ingresa un correo electrónico válido para unirte al Club Pariona Pet.',
      );
      return;
    }

    await mostrarAlerta(
      'success',
      '¡Bienvenido al Club Pariona Pet!',
      'Te enviaremos consejos veterinarios, recordatorios de vacunación y promociones exclusivas.',
    );

    formulario.reset();
  }
}
