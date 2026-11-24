import { Component } from '@angular/core';

import { TESTIMONIOS } from '../../../../data/testimonios';

@Component({
  selector: 'app-testimonios',
  templateUrl: './testimonios.html',
})
export class Testimonios {
  readonly testimonios = TESTIMONIOS;
}
