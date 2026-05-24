from app.models.usage_log import UsageLog


def test_failed_usage_log_can_record_zero_credit_deduction():
    log = UsageLog(
        workspace_id="workspace",
        operation_type="rag_chat",
        status="failed",
        credits_deducted=0,
        error_message="provider failed",
    )

    assert log.credits_deducted == 0
    assert log.status == "failed"
