-- ==========================================================
-- Esquema de la base de datos veterinaria_db
-- SQL Server (autenticación de Windows)
--
-- Este script crea las tablas e índices en la base que esté
-- seleccionada (por ejemplo, veterinaria_db en SSMS).
-- La creación de la base la hace el backend al arrancar.
--
-- Script idempotente: se puede ejecutar varias veces sin
-- borrar datos ni duplicar objetos.
--
-- Los usuarios de prueba se insertan desde Python (con Argon2),
-- en backend/database/inicializacion.py.
--
-- El frontend guarda su información en localStorage. Estas
-- tablas dejan preparada la base para cuando se conecte la API:
-- productos, mascotas, citas, vacunas, historial y pagos.
--
-- Ejecutar desde el proyecto:
--   uv run python -m backend.database.scripts.crear_base_datos
-- O abrirlo en SQL Server Management Studio 22 con la base
-- veterinaria_db seleccionada.
-- ==========================================================

-- ==========================================================
-- 1. USUARIOS
-- ==========================================================

IF OBJECT_ID(N'dbo.usuarios', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.usuarios (
        id            INT IDENTITY(1,1) NOT NULL,
        nombres       NVARCHAR(100)     NOT NULL,
        apellidos     NVARCHAR(100)     NOT NULL,
        email         NVARCHAR(150)     NOT NULL,
        telefono      NVARCHAR(20)      NOT NULL,
        dni           NVARCHAR(20)      NOT NULL,
        password_hash NVARCHAR(255)     NOT NULL,
        CONSTRAINT PK_usuarios PRIMARY KEY (id)
    );
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'UX_usuarios_email'
      AND object_id = OBJECT_ID(N'dbo.usuarios')
)
BEGIN
    CREATE UNIQUE INDEX UX_usuarios_email ON dbo.usuarios(email);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'UX_usuarios_dni'
      AND object_id = OBJECT_ID(N'dbo.usuarios')
)
BEGIN
    CREATE UNIQUE INDEX UX_usuarios_dni ON dbo.usuarios(dni);
END
GO

-- ==========================================================
-- 2. PRODUCTOS (catálogo de la tienda)
-- ==========================================================

IF OBJECT_ID(N'dbo.productos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.productos (
        id          INT IDENTITY(1,1) NOT NULL,
        nombre      NVARCHAR(150)     NOT NULL,
        categoria   NVARCHAR(40)      NOT NULL,
        precio      DECIMAL(10,2)     NOT NULL,
        stock       INT               NOT NULL CONSTRAINT DF_productos_stock DEFAULT (0),
        descripcion NVARCHAR(600)     NULL,
        emoji       NVARCHAR(20)      NULL,
        imagen      NVARCHAR(300)     NULL,
        activo      BIT               NOT NULL CONSTRAINT DF_productos_activo DEFAULT (1),
        creado_en   DATETIME2(0)      NOT NULL CONSTRAINT DF_productos_creado DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT PK_productos PRIMARY KEY (id),
        CONSTRAINT CK_productos_precio CHECK (precio >= 0),
        CONSTRAINT CK_productos_stock CHECK (stock >= 0),
        CONSTRAINT CK_productos_categoria CHECK (
            categoria IN ('Alimentos', 'Juguetes', 'Higiene', 'Salud', 'Accesorios')
        )
    );
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_productos_categoria'
      AND object_id = OBJECT_ID(N'dbo.productos')
)
BEGIN
    CREATE INDEX IX_productos_categoria ON dbo.productos(categoria);
END
GO

-- ==========================================================
-- 3. MASCOTAS
-- ==========================================================

