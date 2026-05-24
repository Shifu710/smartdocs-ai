import time
from typing import TYPE_CHECKING

import httpx

from app.utils.tokens import estimate_tokens

if TYPE_CHECKING:
    from app.ai.model_gateway import ModelResponse


class OpenAICompatibleProvider:
    def __init__(self, *, provider_name: str, api_key: str, base_url: str, model: str) -> None:
        self.provider_name = provider_name
        self.api_key = api_key.strip()
        self.base_url = base_url.rstrip("/")
        self.model = model

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and self.base_url and self.model)

    async def chat_completion(
        self,
        *,
        messages: list[dict],
        temperature: float,
        max_tokens: int,
        metadata: dict,
    ) -> "ModelResponse":
        from app.ai.model_gateway import ModelResponse

        started = time.perf_counter()
        async with httpx.AsyncClient(timeout=45) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}", "Content-Type": "application/json"},
                json={
                    "model": self.model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                    "metadata": metadata,
                },
            )
            response.raise_for_status()
            payload = response.json()

        content = payload["choices"][0]["message"]["content"]
        usage = payload.get("usage") or {}
        prompt_tokens = int(usage.get("prompt_tokens") or sum(estimate_tokens(str(message.get("content", ""))) for message in messages))
        completion_tokens = int(usage.get("completion_tokens") or estimate_tokens(content))
        total_tokens = int(usage.get("total_tokens") or prompt_tokens + completion_tokens)
        return ModelResponse(
            provider=self.provider_name,
            model=self.model,
            content=content,
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
            latency_ms=int((time.perf_counter() - started) * 1000),
            raw_metadata={"id": payload.get("id"), "finish_reason": payload["choices"][0].get("finish_reason")},
        )
