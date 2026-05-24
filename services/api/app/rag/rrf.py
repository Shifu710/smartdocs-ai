def reciprocal_rank_fusion(
    vector_ranked_ids: list[str],
    keyword_ranked_ids: list[str],
    *,
    k: int = 60,
) -> dict[str, float]:
    scores: dict[str, float] = {}
    for ranked_ids in (vector_ranked_ids, keyword_ranked_ids):
        for index, item_id in enumerate(ranked_ids, start=1):
            scores[item_id] = scores.get(item_id, 0.0) + 1.0 / (k + index)
    return scores

