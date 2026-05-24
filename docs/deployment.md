# Deployment

The local production-style deployment target is Docker Compose:

```bash
cp .env.example .env
docker compose up --build
docker compose exec api python seed.py
```

The API service runs Alembic migrations before starting Uvicorn. The worker mounts the same `uploads_data` Docker volume as the API service.
