import time
from dataclasses import dataclass, field

from app.ai.providers.deepseek import DeepSeekProvider
from app.ai.providers.demo_local import DemoLocalProvider
from app.ai.providers.openai_compatible import OpenAICompatibleProvider
from app.ai.providers.qwen import QwenProvider
from app.core.config import settings


@dataclass
class ModelResponse:
    provider: str
    model: str
    content: str
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    latency_ms: int
    raw_metadata: dict = field(default_factory=dict)


class ModelGateway:
    def __init__(self) -> None:
        self.demo = DemoLocalProvider()
        self.providers = [
            DeepSeekProvider(),
            QwenProvider(),
            OpenAICompatibleProvider(
                provider_name="openai-compatible",
                api_key=settings.openai_api_key,
                base_url=settings.openai_base_url,
                model=settings.openai_chat_model,
            ),
        ]

    async def chat_completion(
        self,
        messages: list[dict],
        temperature: float = 0.2,
        max_tokens: int = 1200,
        metadata: dict | None = None,
    ) -> ModelResponse:
        started = time.perf_counter()
        errors: list[dict] = []
        mode = settings.ai_provider_mode.lower()
        configured = [provider for provider in self.providers if provider.is_configured]
        if mode not in {"auto", "demo-local"}:
            configured = [provider for provider in configured if provider.provider_name == mode]

        for provider in configured:
            try:
                return await provider.chat_completion(
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                    metadata=metadata or {},
                )
            except Exception as exc:
                errors.append({"provider": provider.provider_name, "error": self._safe_error(exc)})

        response = await self.demo.chat_completion(
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
            metadata=metadata or {},
        )
        response.latency_ms = int((time.perf_counter() - started) * 1000)
        response.raw_metadata["fallback_errors"] = errors
        return response

    def provider_status(self) -> dict:
        configured = [provider.provider_name for provider in self.providers if provider.is_configured]
        return {
            "mode": settings.ai_provider_mode,
            "configured": configured,
            "active": configured[0] if configured else "demo-local",
            "demo_local": not configured or settings.ai_provider_mode == "demo-local",
        }

    def _safe_error(self, exc: Exception) -> str:
        text = str(exc)
        for secret in (settings.deepseek_api_key, settings.qwen_api_key, settings.openai_api_key):
            if secret:
                text = text.replace(secret, "[redacted]")
        return text[:300]
