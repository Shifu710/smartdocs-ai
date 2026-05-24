from app.core.security import create_access_token, decode_token


def test_access_token_round_trip_subject():
    token = create_access_token(subject="user-1")

    assert decode_token(token)["sub"] == "user-1"
