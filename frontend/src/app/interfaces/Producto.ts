export type CategoriaProducto = 'Alimentos' | 'Juguetes' | 'Higiene' | 'Salud' | 'Accesorios';

export interface Producto {
    id: number;
    nombre: string;
    categoria: CategoriaProducto;
    precio: number;
    stock: number;
    descripcion: string;
    emoji: string;
    imagen: string;
}

export interface ItemCarrito {
    productoId: number;
    cantidad: number;
}

export interface ItemCarritoDetalle {
    producto: Producto;
    cantidad: number;
    subtotal: number;
}
