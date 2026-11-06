import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AutenticacionService } from '../../services/autenticacion-service';

@Component({
  imports: [RouterLink],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
export class Dashboard {
  private autenticacionService = inject(AutenticacionService);
  private router = inject(Router);

  usuarioActual = this.autenticacionService.usuarioActual;

  cerrarSesion(): void {
    this.autenticacionService.cerrar_sesion();
    this.router.navigate(['/login']);
  }
}
