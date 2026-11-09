import { Injectable, computed, inject, signal } from '@angular/core';
import { AlmacenamientoService } from './almacenamiento-service';
import {
    CategoriaProducto,
    ItemCarrito,
    ItemCarritoDetalle,
    Producto,
} from '../interfaces/Producto';
import { PRODUCTOS_SEMILLA } from '../data/productos';

// v2: catálogo con imágenes reales. La clave anterior se descarta una sola vez.
const CLAVE_PRODUCTOS = 'portal_productos_v2';
const CLAVE_CARRITO = 'portal_carrito_v2';

@Injectable({
    providedIn: 'root',
})
export class ProductosService {
    private almacenamiento = inject(AlmacenamientoService);
    private _productos = signal<Producto[]>(
        this.almacenamiento.leer(CLAVE_PRODUCTOS, PRODUCTOS_SEMILLA),
    );
    private _carrito = signal<ItemCarrito[]>(this.almacenamiento.leer(CLAVE_CARRITO, []));

    readonly productos = this._productos.asReadonly();
    readonly categorias: CategoriaProducto[] = [
        'Alimentos',
        'Juguetes',
        'Higiene',
        'Salud',
        'Accesorios',
    ];

    readonly carrito = this._carrito.asReadonly();

    readonly itemsCarrito = computed<ItemCarritoDetalle[]>(() =>
        this._carrito()
            .map((item) => {
                const producto = this._productos().find(
                    (producto) => producto.id === item.productoId,
                );

                if (!producto) {
                    return null;
                }

                return {
                    producto,
                    cantidad: item.cantidad,
                    subtotal: producto.precio * item.cantidad,
                };
            })
            .filter((item): item is ItemCarritoDetalle => item !== null),
    );

    readonly cantidadTotal = computed(() =>
        this._carrito().reduce((total, item) => total + item.cantidad, 0),
    );

    readonly total = computed(() =>
        this.itemsCarrito().reduce((total, item) => total + item.subtotal, 0),
    );

    agregar(productoId: number): void {
        const producto = this._productos().find((item) => item.id === productoId);

        if (!producto || producto.stock <= 0) {
            return;
        }

        const existente = this._carrito().find((item) => item.productoId === productoId);

        if (existente) {
            if (existente.cantidad >= producto.stock) {
                return;
            }

            this.cambiarCantidad(productoId, existente.cantidad + 1);
            return;
        }

        this._carrito.update((carrito) => [...carrito, { productoId, cantidad: 1 }]);
        this.persistirCarrito();
    }

    cambiarCantidad(productoId: number, cantidad: number): void {
        if (cantidad <= 0) {
            this.quitar(productoId);
            return;
        }

        const producto = this._productos().find((item) => item.id === productoId);
        const cantidadFinal = producto ? Math.min(cantidad, producto.stock) : cantidad;

        this._carrito.update((carrito) =>
            carrito.map((item) =>
                item.productoId === productoId ? { ...item, cantidad: cantidadFinal } : item,
            ),
        );
        this.persistirCarrito();
    }

    descontarStock(items: ItemCarritoDetalle[]): void {
        this._productos.update((productos) =>
            productos.map((producto) => {
                const item = items.find((detalle) => detalle.producto.id === producto.id);

                if (!item) {
                    return producto;
                }

                return {
                    ...producto,
                    stock: Math.max(0, producto.stock - item.cantidad),
                };
            }),
        );
        this.almacenamiento.guardar(CLAVE_PRODUCTOS, this._productos());
    }

    quitar(productoId: number): void {
        this._carrito.update((carrito) =>
            carrito.filter((item) => item.productoId !== productoId),
        );
        this.persistirCarrito();
    }

    vaciarCarrito(): void {
        this._carrito.set([]);
        this.persistirCarrito();
    }

    private persistirCarrito(): void {
        this.almacenamiento.guardar(CLAVE_CARRITO, this._carrito());
    }
}
