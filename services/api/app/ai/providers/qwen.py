from app.ai.providers.openai_compatible import OpenAICompatibleProvider
from app.core.config import settings


class QwenProvider(OpenAICompatibleProvider):
    def __init__(self) -> None:
        super().__init__(
            provider_name="qwen",
            api_key=settings.qwen_api_key,
            base_url=settings.qwen_base_url,
            model=settings.qwen_chat_model,
        )
