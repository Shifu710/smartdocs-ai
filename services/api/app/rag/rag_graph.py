from typing import TypedDict

from langgraph.graph import END, StateGraph


class RAGState(TypedDict, total=False):
    workspace_id: str
    user_id: str
    question: str
    document_ids: list[str]
    credits_required: int
    retrieved_chunks: list[dict]
    context: str
    answer: str
    citations: list[dict]
    usage: dict


def passthrough(state: RAGState) -> RAGState:
    return state


def build_rag_graph():
    graph = StateGraph(RAGState)
    graph.add_node("validate_access", passthrough)
    graph.add_node("check_credits", passthrough)
    graph.add_node("rewrite_query", passthrough)
    graph.add_node("retrieve", passthrough)
    graph.add_node("build_context", passthrough)
    graph.add_node("generate", passthrough)
    graph.add_node("finalize", passthrough)
    graph.set_entry_point("validate_access")
    graph.add_edge("validate_access", "check_credits")
    graph.add_edge("check_credits", "rewrite_query")
    graph.add_edge("rewrite_query", "retrieve")
    graph.add_edge("retrieve", "build_context")
    graph.add_edge("build_context", "generate")
    graph.add_edge("generate", "finalize")
    graph.add_edge("finalize", END)
    return graph.compile()

