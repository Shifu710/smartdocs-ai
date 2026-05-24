from app.rag.rrf import reciprocal_rank_fusion
from app.services.retrieval_service import RetrievalService


def test_rrf_prioritizes_items_present_in_both_rankings():
    scores = reciprocal_rank_fusion(["a", "b", "c"], ["c", "a"])

    assert scores["a"] > scores["b"]
    assert scores["c"] > scores["b"]


def test_retrieved_chunk_casts_ids_to_strings():
    service = RetrievalService.__new__(RetrievalService)
    item = service._to_retrieved(
        {
            "chunk_id": object(),
            "workspace_id": object(),
            "document_id": object(),
            "document_name": "refund.md",
            "chunk_index": 0,
            "content": "Refunds are available within 30 days.",
            "page_number": None,
            "token_count": 8,
            "chunk_metadata": {},
            "vector_rank": 1,
            "keyword_rank": 1,
            "vector_distance": 0.1,
            "keyword_score": 0.8,
        },
        0.03,
    )

    assert isinstance(item.chunk_id, str)
    assert isinstance(item.workspace_id, str)
    assert isinstance(item.document_id, str)
