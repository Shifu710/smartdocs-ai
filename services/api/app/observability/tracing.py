from uuid import uuid4

from app.observability.langfuse_client import get_langfuse_client


class RAGTracer:
    def __init__(self, *, workspace_id: str, user_id: str, question: str) -> None:
        self.client = get_langfuse_client()
        self.trace_id = f"demo-{uuid4().hex[:12]}"
        self.trace = None
        if self.client:
            try:
                self.trace = self.client.trace(
                    id=self.trace_id,
                    name="rag_chat",
                    user_id=user_id,
                    metadata={"workspace_id": workspace_id, "question": question},
                )
            except Exception:
                self.trace = None

    def span(self, name: str, *, metadata: dict | None = None):
        if not self.trace:
            return _NoopSpan()
        try:
            return _LangfuseSpan(self.trace.span(name=name, metadata=metadata or {}))
        except Exception:
            return _NoopSpan()

    def generation(self, *, provider: str, model: str, input_data: dict, output: str, usage: dict, metadata: dict | None = None) -> None:
        if not self.trace:
            return
        try:
            self.trace.generation(
                name="model_gateway",
                model=model,
                input=input_data,
                output=output,
                usage=usage,
                metadata={"provider": provider, **(metadata or {})},
            )
        except Exception:
            return


class _NoopSpan:
    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, traceback):
        return False

    def end(self, *args, **kwargs) -> None:
        return None


class _LangfuseSpan:
    def __init__(self, span) -> None:
        self.span = span

    def __enter__(self):
        return self.span

    def __exit__(self, exc_type, exc, traceback):
        try:
            if hasattr(self.span, "end"):
                self.span.end(status_message=str(exc) if exc else None)
        except Exception:
            return False
        return False
