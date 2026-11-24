"""Datos iniciales (semillas) para la base de datos.

Se insertan una sola vez, cuando la tabla correspondiente está vacía.
"""

# (nombre, categoria, precio, stock, descripcion, emoji, imagen)
PRODUCTOS_SEMILLA = (
    (
        "Canbo Skin Protection Salmón",
        "Alimentos",
        139.9,
        10,
        "Alimento super premium con salmón y omega 3 para cuidar la piel "
        "sensible y mantener un pelaje brillante.",
        "",
        "/images/cambo_alimento_seco.jpg",
    ),
    (
        "Canbo Cachorro Cordero",
        "Alimentos",
        119.9,
        8,
        "Fórmula balanceada con cordero para cachorros de razas medianas y "
        "grandes en etapa de crecimiento.",
        "",
        "/images/cambo_cachorro_cordero.webp",
    ),
    (
        "Canbo Adulto Cordero 2x1 (Pack 2 bolsas)",
        "Alimentos",
        189.9,
        6,
        "Promoción 2x1: dos bolsas de alimento super premium con cordero para "
        "perros adultos de razas medianas y grandes.",
        "",
        "/images/cambo_comida_adultos_2x1.jpg",
    ),
    (
        "Canbo Gato Esterilizado Lata",
        "Alimentos",
        8.9,
        24,
        "Alimento húmedo para gatos esterilizados con pollo, formulado para el "
        "control de peso y cuidado urinario.",
        "",
        "/images/cambo_gatos.jpg",
    ),
    (
        "Canbo Cachorro Hipoalergénico Lata",
        "Alimentos",
        9.5,
        18,
        "Lata hipoalergénica para cachorros con cordero y arroz, ideal para "
        "estómagos sensibles.",
        "",
        "/images/cambo_lata_cachorro.jpg",
    ),
    (
        "Canbo Adulto Cordero",
        "Alimentos",
        109.9,
        9,
        "Alimento super premium con cordero para perros adultos de razas "
        "medianas y grandes.",
        "",
        "/images/cambo__audlto_cordero.webp",
    ),
    (
        "Juguete Peluche Monstruo",
        "Juguetes",
        29.9,
        15,
        "Peluche de felpa con textura suave y sonido interno para estimular "
        "el juego y reducir el estrés.",
        "",
        "/images/juguete.webp",
    ),
    (
        "Varita con Plumas para Gatos",
        "Juguetes",
        19.9,
        20,
        "Juguete interactivo con plumas y cascabel para despertar el instinto "
        "cazador de los felinos.",
        "",
        "/images/juguete_gatos.webp",
    ),
    (
        "Cepillo Deslanador BioSilk",
        "Higiene",
        49.9,
        12,
        "Cepillo con cerdas de acero que elimina el pelo suelto, los nudos y "
        "el exceso de pelo muerto.",
        "",
        "/images/cepillo_perros.webp",
    ),
    (
        "Cepillo Multiuso IntelliFlex",
        "Higiene",
        39.9,
        14,
        "Cepillo de doble cara con cerdas de nylon y silicona para estimular "
        "los aceites naturales del pelaje.",
        "",
        "/images/cepillo_2.webp",
    ),
    (
        "Kit Dental Tartar Control Vainilla",
        "Higiene",
        34.9,
        16,
        "Pasta dental sabor vainilla con cepillo y aplicador para el control "
        "del sarro y la placa bacteriana.",
        "",
        "/images/kid_dental_sabor_vainilla.webp",
    ),
    (
        "Neutralizador de Olores para Gatos",
        "Higiene",
        32.9,
        11,
        "Cristales desodorantes con bicarbonato y aceites esenciales que "
        "neutralizan los olores del arenero.",
        "",
        "/images/neutralizador_olores_gatos.webp",
    ),
    (
        "Paños Húmedos Polish",
        "Higiene",
        18.9,
        25,
        "Toallitas limpiadoras con aroma very berry para pelo y patas. "
        "Presentación de 100 unidades.",
        "",
        "/images/panos_limpiez.webp",
    ),
    (
        "Paños Húmedos Nourish",
        "Higiene",
        18.9,
        25,
        "Toallitas nutritivas con aroma sweet chamomile para el cuidado "
        "diario del pelaje. 100 unidades.",
        "",
        "/images/panos_limpieza2.webp",
    ),
    (
        "Spray Control de Sarro",
        "Salud",
        36.9,
        13,
        "Spray dental con bicarbonato que ayuda a reducir la placa y el sarro "
        "sin necesidad de cepillado.",
        "",
        "/images/spray_control_sarro.webp",
    ),
    (
        "Bolso Portamascotas Aire Libre",
        "Accesorios",
        159.9,
        7,
        "Bolso ergonómico con ventilación, correa ajustable y base acolchada "
        "para perros y gatos pequeños.",
        "",
        "/images/bolso_porta_mascotas.webp",
    ),
    (
        "Cama Nube Pequeña",
        "Accesorios",
        89.9,
        10,
        "Cama acolchada color chocolate con bordes elevados y base "
        "antideslizante para descanso profundo.",
        "",
        "/images/cama_pequena.webp",
    ),
    (
        "Cama Suspendida para Gatos",
        "Accesorios",
        99.9,
        8,
        "Hamaca de ventosa para ventana con superficie de felpa y estructura "
        "resistente para gatos.",
        "",
        "/images/cama_suspendida_gatos.webp",
    ),
    (
        "Casaca Reversible Térmica",
        "Accesorios",
        79.9,
        9,
        "Casaca acolchada reversible negro/rojo con cierre y orificio para el "
        "arnés. Ideal para días fríos.",
        "",
        "/images/casaca_reversible.webp",
    ),
    (
        "Collar Felino Tejido Fucsia",
        "Accesorios",
        29.9,
        15,
        "Collar tejido ajustable con broche de seguridad y dije decorativo "
        "para gatos.",
        "",
        "/images/collar_gatos.webp",
    ),
    (
        "Collar Deportivo Verde",
        "Accesorios",
        34.9,
        12,
        "Collar de nylon resistente con broche de liberación rápida y argolla "
        "metálica para paseo diario.",
        "",
        "/images/collar_perro.webp",
    ),
    (
        "Collar Deportivo Camel",
        "Accesorios",
        34.9,
        12,
        "Collar de nylon acolchado en tono camel con broche de seguridad y "
        "argolla para correa.",
        "",
        "/images/collar_perro2.webp",
    ),
    (
        "Arnés Acolchado Terracota",
        "Accesorios",
        69.9,
        9,
        "Arnés de malla acolchada con ajuste regulable y argolla dorsal para "
        "paseos cómodos y seguros.",
        "",
        "/images/pechera_terracota.webp",
    ),
    (
        "Arnés FlyHarness Negro",
        "Accesorios",
        89.9,
        7,
        "Arnés ergonómico acolchado con bandas reflectivas, cierre de "
        "seguridad y argolla metálica.",
        "",
        "/images/Pechera2.webp",
    ),
    (
        "Arnés Escocés Multicolor",
        "Accesorios",
        64.9,
        8,
        "Arnés de tela estampada escocés con broches regulables y argolla "
        "metálica para paseo.",
        "",
        "/images/pechera_escocesa.webp",
    ),
    (
        "Placa QR Identificativa",
        "Accesorios",
        24.9,
        20,
        "Placa metálica con código QR para identificación y contacto "
        "inmediato del tutor.",
        "",
        "/images/placa_identificacion_gatos.webp",
    ),
)

# (nombre, especie, raza, edad, sexo, peso, microchip, diagnostico, cobertura, foto)
MASCOTAS_DEMO = (
    (
        "Simba",
        "CANINO",
        "Golden Retriever",
        5,
        "Macho castrado",
        31.5,
        "#7890-PER-2021",
        "Salud óptima",
        "Plan Preventivo Senior",
        "https://images.unsplash.com/photo-1552053831-71594a27632d"
        "?q=80&w=200&auto=format&fit=crop",
    ),
    (
        "Milo",
        "FELINO",
        "Gato Europeo Atigrado",
        3,
        "Macho",
        4.8,
        "#4512-PER-2023",
        "Tratamiento dermatológico al día",
        "Plan Esencial Felino",
        "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba"
        "?q=80&w=200&auto=format&fit=crop",
    ),
)
