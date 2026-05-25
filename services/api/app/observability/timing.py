from contextvars import ContextVar


_db_time_ms: ContextVar[float] = ContextVar("db_time_ms", default=0.0)


def reset_db_time() -> None:
    _db_time_ms.set(0.0)


def add_db_time(duration_ms: float) -> None:
    _db_time_ms.set(_db_time_ms.get() + duration_ms)


def get_db_time_ms() -> int:
    return int(_db_time_ms.get())
