import { Producto } from '../interfaces/Producto';

/**
 * Catálogo base de la tienda veterinaria.
 * Las rutas son relativas a la carpeta pública del proyecto.
 */
export const PRODUCTOS_SEMILLA: Producto[] = [
    // ==================== ALIMENTOS ====================
    {
        id: 1,
        nombre: 'Canbo Skin Protection Salmón',
        categoria: 'Alimentos',
        precio: 139.9,
        stock: 10,
        descripcion:
            'Alimento super premium con salmón y omega 3 para cuidar la piel sensible y mantener un pelaje brillante.',
        emoji: '',
        imagen: '/images/cambo_alimento_seco.jpg',
    },
    {
        id: 2,
        nombre: 'Canbo Cachorro Cordero',
        categoria: 'Alimentos',
        precio: 119.9,
        stock: 8,
        descripcion:
            'Fórmula balanceada con cordero para cachorros de razas medianas y grandes en etapa de crecimiento.',
        emoji: '',
        imagen: '/images/cambo_cachorro_cordero.webp',
    },
    {
        id: 3,
        nombre: 'Canbo Adulto Cordero 2x1 (Pack 2 bolsas)',
        categoria: 'Alimentos',
        precio: 189.9,
        stock: 6,
        descripcion:
            'Promoción 2x1: dos bolsas de alimento super premium con cordero para perros adultos de razas medianas y grandes.',
        emoji: '',
        imagen: '/images/cambo_comida_adultos_2x1.jpg',
    },
    {
        id: 4,
        nombre: 'Canbo Gato Esterilizado Lata',
        categoria: 'Alimentos',
        precio: 8.9,
        stock: 24,
        descripcion:
            'Alimento húmedo para gatos esterilizados con pollo, formulado para el control de peso y cuidado urinario.',
        emoji: '',
        imagen: '/images/cambo_gatos.jpg',
    },
    {
        id: 5,
        nombre: 'Canbo Cachorro Hipoalergénico Lata',
        categoria: 'Alimentos',
        precio: 9.5,
        stock: 18,
        descripcion:
            'Lata hipoalergénica para cachorros con cordero y arroz, ideal para estómagos sensibles.',
        emoji: '',
        imagen: '/images/cambo_lata_cachorro.jpg',
    },
    {
        id: 6,
        nombre: 'Canbo Adulto Cordero',
        categoria: 'Alimentos',
        precio: 109.9,
        stock: 9,
        descripcion:
            'Alimento super premium con cordero para perros adultos de razas medianas y grandes.',
        emoji: '',
        imagen: '/images/cambo__audlto_cordero.webp',
    },

    // ==================== JUGUETES ====================
    {
        id: 7,
        nombre: 'Juguete Peluche Monstruo',
        categoria: 'Juguetes',
        precio: 29.9,
        stock: 15,
        descripcion:
            'Peluche de felpa con textura suave y sonido interno para estimular el juego y reducir el estrés.',
        emoji: '',
        imagen: '/images/juguete.webp',
    },
    {
        id: 8,
        nombre: 'Varita con Plumas para Gatos',
        categoria: 'Juguetes',
        precio: 19.9,
        stock: 20,
        descripcion:
            'Juguete interactivo con plumas y cascabel para despertar el instinto cazador de los felinos.',
        emoji: '',
        imagen: '/images/juguete_gatos.webp',
    },

    // ==================== HIGIENE ====================
    {
        id: 9,
        nombre: 'Cepillo Deslanador BioSilk',
        categoria: 'Higiene',
        precio: 49.9,
        stock: 12,
        descripcion:
            'Cepillo con cerdas de acero que elimina el pelo suelto, los nudos y el exceso de pelo muerto.',
        emoji: '',
        imagen: '/images/cepillo_perros.webp',
    },
    {
        id: 10,
        nombre: 'Cepillo Multiuso IntelliFlex',
        categoria: 'Higiene',
        precio: 39.9,
        stock: 14,
        descripcion:
            'Cepillo de doble cara con cerdas de nylon y silicona para estimular los aceites naturales del pelaje.',
        emoji: '',
        imagen: '/images/cepillo_2.webp',
    },
    {
        id: 11,
        nombre: 'Kit Dental Tartar Control Vainilla',
        categoria: 'Higiene',
        precio: 34.9,
        stock: 16,
        descripcion:
            'Pasta dental sabor vainilla con cepillo y aplicador para el control del sarro y la placa bacteriana.',
        emoji: '',
        imagen: '/images/kid_dental_sabor_vainilla.webp',
    },
    {
        id: 12,
        nombre: 'Neutralizador de Olores para Gatos',
        categoria: 'Higiene',
        precio: 32.9,
        stock: 11,
        descripcion:
            'Cristales desodorantes con bicarbonato y aceites esenciales que neutralizan los olores del arenero.',
        emoji: '',
        imagen: '/images/neutralizador_olores_gatos.webp',
    },
    {
        id: 13,
        nombre: 'Paños Húmedos Polish',
        categoria: 'Higiene',
        precio: 18.9,
        stock: 25,
        descripcion:
            'Toallitas limpiadoras con aroma very berry para pelo y patas. Presentación de 100 unidades.',
        emoji: '',
        imagen: '/images/panos_limpiez.webp',
    },
    {
        id: 14,
        nombre: 'Paños Húmedos Nourish',
        categoria: 'Higiene',
        precio: 18.9,
        stock: 25,
        descripcion:
            'Toallitas nutritivas con aroma sweet chamomile para el cuidado diario del pelaje. 100 unidades.',
        emoji: '',
        imagen: '/images/panos_limpieza2.webp',
    },

    // ==================== SALUD ====================
    {
        id: 15,
        nombre: 'Spray Control de Sarro',
        categoria: 'Salud',
        precio: 36.9,
        stock: 13,
        descripcion:
            'Spray dental con bicarbonato que ayuda a reducir la placa y el sarro sin necesidad de cepillado.',
        emoji: '',
        imagen: '/images/spray_control_sarro.webp',
    },

    // ==================== ACCESORIOS ====================
    {
        id: 16,
        nombre: 'Bolso Portamascotas Aire Libre',
        categoria: 'Accesorios',
        precio: 159.9,
        stock: 7,
        descripcion:
            'Bolso ergonómico con ventilación, correa ajustable y base acolchada para perros y gatos pequeños.',
        emoji: '',
        imagen: '/images/bolso_porta_mascotas.webp',
    },
    {
        id: 17,
        nombre: 'Cama Nube Pequeña',
        categoria: 'Accesorios',
        precio: 89.9,
        stock: 10,
        descripcion:
            'Cama acolchada color chocolate con bordes elevados y base antideslizante para descanso profundo.',
        emoji: '',
        imagen: '/images/cama_pequena.webp',
    },
    {
        id: 18,
        nombre: 'Cama Suspendida para Gatos',
        categoria: 'Accesorios',
        precio: 99.9,
        stock: 8,
        descripcion:
            'Hamaca de ventosa para ventana con superficie de felpa y estructura resistente para gatos.',
        emoji: '',
        imagen: '/images/cama_suspendida_gatos.webp',
    },
    {
        id: 19,
        nombre: 'Casaca Reversible Térmica',
        categoria: 'Accesorios',
        precio: 79.9,
        stock: 9,
        descripcion:
            'Casaca acolchada reversible negro/rojo con cierre y orificio para el arnés. Ideal para días fríos.',
        emoji: '',
        imagen: '/images/casaca_reversible.webp',
    },
    {
        id: 20,
        nombre: 'Collar Felino Tejido Fucsia',
        categoria: 'Accesorios',
        precio: 29.9,
        stock: 15,
        descripcion:
            'Collar tejido ajustable con broche de seguridad y dije decorativo para gatos.',
        emoji: '',
        imagen: '/images/collar_gatos.webp',
    },
    {
        id: 21,
        nombre: 'Collar Deportivo Verde',
        categoria: 'Accesorios',
        precio: 34.9,
        stock: 12,
        descripcion:
            'Collar de nylon resistente con broche de liberación rápida y argolla metálica para paseo diario.',
        emoji: '',
        imagen: '/images/collar_perro.webp',
    },
    {
        id: 22,
        nombre: 'Collar Deportivo Camel',
        categoria: 'Accesorios',
        precio: 34.9,
        stock: 12,
        descripcion:
            'Collar de nylon acolchado en tono camel con broche de seguridad y argolla para correa.',
        emoji: '',
        imagen: '/images/collar_perro2.webp',
    },
    {
        id: 23,
        nombre: 'Arnés Acolchado Terracota',
        categoria: 'Accesorios',
        precio: 69.9,
        stock: 9,
        descripcion:
            'Arnés de malla acolchada con ajuste regulable y argolla dorsal para paseos cómodos y seguros.',
        emoji: '',
        imagen: '/images/pechera_terracota.webp',
    },
    {
        id: 24,
        nombre: 'Arnés FlyHarness Negro',
        categoria: 'Accesorios',
        precio: 89.9,
        stock: 7,
        descripcion:
            'Arnés ergonómico acolchado con bandas reflectivas, cierre de seguridad y argolla metálica.',
        emoji: '',
        imagen: '/images/Pechera2.webp',
    },
    {
        id: 25,
        nombre: 'Arnés Escocés Multicolor',
        categoria: 'Accesorios',
        precio: 64.9,
        stock: 8,
        descripcion:
            'Arnés de tela estampada escocés con broches regulables y argolla metálica para paseo.',
        emoji: '',
        imagen: '/images/pechera_escocesa.webp',
    },
    {
        id: 26,
        nombre: 'Placa QR Identificativa',
        categoria: 'Accesorios',
        precio: 24.9,
        stock: 20,
        descripcion:
            'Placa metálica con código QR para identificación y contacto inmediato del tutor.',
        emoji: '',
        imagen: '/images/placa_identificacion_gatos.webp',
    },
];
