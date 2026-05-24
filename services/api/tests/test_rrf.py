from app.rag.rrf import reciprocal_rank_fusion


def test_reciprocal_rank_fusion_prioritizes_shared_results() -> None:
    scores = reciprocal_rank_fusion(["chunk-a", "chunk-b"], ["chunk-c", "chunk-a"])

    assert scores["chunk-a"] > scores["chunk-b"]
    assert scores["chunk-a"] > scores["chunk-c"]

