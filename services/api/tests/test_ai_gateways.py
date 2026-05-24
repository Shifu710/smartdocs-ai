import pytest

from app.ai.embedding_gateway import EmbeddingGateway
from app.ai.model_gateway import ModelGateway


@pytest.mark.asyncio
async def test_model_gateway_uses_demo_local_without_keys():
    gateway = ModelGateway()
    response = await gateway.chat_completion(
        [
            {"role": "system", "content": "Answer from context."},
            {"role": "user", "content": "What is the refund policy?"},
        ],
        metadata={"context": "Refunds are available within 30 days."},
    )

    assert response.provider == "demo-local"
    assert response.model == "deterministic-rag-demo"
    assert "Refunds are available within 30 days" in response.content
    assert response.total_tokens > 0


@pytest.mark.asyncio
async def test_embedding_gateway_demo_embedding_is_normalized():
    gateway = EmbeddingGateway()
    response = await gateway.embed_text("refund policy refund")

    assert response.provider in {"demo-local", "qwen"}
    assert response.dimension == len(response.embedding)
    assert response.tokens > 0
    if response.provider == "demo-local":
        assert abs(sum(value * value for value in response.embedding) - 1.0) < 0.0001
