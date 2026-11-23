export interface Testimonio {
  nombre: string;
  mascota: string;
  iniciales: string;
  texto: string;
}

export const TESTIMONIOS: Testimonio[] = [
  {
    nombre: 'Lucía Ramírez',
    mascota: 'Tutora de Nala',
    iniciales: 'LR',
    texto: 'La atención fue rápida y muy cálida. Nala llegó con dolor de estómago y salió diagnosticada y medicada en menos de una hora.',
  },
  {
    nombre: 'Jorge Huamán',
    mascota: 'Tutor de Rocky',
    iniciales: 'JH',
    texto: 'Me explicaron cada paso del tratamiento con paciencia. Se nota que aman lo que hacen y que el equipamiento es de primer nivel.',
  },
  {
    nombre: 'Camila Torres',
    mascota: 'Tutora de Misha',
    iniciales: 'CT',
    texto: 'El servicio de urgencias 24/7 nos salvó la noche. El equipo respondió de inmediato y nos mantuvo informados todo el tiempo.',
  },
];
