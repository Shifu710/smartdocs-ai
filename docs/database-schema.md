# Database Schema

Phase 1 creates the foundation tables:

- `users`
- `workspaces`
- `workspace_members`
- `documents`
- `document_chunks`
- `usage_logs`
- `credit_transactions`

The schema already includes `document_chunks.embedding vector(1024)` and a generated `content_tsvector` column so hybrid retrieval can be implemented in Phase 3.
