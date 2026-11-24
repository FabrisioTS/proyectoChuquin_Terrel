export interface SeccionLegal {
    titulo: string;
    parrafos: string[];
}

/**
 * Reglas de negocio del Libro de Reclamaciones Virtual.
 * Contenido informativo de ejemplo para el portal de la clínica.
 */
export const REGLAS_LIBRO_RECLAMACIONES: SeccionLegal[] = [
    {
        titulo: '1. Objeto del Libro de Reclamaciones',
        parrafos: [
            'Este canal permite registrar reclamos y quejas sobre los productos o servicios brindados por Clínica Pariona. Es gratuito, confidencial y no requiere la compra previa de ningún producto.',
            'Un reclamo expresa una disconformidad relacionada con el producto o servicio. Una queja expresa un malestar relacionado con la atención recibida.',
        ],
    },
    {
        titulo: '2. Datos obligatorios del usuario',
        parrafos: [
            'Para registrar un caso se solicitan nombres y apellidos completos, DNI o documento de identidad, domicilio, correo electrónico, teléfono de contacto y la descripción clara de los hechos.',
            'El caso debe incluir el pedido concreto del usuario y, de ser posible, la fecha, sede, número de atención o comprobante relacionado.',
        ],
    },
    {
        titulo: '3. Plazo de respuesta',
        parrafos: [
            'La clínica responderá el reclamo o queja en un plazo máximo de quince (15) días hábiles contados desde el día siguiente a su registro.',
            'Cuando la complejidad del caso lo requiera, el plazo podrá extenderse hasta treinta (30) días hábiles, comunicando la ampliación al correo o teléfono registrado.',
        ],
    },
    {
        titulo: '4. Reglas de atención y citas',
        parrafos: [
            'Las citas reservadas por el portal deben confirmarse con al menos 24 horas de anticipación. La tolerancia de llegada es de 15 minutos; pasado ese tiempo, la atención podrá reprogramarse según disponibilidad.',
            'Las cancelaciones realizadas con menos de 12 horas de anticipación podrán generar un cargo administrativo equivalente al 20% del servicio reservado.',
        ],
    },
    {
        titulo: '5. Pagos, productos y devoluciones',
        parrafos: [
            'Los pagos se registran en soles peruanos y el comprobante se emite de forma digital en la sección Pagos del portal.',
            'Los productos sin uso, con etiqueta original y dentro de los siete (7) días calendario de la compra, pueden solicitarse para cambio o devolución presentando el comprobante.',
            'Por razones sanitarias, los medicamentos, alimentos abiertos y productos de higiene usados no son retornables.',
        ],
    },
    {
        titulo: '6. Emergencias y responsabilidad',
        parrafos: [
            'El Libro de Reclamaciones no reemplaza la atención de emergencia. Ante una urgencia vital, el usuario debe acudir de inmediato a la sede 24/7 o llamar a la línea de atención.',
            'La clínica no se responsabiliza por demoras ocasionadas por información incompleta, datos de contacto erróneos o incumplimiento de las indicaciones médicas.',
        ],
    },
    {
        titulo: '7. Confidencialidad y contacto',
        parrafos: [
            'Los datos registrados se utilizan únicamente para gestionar el reclamo o queja y se conservan conforme a la normativa de protección de datos personales.',
            'Para consultas adicionales puede escribir a citas@clinicapariona.com o llamar al +51 914 821 538. Atención administrativa: lunes a sábado de 8:00 a 20:00 horas.',
        ],
    },
];

/**
 * Términos y condiciones aceptados al crear una cuenta de propietario.
 */
