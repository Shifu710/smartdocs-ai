def estimate_tokens(text: str) -> int:
    return max(1, int(len(text) * 0.75))
