# Backend - Clínica Pariona

API con FastAPI y conexión directa a SQL Server mediante **pyodbc**
(sin ORM), usando **autenticación de Windows**.

## Requisitos

- Python 3.14+
- SQL Server / LocalDB con la base de datos `veterinaria_db`
- Controlador **ODBC Driver 17 for SQL Server** (o 18) de la misma
  arquitectura que Python (64 bits).
- La aplicación debe ejecutarse en la misma PC donde está el servidor
  (o donde exista acceso a la instancia).
- [`uv`](https://docs.astral.sh/uv/) para instalar dependencias.

## Configuración

1. Revisa el archivo `.env` en esta carpeta:

   ```env
   DB_SERVER=(localdb)\MSSQLLocalDB
   DB_NAME=veterinaria_db
   DB_DRIVER=ODBC Driver 17 for SQL Server
   DB_TIMEOUT=10

   SECRET_KEY=...
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   ```

   - Si usas otra instancia, por ejemplo SQL Express, cambia
     `DB_SERVER=localhost\SQLEXPRESS`.
   - Si usas el ODBC Driver 18, cambia `DB_DRIVER`.
   - No necesitas usuario ni contraseña: la autenticación es de Windows
     (`Trusted_Connection=yes`).

2. Instala las dependencias:

   ```powershell
   uv sync
   ```

3. Si usas LocalDB, inicia la instancia:

   ```powershell
   sqllocaldb start MSSQLLocalDB
   sqllocaldb info MSSQLLocalDB
   ```

4. Ejecuta la API:

   ```powershell
   uv run uvicorn backend.main:app --reload --port 8000
   ```

   Documentación interactiva: <http://localhost:8000/docs>

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
