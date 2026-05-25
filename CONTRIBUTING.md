# Contributing

SmartDocs AI is primarily a portfolio project, but feedback, issues, and improvement suggestions are welcome.

## Local Development

```bash
git clone https://github.com/Shifu710/smartdocs-ai.git
cd smartdocs-ai
cp .env.example .env
docker compose up --build
docker compose exec api python seed.py
```

## Frontend Commands

```bash
cd apps/web
npm install
npm run type-check
npm run lint
npm run build
npm run dev
```

## Backend Commands

```bash
cd services/api
pip install -r requirements.txt
ruff check app/ tests/
pytest tests/ -v
alembic upgrade head
uvicorn app.main:app --reload
```

## Pull Request Checklist

Before opening a pull request, verify:

- [ ] Frontend type-check passes
- [ ] Frontend lint passes
- [ ] Frontend build passes
- [ ] Backend Ruff check passes
- [ ] Backend tests pass
- [ ] No real secrets are committed
- [ ] README/docs are updated if behavior changes
- [ ] Public demo wording stays honest about `demo-local` provider mode

## Documentation Style

Use honest wording:

```txt
production-style demo
flagship portfolio project
DeepSeek/Qwen-ready
Langfuse-ready
demo-local fallback
```

Avoid overclaims:

```txt
fully production ready
enterprise security guaranteed
real provider always enabled
commercial customer-ready SaaS
```
