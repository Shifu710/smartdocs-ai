from app.rag.rrf import reciprocal_rank_fusion


def test_rrf_prioritizes_items_present_in_both_rankings():
    scores = reciprocal_rank_fusion(["a", "b", "c"], ["c", "a"])

    assert scores["a"] > scores["b"]
    assert scores["c"] > scores["b"]
