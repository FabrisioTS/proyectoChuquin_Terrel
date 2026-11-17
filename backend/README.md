# Backend - Clínica Pariona

API con FastAPI y conexión directa a SQL Server mediante **pyodbc**
(sin ORM), usando **autenticación de Windows** y contraseñas hasheadas
con **Argon2id**.

## Requisitos

- Python 3.14+
- SQL Server / LocalDB con la base de datos `veterinaria_db`
- Controlador **ODBC Driver 17 for SQL Server** (o 18) de la misma
  arquitectura que Python (64 bits).
- La aplicación debe ejecutarse en la misma PC donde está el servidor
  (o donde exista acceso a la instancia).
- [`uv`](https://docs.astral.sh/uv/) para instalar dependencias.

## Inicio rápido

```powershell
uv sync
uv run uvicorn backend.main:app --reload --port 8000
```

En el primer arranque el backend:

1. Crea `backend/.env` con una `SECRET_KEY` aleatoria si no existe.
2. Crea `veterinaria_db` si no existe.
3. Crea las tablas del esquema y sus índices si no existen
   (`usuarios`, `productos`, `mascotas`, `citas`, `vacunas`,
   `historial` y `pagos`).
4. Inserta los usuarios de prueba si no existen.

Todo es **idempotente**: puedes reiniciar el backend las veces que quieras
sin duplicar datos ni sobrescribir contraseñas. Si no hay conexión a SQL
Server, la API igual arranca y responde `503` en las rutas que usan BD.

> La creación automática requiere que SQL Server/LocalDB y el ODBC Driver
> estén instalados en esa PC. El proyecto no los instala.

Documentación interactiva: <http://localhost:8000/docs>

## Configuración por PC

El archivo `backend/.env` **no se sube a git** (contiene la `SECRET_KEY`)
y se genera automáticamente. Solo necesitas crearlo o editarlo si quieres
cambiar el servidor:

| PC | `DB_SERVER` |
| --- | --- |
| SQL Server instalado como instancia por defecto | `localhost` |
| SQL Server Express LocalDB | `(localdb)\MSSQLLocalDB` |
| SQL Server Express con instancia con nombre | `localhost\SQLEXPRESS` |

- No necesitas usuario ni contraseña: la autenticación es de Windows
  (`Trusted_Connection=yes`).
- Si usas el ODBC Driver 18, cambia `DB_DRIVER`.
- Si cambias o borras la `SECRET_KEY`, los tokens emitidos dejan de ser
  válidos y los usuarios deberán iniciar sesión otra vez.
- La plantilla `backend/.env.example` está versionada solo como referencia,
  sin claves reales.

### Si usas LocalDB

```powershell
sqllocaldb start MSSQLLocalDB
sqllocaldb info MSSQLLocalDB
```

## Crear la base manualmente (opcional)

El arranque ya la crea, pero también puedes ejecutarlo a mano:

```powershell
uv run python -m backend.database.scripts.crear_base_datos
```

El script es idempotente y crea la base con las tablas `usuarios`,
`productos`, `mascotas`, `citas`, `vacunas`, `historial` y `pagos`, junto con
sus índices. La tabla `usuarios` guarda `id`, `nombres`, `apellidos`, `email`,
`telefono`, `dni` y `password_hash`, con índices únicos en `email` y `dni`.
Las demás tablas dejan preparada la base para cuando el frontend deje de usar
`localStorage` y consuma la API.

También puedes abrir
`src/backend/database/scripts/crear_base_datos.sql` en SQL Server Management
Studio 22 (con la base `veterinaria_db` seleccionada). Ese archivo solo crea
el esquema; los usuarios se insertan desde Python porque Argon2 genera una sal
aleatoria por PC.

## Usuarios de prueba

| Email | Contraseña |
| --- | --- |
| `admin@veterinaria.com` | `Admin1234` |
| `ana.perez@correo.com` | `Clave1234` |
| `luis.gomez@correo.com` | `Clave1234` |

Los hashes Argon2 son distintos en cada PC (sal aleatoria), pero las
contraseñas para iniciar sesión son las mismas. Son usuarios de demostración
para bases locales.

## Contraseñas: Argon2id y migración desde bcrypt

- Los registros nuevos se guardan con **Argon2id**.
- Los usuarios antiguos con hash **bcrypt** siguen pudiendo iniciar sesión.
- En su primer login exitoso, el backend regenera el hash con Argon2 y lo
  actualiza en la base (`UPDATE usuarios SET password_hash = ? WHERE id = ?`),
  sin pedirle nada al usuario.
- `bcrypt` se mantiene como dependencia únicamente para verificar esos hashes
  heredados.

## Probar la conexión

```powershell
uv run python -c "from backend.database.conection import crear_conexion; c = crear_conexion(); print(c.execute('SELECT DB_NAME()').fetchval()); c.close()"
```

## Endpoints

| Método | Ruta                 | Descripción                              |
| ------ | -------------------- | ---------------------------------------- |
| POST   | `/api/auth/register` | Registrar un usuario                     |
| POST   | `/api/auth/login`    | Iniciar sesión (devuelve token JWT)      |
| GET    | `/api/auth/me`       | Perfil del usuario autenticado (Bearer)  |

Todas las consultas se hacen con parámetros `?` (consultas parametrizadas),
nunca concatenando valores en el SQL.
