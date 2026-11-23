export interface PreguntaFrecuente {
  pregunta: string;
  respuesta: string;
}

export const PREGUNTAS_FRECUENTES: PreguntaFrecuente[] = [
  {
    pregunta: '¿Necesito reservar una cita para la consulta general?',
    respuesta: 'Recomendamos reservar por el formulario de la página o por WhatsApp para elegir el horario. Las emergencias se atienden sin cita, las 24 horas.',
  },
  {
    pregunta: '¿Qué debo llevar a la primera consulta?',
    respuesta: 'Lleva el carné de vacunas, exámenes previos si los tienes y los datos de contacto del tutor. Si tu mascota toma medicamentos, trae la lista o las cajas.',
  },
  {
    pregunta: '¿Atienden gatos y otras especies?',
    respuesta: 'Sí. Atendemos perros, gatos y pequeños mamíferos. Contamos con salas de espera divididas por especie para reducir el estrés durante la visita.',
  },
  {
    pregunta: '¿Cómo funciona la tienda del portal?',
    respuesta: 'Puedes comprar alimentos, accesorios e insumos desde el portal. Los pedidos se reservan y se pagan al recogerlos en la sede o mediante los canales indicados por el equipo.',
  },
  {
    pregunta: '¿Qué pasa si no puedo asistir a mi cita?',
    respuesta: 'Avísanos con al menos 24 horas de anticipación para reprogramar sin cargo. Las cancelaciones con menos de 12 horas pueden generar un cargo administrativo, según las reglas del Libro de Reclamaciones.',
  },
];