IF OBJECT_ID(N'dbo.mascotas', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.mascotas (
        id           INT IDENTITY(1,1) NOT NULL,
        usuario_id   INT               NULL,
        nombre       NVARCHAR(100)     NOT NULL,
        especie      NVARCHAR(20)      NOT NULL,
        raza         NVARCHAR(80)      NULL,
        edad         INT               NULL,
        sexo         NVARCHAR(20)      NULL,
        peso         DECIMAL(6,2)      NULL,
        microchip    NVARCHAR(50)      NULL,
        diagnostico  NVARCHAR(300)     NULL,
        cobertura    NVARCHAR(100)     NULL,
        foto         NVARCHAR(300)     NULL,
        creado_en    DATETIME2(0)      NOT NULL CONSTRAINT DF_mascotas_creado DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT PK_mascotas PRIMARY KEY (id),
        CONSTRAINT FK_mascotas_usuario FOREIGN KEY (usuario_id)
            REFERENCES dbo.usuarios(id) ON DELETE SET NULL,
        CONSTRAINT CK_mascotas_especie CHECK (especie IN ('CANINO', 'FELINO', 'OTRO')),
        CONSTRAINT CK_mascotas_edad CHECK (edad IS NULL OR edad >= 0),
        CONSTRAINT CK_mascotas_peso CHECK (peso IS NULL OR peso >= 0)
    );
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_mascotas_usuario'
      AND object_id = OBJECT_ID(N'dbo.mascotas')
)
BEGIN
    CREATE INDEX IX_mascotas_usuario ON dbo.mascotas(usuario_id);
END
GO

-- ==========================================================
-- 4. CITAS
-- ==========================================================

IF OBJECT_ID(N'dbo.citas', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.citas (
        id             INT IDENTITY(1,1) NOT NULL,
        usuario_id     INT               NULL,
        mascota_id     INT               NOT NULL,
        mascota_nombre NVARCHAR(100)     NOT NULL,
        motivo         NVARCHAR(200)     NOT NULL,
        doctor         NVARCHAR(100)     NULL,
        especialidad   NVARCHAR(100)     NULL,
        fecha          DATE              NOT NULL,
        hora           TIME(0)           NOT NULL,
        sede           NVARCHAR(100)     NULL,
        direccion      NVARCHAR(200)     NULL,
        estado         NVARCHAR(20)      NOT NULL CONSTRAINT DF_citas_estado DEFAULT ('Pendiente'),
        indicaciones   NVARCHAR(500)     NULL,
        creado_en      DATETIME2(0)      NOT NULL CONSTRAINT DF_citas_creado DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT PK_citas PRIMARY KEY (id),
        CONSTRAINT FK_citas_usuario FOREIGN KEY (usuario_id)
            REFERENCES dbo.usuarios(id) ON DELETE SET NULL,
        CONSTRAINT CK_citas_estado CHECK (
            estado IN ('Confirmada', 'Pendiente', 'Cancelada', 'Atendida')
        )
    );
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_citas_usuario'
      AND object_id = OBJECT_ID(N'dbo.citas')
)
BEGIN
    CREATE INDEX IX_citas_usuario ON dbo.citas(usuario_id);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_citas_fecha'
      AND object_id = OBJECT_ID(N'dbo.citas')
)
BEGIN
    CREATE INDEX IX_citas_fecha ON dbo.citas(fecha, hora);
END
GO

-- ==========================================================
-- 5. VACUNAS Y TRATAMIENTOS
-- ==========================================================

IF OBJECT_ID(N'dbo.vacunas', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.vacunas (
        id              INT IDENTITY(1,1) NOT NULL,
        usuario_id      INT               NULL,
        mascota_id      INT               NOT NULL,
        mascota_nombre  NVARCHAR(100)     NOT NULL,
        nombre          NVARCHAR(150)     NOT NULL,
        tipo            NVARCHAR(30)      NOT NULL,
        fecha_aplicacion DATE             NOT NULL,
        proxima_dosis   DATE              NULL,
        lote            NVARCHAR(50)      NULL,
        observaciones   NVARCHAR(500)     NULL,
        creado_en       DATETIME2(0)      NOT NULL CONSTRAINT DF_vacunas_creado DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT PK_vacunas PRIMARY KEY (id),
        CONSTRAINT FK_vacunas_usuario FOREIGN KEY (usuario_id)
            REFERENCES dbo.usuarios(id) ON DELETE SET NULL,
        CONSTRAINT CK_vacunas_tipo CHECK (
            tipo IN ('Vacuna', 'Tratamiento', 'Desparasitación')
        )
    );
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_vacunas_mascota'
      AND object_id = OBJECT_ID(N'dbo.vacunas')
)
BEGIN
    CREATE INDEX IX_vacunas_mascota ON dbo.vacunas(mascota_id);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_vacunas_proxima_dosis'
      AND object_id = OBJECT_ID(N'dbo.vacunas')
)
BEGIN
    CREATE INDEX IX_vacunas_proxima_dosis ON dbo.vacunas(proxima_dosis);
