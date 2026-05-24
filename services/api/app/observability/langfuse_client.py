from functools import lru_cache

from app.core.config import settings


@lru_cache
def get_langfuse_client():
    if not (settings.langfuse_enabled and settings.langfuse_public_key and settings.langfuse_secret_key):
        return None
    try:
        from langfuse import Langfuse

        return Langfuse(
            public_key=settings.langfuse_public_key,
            secret_key=settings.langfuse_secret_key,
            host=settings.langfuse_host,
        )
    except Exception:
        return None


def langfuse_status() -> dict:
    enabled = get_langfuse_client() is not None
    return {
        "enabled": enabled,
        "host": settings.langfuse_host if enabled else None,
        "configured": bool(settings.langfuse_public_key and settings.langfuse_secret_key),
    }
