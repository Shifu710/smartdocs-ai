import time
from typing import TYPE_CHECKING

import httpx

from app.core.config import settings
from app.utils.tokens import estimate_tokens

if TYPE_CHECKING:
    from app.ai.embedding_gateway import EmbeddingResponse


class QwenEmbeddingProvider:
    provider_name = "qwen"

    @property
    def model(self) -> str:
        return settings.qwen_embedding_model or settings.embedding_model

    @property
    def is_configured(self) -> bool:
        return bool(settings.qwen_api_key and settings.qwen_base_url and self.model)

    async def embed_text(self, text: str) -> "EmbeddingResponse":
        from app.ai.embedding_gateway import EmbeddingResponse

        started = time.perf_counter()
        async with httpx.AsyncClient(timeout=45) as client:
            response = await client.post(
                f"{settings.qwen_base_url.rstrip('/')}/embeddings",
                headers={"Authorization": f"Bearer {settings.qwen_api_key}", "Content-Type": "application/json"},
                json={"model": self.model, "input": text},
            )
            response.raise_for_status()
            payload = response.json()
        embedding = payload["data"][0]["embedding"]
        usage = payload.get("usage") or {}
        tokens = int(usage.get("total_tokens") or usage.get("prompt_tokens") or estimate_tokens(text))
        return EmbeddingResponse(
            provider=self.provider_name,
            model=self.model,
            dimension=len(embedding),
            embedding=embedding,
            tokens=tokens,
            latency_ms=int((time.perf_counter() - started) * 1000),
            raw_metadata={"id": payload.get("id")},
        )