END
GO

-- ==========================================================
-- 6. HISTORIAL CLÍNICO
-- ==========================================================

IF OBJECT_ID(N'dbo.historial', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.historial (
        id             INT IDENTITY(1,1) NOT NULL,
        usuario_id     INT               NULL,
        mascota_id     INT               NOT NULL,
        mascota_nombre NVARCHAR(100)     NOT NULL,
        fecha          DATE              NOT NULL,
        doctor         NVARCHAR(100)     NULL,
        motivo         NVARCHAR(200)     NULL,
        diagnostico    NVARCHAR(500)     NULL,
        tratamiento    NVARCHAR(500)     NULL,
        receta         NVARCHAR(1000)    NULL,
        creado_en      DATETIME2(0)      NOT NULL CONSTRAINT DF_historial_creado DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT PK_historial PRIMARY KEY (id),
        CONSTRAINT FK_historial_usuario FOREIGN KEY (usuario_id)
            REFERENCES dbo.usuarios(id) ON DELETE SET NULL
    );
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_historial_mascota'
      AND object_id = OBJECT_ID(N'dbo.historial')
)
BEGIN
    CREATE INDEX IX_historial_mascota ON dbo.historial(mascota_id);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_historial_fecha'
      AND object_id = OBJECT_ID(N'dbo.historial')
)
BEGIN
    CREATE INDEX IX_historial_fecha ON dbo.historial(fecha);
END
GO

-- ==========================================================
-- 7. PAGOS
-- ==========================================================

IF OBJECT_ID(N'dbo.pagos', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.pagos (
        id             INT IDENTITY(1,1) NOT NULL,
        usuario_id     INT               NULL,
        codigo         NVARCHAR(30)      NOT NULL,
        concepto       NVARCHAR(200)     NOT NULL,
        fecha          DATE              NOT NULL,
        monto          DECIMAL(10,2)     NOT NULL,
        metodo         NVARCHAR(50)      NULL,
        estado         NVARCHAR(20)      NOT NULL CONSTRAINT DF_pagos_estado DEFAULT ('Pendiente'),
        mascota_nombre NVARCHAR(100)     NULL,
        creado_en      DATETIME2(0)      NOT NULL CONSTRAINT DF_pagos_creado DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT PK_pagos PRIMARY KEY (id),
        CONSTRAINT FK_pagos_usuario FOREIGN KEY (usuario_id)
            REFERENCES dbo.usuarios(id) ON DELETE SET NULL,
        CONSTRAINT CK_pagos_monto CHECK (monto >= 0),
        CONSTRAINT CK_pagos_estado CHECK (
            estado IN ('Pagado', 'Pendiente', 'Vencido')
        )
    );
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'UX_pagos_codigo'
      AND object_id = OBJECT_ID(N'dbo.pagos')
)
BEGIN
    CREATE UNIQUE INDEX UX_pagos_codigo ON dbo.pagos(codigo);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_pagos_usuario'
      AND object_id = OBJECT_ID(N'dbo.pagos')
)
BEGIN
    CREATE INDEX IX_pagos_usuario ON dbo.pagos(usuario_id);
END
GO

IF NOT EXISTS (
    SELECT 1 FROM sys.indexes
    WHERE name = N'IX_pagos_estado'
      AND object_id = OBJECT_ID(N'dbo.pagos')
)
BEGIN
    CREATE INDEX IX_pagos_estado ON dbo.pagos(estado);
