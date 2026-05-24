import time
from dataclasses import dataclass, field

from app.ai.providers.demo_embeddings import DemoEmbeddingProvider
from app.ai.providers.qwen_embeddings import QwenEmbeddingProvider
from app.core.config import settings


@dataclass
class EmbeddingResponse:
    provider: str
    model: str
    dimension: int
    embedding: list[float]
    tokens: int
    latency_ms: int
    raw_metadata: dict = field(default_factory=dict)


class EmbeddingGateway:
    def __init__(self) -> None:
        self.qwen = QwenEmbeddingProvider()
        self.demo = DemoEmbeddingProvider()

    async def embed_text(self, text: str) -> EmbeddingResponse:
        started = time.perf_counter()
        if settings.embedding_provider.lower() in {"auto", "qwen"} and self.qwen.is_configured:
            try:
                return await self.qwen.embed_text(text)
            except Exception as exc:
                response = await self.demo.embed_text(text)
                response.raw_metadata["fallback_error"] = self._safe_error(exc)
                response.latency_ms = int((time.perf_counter() - started) * 1000)
                return response
        return await self.demo.embed_text(text)

    async def embed_query(self, text: str) -> EmbeddingResponse:
        return await self.embed_text(text)

    def provider_status(self) -> dict:
        return {
            "mode": settings.embedding_provider,
            "active": "qwen" if self.qwen.is_configured and settings.embedding_provider.lower() != "demo-local" else "demo-local",
            "configured": ["qwen"] if self.qwen.is_configured else [],
            "dimension": settings.embedding_dimension,
        }

    def _safe_error(self, exc: Exception) -> str:
        text = str(exc)
        if settings.qwen_api_key:
            text = text.replace(settings.qwen_api_key, "[redacted]")
        return text[:300]
