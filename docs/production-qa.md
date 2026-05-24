# SmartDocs AI Production QA

Date tested: 2026-05-25
Deployment URL: https://smartdocs-ai-three.vercel.app
Commit SHA tested: 9e90eac
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
- Credits before/after in last verified run: 485 -> 480
- Usage logs before/after in last verified run: 8 -> 9

## Known Issues

- Public demo uses `demo-local` because real provider keys are not configured on the public deployment.
- Langfuse traces are disabled unless `LANGFUSE_PUBLIC_KEY` and `LANGFUSE_SECRET_KEY` are configured.
- Invite and settings writes are read-only in public demo.
