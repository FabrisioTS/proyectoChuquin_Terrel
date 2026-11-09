import { Injectable, computed, inject, signal } from '@angular/core';
import { AlmacenamientoService } from './almacenamiento-service';
import { Mascota, MascotaFormulario } from '../interfaces/Mascota';

const CLAVE = 'portal_mascotas_v1';

@Injectable({
    providedIn: 'root',
})
export class MascotasService {
    private almacenamiento = inject(AlmacenamientoService);
    private _mascotas = signal<Mascota[]>(this.almacenamiento.leer(CLAVE, this.semilla()));

    readonly mascotas = this._mascotas.asReadonly();
    readonly total = computed(() => this._mascotas().length);
    readonly nombres = computed(() => this._mascotas().map((mascota) => mascota.nombre).join(' y '));

    crear(datos: MascotaFormulario): Mascota {
        const mascota: Mascota = {
            ...datos,
            id: this.siguienteId(),
            foto: datos.foto ?? '',
        };

        this._mascotas.update((mascotas) => [...mascotas, mascota]);
        this.persistir();
        return mascota;
    }

    actualizar(id: number, datos: MascotaFormulario): void {
        this._mascotas.update((mascotas) =>
            mascotas.map((mascota) =>
                mascota.id === id
                    ? { ...mascota, ...datos, foto: datos.foto ?? mascota.foto }
                    : mascota,
            ),
        );
        this.persistir();
    }

    eliminar(id: number): void {
        this._mascotas.update((mascotas) => mascotas.filter((mascota) => mascota.id !== id));
        this.persistir();
    }

    obtener(id: number): Mascota | undefined {
        return this._mascotas().find((mascota) => mascota.id === id);
    }

    private siguienteId(): number {
        return this._mascotas().reduce((maximo, mascota) => Math.max(maximo, mascota.id), 0) + 1;
    }

    private persistir(): void {
        this.almacenamiento.guardar(CLAVE, this._mascotas());
    }

    private semilla(): Mascota[] {
        return [
            {
                id: 1,
                nombre: 'Simba',
                especie: 'CANINO',
                raza: 'Golden Retriever',
                edad: 5,
                sexo: 'Macho castrado',
                peso: 31.5,
                microchip: '#7890-PER-2021',
                diagnostico: 'Salud Óptima',
                cobertura: 'Plan Preventivo Senior',
                foto: 'https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=200&auto=format&fit=crop',
            },
            {
                id: 2,
                nombre: 'Milo',
                especie: 'FELINO',
                raza: 'Gato Europeo Atigrado',
                edad: 3,
                sexo: 'Macho',
                peso: 4.8,
                microchip: '#4512-PER-2023',
                diagnostico: 'Tratamiento dermatológico al día',
                cobertura: 'Plan Esencial Felino',
                foto: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=200&auto=format&fit=crop',
            },
        ];
    }
}
