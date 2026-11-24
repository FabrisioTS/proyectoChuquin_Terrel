import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .apis.cita_api import cita_router
from .apis.configuracion_api import configuracion_router
from .apis.historial_api import historial_router
from .apis.mascota_api import mascota_router
from .apis.pago_api import pago_router
from .apis.producto_api import producto_router
from .apis.solicitud_api import solicitud_router
from .apis.usuario_api import usuario_router
from .apis.vacuna_api import vacuna_router
from .apis.veterinario_api import veterinario_router
from .core.config import DB_AUTO_INIT, PROJECT_NAME
from .database.inicializacion import inicializar_base_datos

logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    if DB_AUTO_INIT:
        try:
            insertados = inicializar_base_datos()
            logger.info(
                "Base de datos lista. Usuarios de prueba insertados: %s", insertados
            )
        except Exception as error:
            # La API arranca igual; las rutas que usan BD responderán 503.
            logger.warning(
                "No se pudo inicializar la base de datos: %s", error, exc_info=True
            )

    yield


app = FastAPI(title=PROJECT_NAME, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(usuario_router, prefix="/api")
app.include_router(mascota_router, prefix="/api")
app.include_router(historial_router, prefix="/api")
app.include_router(cita_router, prefix="/api")
app.include_router(vacuna_router, prefix="/api")
app.include_router(pago_router, prefix="/api")
app.include_router(producto_router, prefix="/api")
app.include_router(configuracion_router, prefix="/api")
app.include_router(veterinario_router, prefix="/api")
app.include_router(solicitud_router, prefix="/api")
