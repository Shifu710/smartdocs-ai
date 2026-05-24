from app.rag.rag_graph import build_rag_graph


def test_langgraph_compiles_real_rag_flow():
    graph = build_rag_graph()

    assert graph is not None
