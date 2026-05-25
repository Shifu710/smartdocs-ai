# SmartDocs AI Production QA

Date tested: 2026-05-25
Deployment URL: https://smartdocs-ai-three.vercel.app
Commit SHA tested: b2b02fd
Deployment ID: dpl_Ar2EXAqneybdPr1fzr2gXrZ2NwbF
Tester: Codex

## Route Checklist

| Route | Expected | Result |
| --- | --- | --- |
| `/` | 200 | Pass |
| `/login` | 200 | Pass |
| `/register` | 200 | Pass |
| `/demo` | Guest login then dashboard redirect | Pass |
| `/technical-review` | 200 | Pass |
| `/workspaces` | 200 after login | Pass |
| `/workspaces/{id}/dashboard` | 200 | Pass |
| `/workspaces/{id}/documents` | 200 | Pass |
| `/workspaces/{id}/chat` | 200 | Pass |
| `/workspaces/{id}/usage` | 200 | Pass |
| `/workspaces/{id}/members` | 200 | Pass |
| `/workspaces/{id}/settings` | 200 | Pass |
| `/_/api/health` | 200 | Pass |
| `GET /_/api/api/v1/warmup` | 200 | Pass |
| `POST /_/api/api/v1/auth/guest` | 200 | Pass |
| `GET /_/api/api/v1/workspaces` | 200 with token | Pass |
| `GET /_/api/api/v1/workspaces/{id}/documents` | 200 with token | Pass |
| `POST /_/api/api/v1/workspaces/{id}/chat/stream` | 200 stream with token | Pass |
| `GET /_/api/api/v1/workspaces/{id}/usage` | 200 with token | Pass |

## Guest Demo Result

- Guest account: `guest@smartdocs.ai`
- Workspace slug: `smartdocs-demo`
- Role observed: `viewer`
- Indexed documents observed: 4
- Required demo documents observed: `refund-policy.md`, `security-policy.md`, `employee-handbook.md`, `product-requirements.md`

## Chat QA

- Question tested: `What is the refund policy?`
- Provider mode observed: `demo-local`
- Stream final event observed: yes
- Citations observed: yes
- Retrieval debug observed: vector rank, keyword rank, vector distance, keyword score, RRF score, source preview
- Credits before/after in last verified run: 470 -> 465
- Usage logs before/after in last verified run: 11 -> 12
- Conversation persistence observed: created conversation, saved user message, saved assistant message with citations/debug metadata

## Performance Notes

Measured from the deployed production alias on 2026-05-25 after the performance pass.

| Flow | Observed time | Notes |
| --- | ---: | --- |
| Homepage load | 661 ms | Static route returned HTTP 200. |
| Demo login API path | 557 ms | Guest login plus workspace lookup; the UI now shows step progress and retries on failure. |
| Dashboard API load | 289 ms | Workspace dashboard summary for `smartdocs-demo`. |
| Documents API load | 294 ms | Returned 4 seeded documents. |
| Usage API load | 315 ms | Returned current usage summary. |
| First chat answer stream | 489 ms | Demo-local stream returned final event, citations, and usage/credit metadata. |
| Warm endpoint first call | 275 ms | `/_/api/api/v1/warmup` initialized a DB session and provider status lightly. |
| Warm endpoint repeat call | 276 ms | No cold-start penalty observed during this run. |

Cold starts can still occur when Vercel has to wake a serverless function after idle time. The warm endpoint is intentionally lightweight: it checks DB/session readiness and model provider status without running retrieval, embeddings, document processing, or model generation.

## Known Issues

- Public demo uses `demo-local` because real provider keys are not configured on the public deployment.
- Langfuse traces are disabled unless `LANGFUSE_PUBLIC_KEY` and `LANGFUSE_SECRET_KEY` are configured.
- Invite and settings writes are read-only in public demo.
