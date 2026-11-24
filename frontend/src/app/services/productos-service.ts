import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { manejarErrorHttp } from '../utils/error-http';
import {
    CategoriaProducto,
    ItemCarrito,
    ItemCarritoDetalle,
    Producto,
} from '../interfaces/Producto';

interface ProductoApi {
    id: number;
    nombre: string;
    categoria: string;
    precio: number;
    stock: number;
    descripcion: string | null;
    emoji: string | null;
    imagen: string | null;
    activo: boolean;
}

function mapearProducto(api: ProductoApi): Producto {
    return {
        id: api.id,
        nombre: api.nombre,
        categoria: api.categoria as CategoriaProducto,
        precio: api.precio,
        stock: api.stock,
        descripcion: api.descripcion ?? '',
        emoji: api.emoji ?? '',
        imagen: api.imagen ?? '',
    };
}

@Injectable({
    providedIn: 'root',
})
export class ProductosService {
    private http = inject(HttpClient);
    private readonly API = `${environment.apiUrl}/productos`;

    private _productos = signal<Producto[]>([]);
    private _carrito = signal<ItemCarrito[]>([]);

    readonly cargando = signal(false);
    readonly error = signal<string | null>(null);

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

    async cargar(): Promise<void> {
        this.cargando.set(true);
        this.error.set(null);

        try {
            const datos = await firstValueFrom(
                this.http
                    .get<ProductoApi[]>(`${this.API}/`)
                    .pipe(catchError(manejarErrorHttp)),
            );
            this._productos.set(datos.map(mapearProducto));
        } catch (error) {
            this.error.set((error as Error).message);
        } finally {
            this.cargando.set(false);
        }
    }

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
    }

    quitar(productoId: number): void {
        this._carrito.update((carrito) =>
            carrito.filter((item) => item.productoId !== productoId),
        );
    }

    vaciarCarrito(): void {
        this._carrito.set([]);
    }
}
