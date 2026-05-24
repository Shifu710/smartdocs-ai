from app.ai.providers.openai_compatible import OpenAICompatibleProvider
from app.core.config import settings


class DeepSeekProvider(OpenAICompatibleProvider):
    def __init__(self) -> None:
        super().__init__(
            provider_name="deepseek",
            api_key=settings.deepseek_api_key,
            base_url=settings.deepseek_base_url,
            model=settings.deepseek_chat_model,
        )
