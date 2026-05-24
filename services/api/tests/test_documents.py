from app.services.document_service import ALLOWED_TYPES


def test_supported_demo_document_types_are_allowed():
    assert {"pdf", "docx", "txt", "md"}.issubset(ALLOWED_TYPES)
