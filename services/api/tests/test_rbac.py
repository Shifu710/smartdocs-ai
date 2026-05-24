import pytest
from fastapi import HTTPException

from app.services.workspace_service import assert_workspace_role, role_at_least


def test_role_order_allows_owner_admin_actions():
    assert role_at_least("owner", "admin")
    assert role_at_least("admin", "member")


def test_viewer_cannot_perform_member_action():
    with pytest.raises(HTTPException):
        assert_workspace_role("viewer", "member")
