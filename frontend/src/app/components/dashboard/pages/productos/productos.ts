import { Component, computed, inject, signal } from '@angular/core';

import { ProductosService } from '../../../../services/productos-service';
import { PagosService } from '../../../../services/pagos-service';
import { BusquedaService } from '../../../../services/busqueda-service';
import { CategoriaProducto, Producto } from '../../../../interfaces/Producto';
import { formatearMoneda } from '../../../../utils/fechas';

type FiltroCategoria = 'Todas' | CategoriaProducto;

@Component({
    selector: 'app-productos',
    templateUrl: './productos.html',
})
export class Productos {
    private productosService = inject(ProductosService);
    private pagosService = inject(PagosService);
    private busquedaService = inject(BusquedaService);

    readonly categorias = this.productosService.categorias;
    readonly categoria = signal<FiltroCategoria>('Todas');
    readonly itemsCarrito = this.productosService.itemsCarrito;
    readonly cantidadTotal = this.productosService.cantidadTotal;
    readonly total = this.productosService.total;

    readonly productos = computed(() => {
        const categoria = this.categoria();
        const termino = this.busquedaService.termino().toLowerCase().trim();

        return this.productosService.productos().filter((producto) => {
            const coincideCategoria = categoria === 'Todas' || producto.categoria === categoria;
            const coincideBusqueda =
                !termino ||
                `${producto.nombre} ${producto.categoria} ${producto.descripcion}`
                    .toLowerCase()
                    .includes(termino);

            return coincideCategoria && coincideBusqueda;
        });
    });

    cambiarCategoria(categoria: FiltroCategoria): void {
        this.categoria.set(categoria);
    }

    agregar(producto: Producto): void {
        this.productosService.agregar(producto.id);
    }

    aumentar(producto: Producto): void {
        this.productosService.agregar(producto.id);
    }

    disminuir(producto: Producto): void {
        const cantidad = this.cantidadEnCarrito(producto.id);
        this.productosService.cambiarCantidad(producto.id, cantidad - 1);
    }

    quitar(producto: Producto): void {
        this.productosService.quitar(producto.id);
    }

    cantidadEnCarrito(productoId: number): number {
        return (
            this.productosService.carrito().find((item) => item.productoId === productoId)?.cantidad ?? 0
        );
    }

    async finalizarCompra(): Promise<void> {
        const items = this.itemsCarrito();

        if (items.length === 0) {
            return;
        }

        const detalle = items
            .map(
                (item) =>
                    `<p style="display:flex;justify-content:space-between;gap:16px;margin:4px 0">
                        <span>${item.cantidad} x ${item.producto.nombre}</span>
                        <strong>${formatearMoneda(item.subtotal)}</strong>
                    </p>`,
            )
            .join('');

        try {
            const { default: Swal } = await import('sweetalert2');
            const resultado = await Swal.fire({
                title: 'Confirmar compra',
                html: `
                    <div style="text-align:left;font-size:12px;color:#334155;line-height:1.6">
                        ${detalle}
                        <hr style="margin:12px 0;border-color:#e2e8f0" />
                        <p style="display:flex;justify-content:space-between;font-size:16px;font-weight:800">
                            <span>Total</span>
                            <span style="color:#005c53">${formatearMoneda(this.total())}</span>
                        </p>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Pagar y generar comprobante',
                cancelButtonText: 'Seguir comprando',
                confirmButtonColor: '#005c53',
            });

            if (!resultado.isConfirmed) {
                return;
            }

            this.pagosService.registrar(
                `Compra de productos (${this.cantidadTotal()} artículos)`,
                this.total(),
                undefined,
                'Tarjeta',
            );
            this.productosService.descontarStock(items);
            this.productosService.vaciarCarrito();

            await Swal.fire({
                icon: 'success',
                title: 'Compra registrada',
                text: 'El comprobante fue generado en la sección Pagos / Comprobantes.',
                confirmButtonColor: '#005c53',
            });
        } catch {
            // Si el modal falla, no se altera el carrito.
        }
    }

    readonly formatearMoneda = formatearMoneda;
}
