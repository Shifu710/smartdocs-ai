import pytest

from app.ai.model_gateway import ModelGateway


@pytest.mark.asyncio
async def test_model_gateway_demo_local_path_returns_content():
    response = await ModelGateway().chat_completion(
        [{"role": "user", "content": "What is the refund policy?"}],
        metadata={"context": "Refunds are available within 30 days."},
    )

    assert response.provider == "demo-local"
    assert response.content


def test_model_gateway_status_is_secret_free():
    status = ModelGateway().provider_status()

    assert "active" in status
    assert "api_key" not in status
