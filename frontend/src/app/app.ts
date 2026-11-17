import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Accesibilidad } from './components/accesibilidad/accesibilidad';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Accesibilidad],
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('fronted');
}
