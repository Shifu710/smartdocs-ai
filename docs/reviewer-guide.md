# SmartDocs AI Reviewer Guide

This guide is for HR, hiring managers, and technical reviewers who want to evaluate SmartDocs AI quickly.

## Project Summary

SmartDocs AI is a production-style Enterprise RAG SaaS demo. It allows users to enter a workspace, review indexed documents, ask AI questions, receive cited answers, inspect retrieval debug data, and verify credits/usage logs.

It was created to demonstrate AI Native Full-Stack engineering for roles such as:

```txt
AI Native Full-Stack Developer
AI SaaS Full-Stack Engineer
RAG Application Engineer
Large Language Model Application Developer
AI Product Engineer
```

## Live Links

```txt
Live demo: https://smartdocs-ai-three.vercel.app/
Technical review: https://smartdocs-ai-three.vercel.app/technical-review
GitHub: https://github.com/Shifu710/smartdocs-ai
```

## Demo Accounts

| Account | Email | Password | Purpose |
| --- | --- | --- | --- |
| Guest reviewer | `guest@smartdocs.ai` | `guest123` | Read-only demo review |
| Demo owner | `demo@smartdocs.ai` | `demo12345` | Upload/re-index workspace review |
| Platform admin | `platform_admin@smartdocs.ai` | `admin12345` | Admin route review |

## 5-Minute Review Path

1. Open the live demo.
2. Click **Try Guest Demo**.
3. Confirm you enter the seeded SmartDocs Demo Workspace.
4. Open **Documents**.
5. Confirm demo documents are indexed.
6. Open **Chat**.
7. Ask:

```txt
What is the refund policy?
```

8. Review the streamed answer.
9. Check citations.
10. Check the Retrieval Debug Panel.
11. Open **Usage**.
12. Confirm credits were deducted and a usage log was created.
13. Open **Technical Review**.
14. Review architecture, known limitations, and source files.

## What To Look For

### Product Depth

SmartDocs AI is not only a chatbot. It includes:

```txt
workspace tenant model
document upload and indexing
RAG retrieval
citations
usage logs
credits
RBAC
provider abstraction
technical review documentation
```

### Engineering Depth

Technical reviewers should inspect:

```txt
services/api/app/rag/rag_graph.py
services/api/app/services/chat_service.py
services/api/app/services/retrieval_service.py
services/api/app/repositories/retrieval_repository.py
services/api/app/ai/model_gateway.py
services/api/app/ai/embedding_gateway.py
services/api/app/services/billing_service.py
apps/web/app/workspaces/[workspaceId]/chat/page.tsx
apps/web/app/workspaces/[workspaceId]/usage/page.tsx
```

### SaaS Logic

Check that:

```txt
Credits are checked before model calls.
Credits are deducted only after successful generation.
Failed provider calls deduct zero credits.
Usage logs are written for success and failure.
Workspace data is scoped by workspace_id.
Guest users are read-only.
```

### RAG Logic

Check that:

```txt
Documents are chunked.
Embeddings are stored.
Retrieval uses vector search and keyword search.
Results are merged with RRF.
Answers include citations.
The Retrieval Debug Panel exposes ranking/debug data.
```

### AI Provider Logic

The public demo can run in `demo-local` mode.

This is intentional because:

```txt
It keeps the public demo stable.
It avoids public API cost.
It prevents failures due to missing external keys.
It still demonstrates provider abstraction.
```

Real provider mode is available when API keys are configured:

```txt
DeepSeek
Qwen
OpenAI-compatible APIs
Qwen embeddings
Langfuse tracing
```

## Suggested Technical Interview Questions

A reviewer may ask:

```txt
How do you isolate documents between workspaces?
How does the retrieval pipeline work?
Why use vector + keyword + RRF?
How do you prevent failed AI calls from deducting credits?
Why use ModelGateway?
Why use LangGraph instead of a single function?
How does guest read-only mode work?
How would you make this ready for real commercial customers?
What would you change for object storage?
How would you add WeChat/China deployment support?
```

## Honest Limitations

SmartDocs AI should be evaluated as a production-style flagship demo, not a customer-managed SaaS offering.

Current limitations:

```txt
Public demo may use demo-local provider.
Real provider keys are not guaranteed on public deployment.
Langfuse requires configured keys.
Object storage should replace local uploads for real production.
Full invite/settings writes may be limited in public demo.
A commercial deployment needs security review, monitoring, backups, and ops hardening.
```

## Why This Project Matters

This project proves the developer can think across:

```txt
Frontend UI
Backend API
Database schema
RAG architecture
AI provider abstraction
Billing logic
Multi-tenant security
Deployment
Documentation
QA
```

That is the key value for an AI Native Full-Stack role.
