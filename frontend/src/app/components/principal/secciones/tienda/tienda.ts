import { Component, OnInit, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ProductosService } from '../../../../services/productos-service';
import { PRODUCTOS_SEMILLA } from '../../../../data/productos';
import { Producto } from '../../../../interfaces/Producto';

@Component({
  selector: 'app-tienda',
  imports: [RouterLink],
  templateUrl: './tienda.html',
})
export class Tienda implements OnInit {
  private productosService = inject(ProductosService);

  readonly accesoriosDestacados = computed<Producto[]>(() => {
    const desdeApi = this.productosService
      .productos()
      .filter((producto) => producto.categoria === 'Accesorios');

    if (desdeApi.length > 0) {
      return desdeApi.slice(0, 4);
    }

    return PRODUCTOS_SEMILLA.filter(
      (producto) => producto.categoria === 'Accesorios',
    ).slice(0, 4);
  });

  ngOnInit(): void {
    if (this.productosService.productos().length === 0) {
      void this.productosService.cargar();
    }
  }

  formatearPrecio(precio: number): string {
    return `S/ ${precio.toFixed(2)}`;
  }
}
