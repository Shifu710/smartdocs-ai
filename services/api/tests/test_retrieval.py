from app.services.retrieval_service import RetrievedChunk


def test_retrieved_chunk_has_required_debug_fields():
    item = RetrievedChunk(
        chunk_id="chunk",
        workspace_id="workspace",
        document_id="document",
        document_name="refund-policy.md",
        chunk_index=0,
        content="Refunds are available within 30 days.",
        page_number=None,
        token_count=8,
        rrf_score=0.03,
        vector_rank=1,
        keyword_rank=1,
        vector_distance=0.12,
        keyword_score=0.8,
    )

    assert item.preview.startswith("Refunds")
    assert item.vector_rank == 1
    assert item.keyword_rank == 1
    assert item.rrf_score > 0
