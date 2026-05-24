import hashlib
import math
import time
from typing import TYPE_CHECKING

from app.core.config import settings
from app.utils.tokens import estimate_tokens

if TYPE_CHECKING:
    from app.ai.embedding_gateway import EmbeddingResponse


def deterministic_embedding(text: str, dimensions: int | None = None) -> list[float]:
    dimension_count = dimensions or settings.demo_embedding_dim or settings.embedding_dimension
    values = [0.0] * dimension_count
    for token in text.lower().split():
        digest = hashlib.sha256(token.encode("utf-8")).digest()
        index = int.from_bytes(digest[:4], "big") % dimension_count
        values[index] += 1.0
    norm = math.sqrt(sum(value * value for value in values)) or 1.0
    return [value / norm for value in values]


class DemoEmbeddingProvider:
    provider_name = "demo-local"
    model = "deterministic-hash-embedding"
    is_configured = True

    async def embed_text(self, text: str) -> "EmbeddingResponse":
        from app.ai.embedding_gateway import EmbeddingResponse

        started = time.perf_counter()
        embedding = deterministic_embedding(text, settings.embedding_dimension)
        return EmbeddingResponse(
            provider=self.provider_name,
            model=self.model,
            dimension=len(embedding),
            embedding=embedding,
            tokens=estimate_tokens(text),
            latency_ms=int((time.perf_counter() - started) * 1000),
        )
