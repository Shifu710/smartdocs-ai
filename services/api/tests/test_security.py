from app.core.security import create_access_token, decode_token, hash_password, verify_password


def test_password_roundtrip() -> None:
    hashed = hash_password("guest123")

    assert hashed != "guest123"
    assert verify_password("guest123", hashed)
    assert not verify_password("wrong-password", hashed)


def test_access_token_contains_subject() -> None:
    token = create_access_token("user-123", {"role": "user"})
    payload = decode_token(token)

    assert payload["sub"] == "user-123"
    assert payload["role"] == "user"
    assert payload["type"] == "access"
