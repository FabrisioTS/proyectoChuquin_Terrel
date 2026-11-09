import { Injectable, computed, inject } from '@angular/core';
import { CitasService } from './citas-service';
import { VacunasService } from './vacunas-service';
import { PagosService } from './pagos-service';
import { Notificacion } from '../interfaces/Notificacion';
import { formatearFecha, formatearMoneda } from '../utils/fechas';

@Injectable({
    providedIn: 'root',
})
export class NotificacionesService {
    private citas = inject(CitasService);
    private vacunas = inject(VacunasService);
    private pagos = inject(PagosService);

    readonly notificaciones = computed<Notificacion[]>(() => {
        const lista: Notificacion[] = [];

        for (const cita of this.citas.proximas().slice(0, 3)) {
            lista.push({
                id: `cita-${cita.id}`,
                tipo: 'cita',
                titulo: `Cita de ${cita.mascotaNombre}`,
                detalle: `${formatearFecha(cita.fecha)} • ${cita.hora} • ${cita.doctor}`,
                ruta: '/dashboard/citas',
            });
        }

        for (const vacuna of this.vacunas.proximas().slice(0, 3)) {
            lista.push({
                id: `vacuna-${vacuna.id}`,
                tipo: 'vacuna',
                titulo: `Refuerzo de ${vacuna.mascotaNombre}`,
                detalle: `${vacuna.nombre} • ${formatearFecha(vacuna.proximaDosis)}`,
                ruta: '/dashboard/vacunas',
            });
        }

        for (const pago of this.pagos.pendientes().slice(0, 2)) {
            lista.push({
                id: `pago-${pago.id}`,
                tipo: 'pago',
                titulo: `Pago ${pago.estado.toLowerCase()}`,
                detalle: `${pago.concepto} • ${formatearMoneda(pago.monto)}`,
                ruta: '/dashboard/pagos',
            });
        }

        return lista;
    });

    readonly total = computed(() => this.notificaciones().length);
}
