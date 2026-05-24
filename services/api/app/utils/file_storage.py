import hashlib
from dataclasses import dataclass
from pathlib import Path

from fastapi import UploadFile

from app.core.config import settings


@dataclass(frozen=True)
class StoredFile:
    path: str
    size_bytes: int
    sha256: str


def safe_filename(filename: str) -> str:
    return "".join(char if char.isalnum() or char in "._-" else "_" for char in filename).strip("._") or "document"


async def save_upload_file(workspace_id: str, document_id: str, upload: UploadFile) -> StoredFile:
    root = Path(settings.upload_dir)
    target_dir = root / workspace_id / document_id
    target_dir.mkdir(parents=True, exist_ok=True)
    target_path = target_dir / safe_filename(upload.filename or "document")

    digest = hashlib.sha256()
    size = 0
    with target_path.open("wb") as output:
        while chunk := await upload.read(1024 * 1024):
            size += len(chunk)
            digest.update(chunk)
            output.write(chunk)

    await upload.seek(0)
    return StoredFile(path=str(target_path), size_bytes=size, sha256=digest.hexdigest())

