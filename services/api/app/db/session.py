from collections.abc import AsyncGenerator
import time

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.models.base import Base
from app.observability.timing import add_db_time


engine = create_async_engine(settings.database_url, pool_pre_ping=True)


class TimedAsyncSession(AsyncSession):
    async def execute(self, *args, **kwargs):
        started = time.perf_counter()
        try:
            return await super().execute(*args, **kwargs)
        finally:
            add_db_time((time.perf_counter() - started) * 1000)

    async def scalar(self, *args, **kwargs):
        started = time.perf_counter()
        try:
            return await super().scalar(*args, **kwargs)
        finally:
            add_db_time((time.perf_counter() - started) * 1000)

    async def get(self, *args, **kwargs):
        started = time.perf_counter()
        try:
            return await super().get(*args, **kwargs)
        finally:
            add_db_time((time.perf_counter() - started) * 1000)

    async def commit(self):
        started = time.perf_counter()
        try:
            return await super().commit()
        finally:
            add_db_time((time.perf_counter() - started) * 1000)


AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=TimedAsyncSession)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session


async def create_missing_tables() -> None:
    async with engine.begin() as connection:
        await connection.exec_driver_sql("CREATE EXTENSION IF NOT EXISTS vector")
        await connection.run_sync(Base.metadata.create_all)
