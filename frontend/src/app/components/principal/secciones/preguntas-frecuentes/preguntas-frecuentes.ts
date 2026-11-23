import { Component } from '@angular/core';

import { PREGUNTAS_FRECUENTES } from '../../../../data/preguntas-frecuentes';

@Component({
  selector: 'app-preguntas-frecuentes',
  templateUrl: './preguntas-frecuentes.html',
})
export class PreguntasFrecuentes {
  readonly preguntasFrecuentes = PREGUNTAS_FRECUENTES;
}