export const TERMINOS_CONDICIONES: SeccionLegal[] = [
    {
        titulo: '1. Aceptación de los términos',
        parrafos: [
            'Al crear una cuenta en el Portal Mi Mascota de Clínica Pariona, el usuario declara haber leído y aceptado estos Términos y Condiciones y la Política de Privacidad.',
            'Si el usuario no está de acuerdo con alguna disposición, no debe completar el registro ni utilizar los servicios digitales de la clínica.',
        ],
    },
    {
        titulo: '2. Datos veraces y uso de la cuenta',
        parrafos: [
            'El usuario se compromete a proporcionar nombres, apellidos, correo, teléfono y DNI verdaderos, completos y actualizados. La cuenta es personal e intransferible.',
            'El usuario es responsable de mantener la confidencialidad de su contraseña y de toda actividad realizada desde su cuenta. Debe comunicar de inmediato cualquier uso no autorizado.',
        ],
    },
    {
        titulo: '3. Privacidad de los datos médicos',
        parrafos: [
            'La información clínica de las mascotas se utiliza para gestionar citas, historiales, vacunas, recetas y recordatorios preventivos.',
            'Los datos personales y clínicos se tratan conforme a la Ley N.° 29733 de Protección de Datos Personales. El usuario puede solicitar acceso, rectificación o eliminación escribiendo a citas@clinicapariona.com.',
        ],
    },
    {
        titulo: '4. Citas, cancelaciones y atención',
        parrafos: [
            'Las citas solicitadas por el portal quedan sujetas a confirmación por parte del equipo de la clínica. El usuario recibirá la confirmación por correo o WhatsApp.',
            'Se recomienda cancelar o reprogramar con al menos 24 horas de anticipación. La tolerancia de llegada es de 15 minutos y las citas no asistidas podrán ser reasignadas.',
        ],
    },
    {
        titulo: '5. Pagos, compras y comprobantes',
        parrafos: [
            'Los precios de productos y servicios se muestran en soles peruanos e incluyen los impuestos aplicables cuando corresponda. Los pagos realizados en el portal generan un comprobante digital en la sección Pagos.',
            'Las compras de productos están sujetas a disponibilidad de stock. Los cambios o devoluciones se rigen por la normativa del consumidor y por las reglas del Libro de Reclamaciones.',
        ],
    },
    {
        titulo: '6. Emergencias y límites del portal',
        parrafos: [
            'El portal permite gestionar información y solicitar citas, pero no reemplaza una consulta veterinaria presencial ni la atención de emergencia.',
            'Ante signos de gravedad, el usuario debe acudir de inmediato a la sede 24/7 o comunicarse con la línea de urgencias.',
        ],
    },
    {
        titulo: '7. Propiedad intelectual y modificaciones',
        parrafos: [
            'El contenido, las marcas, los textos, las imágenes y el diseño del portal son propiedad de Clínica Pariona o se utilizan con autorización. No se permite su reproducción sin consentimiento.',
            'La clínica podrá actualizar estos términos y condiciones. Las modificaciones se publicarán en el portal y regirán desde su publicación.',
        ],
    },
    {
        titulo: '8. Contacto',
        parrafos: [
            'Para consultas sobre estos términos, el usuario puede escribir a citas@clinicapariona.com o llamar al +51 914 821 538.',
        ],
    },
];

/**
 * Política de privacidad mostrada en el footer.
 */
export const POLITICA_PRIVACIDAD: SeccionLegal[] = [
    {
        titulo: '1. Responsable del tratamiento',
        parrafos: [
            'Clínica Pariona es responsable de los datos personales registrados en su portal. La sede principal se encuentra en Av. Francisco Solano 640, San Carlos, Huancayo, Junín, Perú.',
        ],
    },
    {
        titulo: '2. Datos que recopilamos',
        parrafos: [
            'Recopilamos los datos que el usuario proporciona al registrarse: nombres, apellidos, correo electrónico, teléfono y DNI. También registramos la información clínica de las mascotas que el usuario decide incorporar.',
        ],
    },
    {
        titulo: '3. Finalidad del tratamiento',
        parrafos: [
            'Los datos se utilizan para crear y administrar la cuenta, gestionar citas, historiales, vacunas, pagos, comprobantes y recordatorios preventivos, así como para responder consultas y reclamos.',
        ],
    },
    {
        titulo: '4. Conservación y seguridad',
        parrafos: [
            'La información se conserva durante el tiempo necesario para cumplir las finalidades descritas y las obligaciones legales aplicables. Aplicamos medidas razonables de seguridad para protegerla.',
        ],
    },
    {
        titulo: '5. Derechos del usuario',
        parrafos: [
            'El usuario puede solicitar acceso, rectificación, cancelación u oposición al tratamiento de sus datos escribiendo a citas@clinicapariona.com. La solicitud será atendida en los plazos establecidos por ley.',
        ],
    },
];
