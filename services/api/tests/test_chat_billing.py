from app.models.credit_transaction import CreditTransaction


def test_successful_rag_credit_transaction_is_negative_amount():
    transaction = CreditTransaction(
        workspace_id="workspace",
        transaction_type="rag_answer",
        amount=-5,
        balance_after=495,
        transaction_metadata={"operation": "rag_chat"},
    )

    assert transaction.amount < 0
    assert transaction.balance_after == 495
