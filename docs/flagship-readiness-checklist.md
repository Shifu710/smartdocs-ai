# SmartDocs AI Flagship Readiness Checklist

Date: 2026-05-25
Repository: https://github.com/Shifu710/smartdocs-ai
Live URL: https://smartdocs-ai-three.vercel.app

## Current Working Features

- Public homepage, login, register, demo route, and technical review page.
- Guest demo auto-login into the seeded `smartdocs-demo` workspace.
- Workspace dashboard, documents, chat, usage, members, and settings routes.
- Guest/viewer read-only UI for upload, re-index, invite, and settings actions.
- Backend RBAC enforcement for document upload, delete, and re-index.
- ModelGateway with DeepSeek, Qwen, OpenAI-compatible, and demo-local fallback.
- EmbeddingGateway with Qwen embedding support and deterministic demo fallback.
- PostgreSQL pgvector SQL retrieval, full-text search, RRF merge, and Python fallback for local/demo continuity.
- LangGraph RAG nodes for access validation, credit check, query normalization, retrieval, context build, generation, and finalize.
- Langfuse client/tracing integration that disables safely when keys are absent.
- Dedicated `conversations` and `messages` models, API routes, migration, and chat UI.
- Usage dashboard filters, error details, trace column, provider breakdown, latency, and credit transactions.
- README, `.env.example`, technical review page, and production QA evidence.

## Remaining Issues Found

- Public deployment currently runs in `demo-local` provider mode because no real DeepSeek/Qwen keys are configured.
- Langfuse is disabled on the public demo unless Langfuse keys are configured.
- Invite/edit settings write flows are intentionally disabled in the public demo to protect the shared tenant.

## Files Changed In Hardening Pass

- `services/api/app/models/conversation.py`
- `services/api/alembic/versions/0002_conversations.py`
- `services/api/app/api/v1/chat.py`
- `services/api/app/rag/rag_graph.py`
- `services/api/app/services/chat_service.py`
- `apps/web/app/workspaces/[workspaceId]/chat/page.tsx`
- `apps/web/app/workspaces/[workspaceId]/usage/page.tsx`
- `.github/workflows/ci.yml`
- `docs/production-qa.md`

## Manual QA Result

Manual QA is recorded in `docs/production-qa.md`. The latest live deployment was verified for public routes, guest login, workspace dashboard, documents, chat streaming, citations, vector/keyword/RRF debug fields, usage log creation, credit deduction, and all protected sidebar routes.