END
GO

-- ==========================================================
-- 8. MIGRACIONES PARA EL PORTAL (roles, baja lógica, FKs)
-- ==========================================================

IF COL_LENGTH('dbo.usuarios', 'rol') IS NULL
BEGIN
    ALTER TABLE dbo.usuarios
        ADD rol NVARCHAR(20) NOT NULL
            CONSTRAINT DF_usuarios_rol DEFAULT ('propietario');
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_usuarios_rol')
BEGIN
    ALTER TABLE dbo.usuarios
        ADD CONSTRAINT CK_usuarios_rol
            CHECK (rol IN ('propietario', 'veterinario', 'admin'));
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_usuarios_rol' AND object_id = OBJECT_ID('dbo.usuarios'))
BEGIN
    CREATE INDEX IX_usuarios_rol ON dbo.usuarios(rol);
END
GO

IF COL_LENGTH('dbo.mascotas', 'activo') IS NULL
BEGIN
    ALTER TABLE dbo.mascotas
        ADD activo BIT NOT NULL CONSTRAINT DF_mascotas_activo DEFAULT (1);
END
GO

IF COL_LENGTH('dbo.historial', 'veterinario_id') IS NULL
BEGIN
    ALTER TABLE dbo.historial ADD veterinario_id INT NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_historial_veterinario')
BEGIN
    ALTER TABLE dbo.historial
        ADD CONSTRAINT FK_historial_veterinario
            FOREIGN KEY (veterinario_id) REFERENCES dbo.usuarios(id) ON DELETE SET NULL;
END
GO

IF COL_LENGTH('dbo.citas', 'veterinario_id') IS NULL
BEGIN
    ALTER TABLE dbo.citas ADD veterinario_id INT NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_citas_veterinario')
BEGIN
    ALTER TABLE dbo.citas
        ADD CONSTRAINT FK_citas_veterinario
            FOREIGN KEY (veterinario_id) REFERENCES dbo.usuarios(id) ON DELETE SET NULL;
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_historial_mascota')
BEGIN
    ALTER TABLE dbo.historial
        ADD CONSTRAINT FK_historial_mascota
            FOREIGN KEY (mascota_id) REFERENCES dbo.mascotas(id);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_citas_mascota')
BEGIN
    ALTER TABLE dbo.citas
        ADD CONSTRAINT FK_citas_mascota
            FOREIGN KEY (mascota_id) REFERENCES dbo.mascotas(id);
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_vacunas_mascota')
BEGIN
    ALTER TABLE dbo.vacunas
        ADD CONSTRAINT FK_vacunas_mascota
            FOREIGN KEY (mascota_id) REFERENCES dbo.mascotas(id);
END
GO

-- ==========================================================
-- 9. CONFIGURACIÓN POR USUARIO
-- ==========================================================

IF OBJECT_ID(N'dbo.configuracion_usuario', N'U') IS NULL
BEGIN
    CREATE TABLE dbo.configuracion_usuario (
        usuario_id             INT NOT NULL,
        sede                   NVARCHAR(100) NULL,
        notificaciones_citas   BIT NOT NULL CONSTRAINT DF_conf_citas    DEFAULT (1),
        notificaciones_vacunas BIT NOT NULL CONSTRAINT DF_conf_vacunas  DEFAULT (1),
        notificaciones_pagos   BIT NOT NULL CONSTRAINT DF_conf_pagos    DEFAULT (0),
        actualizado_en         DATETIME2(0) NOT NULL CONSTRAINT DF_conf_actualizado DEFAULT (SYSUTCDATETIME()),
        CONSTRAINT PK_configuracion_usuario PRIMARY KEY (usuario_id),
        CONSTRAINT FK_conf_usuario FOREIGN KEY (usuario_id)
            REFERENCES dbo.usuarios(id) ON DELETE CASCADE
    );
END
GO
