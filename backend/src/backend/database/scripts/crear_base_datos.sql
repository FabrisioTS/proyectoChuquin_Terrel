-- ==========================================================
-- Esquema de la base de datos veterinaria_db
-- SQL Server (autenticación de Windows)
--
-- Este script crea la tabla e índices en la base que esté
-- seleccionada (por ejemplo, veterinaria_db en SSMS).
-- La creación de la base la hace el backend al arrancar.
--
-- Script idempotente: se puede ejecutar varias veces sin
-- borrar datos ni duplicar objetos.
--
-- Los usuarios de prueba se insertan desde Python (con Argon2),
-- en backend/database/inicializacion.py.
--
-- Ejecutar desde el proyecto:
--   uv run python -m backend.database.scripts.crear_base_datos
-- O abrirlo en SQL Server Management Studio 22 con la base
-- veterinaria_db seleccionada.
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
