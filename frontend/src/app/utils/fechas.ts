const MESES = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
];

export function aISO(fecha: Date): string {
    const anio = fecha.getFullYear();
    const mes = `${fecha.getMonth() + 1}`.padStart(2, '0');
    const dia = `${fecha.getDate()}`.padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
}

export function hoyISO(): string {
    return aISO(new Date());
}

export function fechaRelativa(dias: number): string {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + dias);
    return aISO(fecha);
}

export function formatearFecha(iso: string): string {
    if (!iso) {
        return '';
    }

    const [anio, mes, dia] = iso.split('-').map(Number);

    if (!anio || !mes || !dia) {
        return iso;
    }

    return `${dia} de ${MESES[mes - 1]} de ${anio}`;
}

export function formatearFechaCorta(iso: string): string {
    if (!iso) {
        return '';
    }

    const [anio, mes, dia] = iso.split('-').map(Number);

    if (!anio || !mes || !dia) {
        return iso;
    }

    return `${dia} ${MESES[mes - 1].slice(0, 3)} ${anio}`;
}

export function diasHasta(iso: string): number {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const [anio, mes, dia] = iso.split('-').map(Number);

    if (!anio || !mes || !dia) {
        return 0;
    }

    const objetivo = new Date(anio, mes - 1, dia);
    objetivo.setHours(0, 0, 0, 0);

    return Math.round((objetivo.getTime() - hoy.getTime()) / 86400000);
}

export function formatearMoneda(monto: number): string {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
    }).format(monto);
}

export function formatearHora(hora: string): string {
    if (!hora) {
        return '';
    }

    const [horas, minutos] = hora.split(':').map(Number);
    const sufijo = horas >= 12 ? 'PM' : 'AM';
    const hora12 = horas % 12 || 12;

    return `${hora12}:${`${minutos}`.padStart(2, '0')} ${sufijo}`;
}
