import logging
import time

from fastapi import FastAPI
from fastapi import Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from slowapi import _rate_limit_exceeded_handler

from app.api.v1.router import api_router
from app.core.config import settings
from app.db.session import create_missing_tables
from app.observability.timing import get_db_time_ms, reset_db_time


limiter = Limiter(key_func=get_remote_address)
logger = logging.getLogger("smartdocs.performance")


def create_app() -> FastAPI:
    app = FastAPI(
        title="SmartDocs AI API",
        version="0.1.0",
        description="Enterprise RAG SaaS backend for SmartDocs AI.",
    )

    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(api_router, prefix=settings.api_v1_prefix)

    @app.middleware("http")
    async def log_response_timing(request: Request, call_next):
        reset_db_time()
        started = time.perf_counter()
        status_code = 500
        try:
            response = await call_next(request)
            status_code = response.status_code
            return response
        finally:
            duration_ms = int((time.perf_counter() - started) * 1000)
            logger.info(
                "api_response route=%s duration_ms=%s status=%s db_time_ms=%s",
                request.url.path,
                duration_ms,
                status_code,
                get_db_time_ms(),
            )

    @app.on_event("startup")
    async def ensure_schema() -> None:
        await create_missing_tables()

    @app.get("/health", tags=["health"])
    async def health_check() -> dict[str, str]:
        return {"status": "ok"}

    return app


app = create_app()
