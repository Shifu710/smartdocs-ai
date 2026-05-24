import asyncio

from app.db.session import AsyncSessionLocal
from app.services.document_processing import process_document
from app.workers.celery_app import celery_app


@celery_app.task(name="process_document")
def process_document_task(document_id: str) -> str:
    async def runner() -> None:
        async with AsyncSessionLocal() as session:
            await process_document(session, document_id)

    asyncio.run(runner())
    return document_id

