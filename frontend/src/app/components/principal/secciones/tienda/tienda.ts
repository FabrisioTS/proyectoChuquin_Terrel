import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PRODUCTOS_SEMILLA } from '../../../../data/productos';
import { Producto } from '../../../../interfaces/Producto';

@Component({
  selector: 'app-tienda',
  imports: [RouterLink],
  templateUrl: './tienda.html',
})
export class Tienda {
  readonly accesoriosDestacados: Producto[] = PRODUCTOS_SEMILLA.filter(
    (producto) => producto.categoria === 'Accesorios',
  ).slice(0, 4);

  formatearPrecio(precio: number): string {
    return `S/ ${precio.toFixed(2)}`;
  }
}
