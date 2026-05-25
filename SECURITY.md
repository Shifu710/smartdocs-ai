# Security Policy

SmartDocs AI is a production-style portfolio/demo project for an Enterprise RAG SaaS architecture.

## Security Scope

This project demonstrates:

- JWT authentication
- Workspace-level RBAC
- Tenant-scoped document access
- Guest read-only review mode
- Provider secret redaction in error messages
- Demo-local provider fallback for public review
- Credit deduction only after successful AI responses
- Zero credit deduction on failed provider calls
- Langfuse-ready tracing that disables safely when keys are absent

## Public Demo Warning

Please do not upload private, sensitive, confidential, or real business documents to the public demo deployment.

The public demo is designed for technical review only.

## Secrets

Never commit real API keys or secrets.

Use environment variables for:

- `SECRET_KEY`
- `DEEPSEEK_API_KEY`
- `QWEN_API_KEY`
- `OPENAI_API_KEY`
- `LANGFUSE_PUBLIC_KEY`
- `LANGFUSE_SECRET_KEY`
- database credentials
- Redis credentials

## Reporting Security Issues

For security feedback, contact:

```txt
mohamed.gamalj8@gmail.com
```

Please include:

- affected route or file
- reproduction steps
- expected behavior
- actual behavior
- severity estimate

## Production Hardening Notes

A real commercial deployment should add:

- object storage for uploads
- stricter CORS configuration
- production secret manager
- database backups
- audit logging
- rate-limit tuning
- dependency scanning
- vulnerability scanning
- monitoring and alerting
- abuse prevention for public demos
