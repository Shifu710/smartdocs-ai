# RAG Flow

The LangGraph RAG pipeline is planned for Phase 3.

Required graph nodes:

1. `validate_access`
2. `check_credits`
3. `rewrite_query`
4. `retrieve`
5. `build_context`
6. `generate`
7. `finalize`

Every retrieval query must filter by `workspace_id`.
