# SmartDocs AI Demo Video Script

## Format

- Length: 60-120 seconds
- Voice: English
- Subtitles: Chinese
- Recording: live deployed website
- Do not hide demo-local provider mode

## English narration

Hi, this is SmartDocs AI, a production-style Enterprise RAG SaaS demo for secure document intelligence.

The product helps teams upload internal documents, ask questions, and receive cited AI answers.

I will open the live guest demo. The demo workspace includes seeded documents so reviewers can test the full flow immediately.

Here are the indexed documents. The system parses files, chunks text, creates embeddings, and stores retrieval-ready document chunks.

Now I will ask: What is the refund policy?

The answer is generated from retrieved workspace context and includes source citations. The Retrieval Debug Panel shows which chunks were retrieved and how the answer was grounded.

Next, the Usage page shows the AI call record, provider mode, latency, and credit deduction. Failed model calls are designed to deduct zero credits.

The backend supports DeepSeek, Qwen, OpenAI-compatible providers, and demo-local mode. The public demo may use demo-local mode for stability and cost control.

For technical review, the project includes FastAPI, Next.js, workspace RBAC, hybrid retrieval, LangGraph RAG flow, credit billing, usage logs, Docker, CI, and English/Chinese documentation.

Thank you for reviewing SmartDocs AI.

## Chinese subtitles

这是 SmartDocs AI，一个生产风格的企业级 RAG SaaS Demo，用于安全文档智能问答。

它可以帮助团队上传内部文档，提出问题，并获得带来源引用的 AI 答案。

现在打开公开 guest demo。演示工作区已经包含种子文档，方便 HR 和技术团队快速评估完整流程。

这里可以看到已索引的文档。系统会解析文件、切分文本、生成 embeddings，并保存可检索的文档 chunks。

现在提问：What is the refund policy?

答案基于工作区检索到的上下文生成，并包含来源引用。Retrieval Debug Panel 展示了检索到的 chunks 和 grounding 信息。

接下来，Usage 页面展示 AI 调用记录、provider 模式、延迟和积分扣除。模型调用失败时不会扣除积分。

后端支持 DeepSeek、Qwen、OpenAI-compatible provider，以及 demo-local 模式。公开演示环境可能使用 demo-local，以保证稳定和成本可控。

技术方面，本项目包含 FastAPI、Next.js、workspace RBAC、混合检索、LangGraph RAG flow、积分计费、用量日志、Docker、CI，以及中英文文档。

感谢您查看 SmartDocs AI。
