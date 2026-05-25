# Demo Video Plan

Do not add a public video link until a real screen recording exists.

## Recommended recording format

- Length: 60-120 seconds
- Narration: English
- Captions: Chinese subtitles
- Source: live deployed app, not local mock
- Show demo-local provider mode honestly if visible

## Storyboard

| Time | Scene | What to show |
| --- | --- | --- |
| 0-5s | Homepage | Product headline and Try demo CTA |
| 5-15s | Demo entry | Click Try demo and open guest workspace |
| 15-25s | Dashboard | Workspace, credits, documents, usage summary |
| 25-40s | Documents | Indexed files and chunk/status information |
| 40-75s | Chat | Ask `What is the refund policy?` |
| 75-95s | Citations/debug | Show cited answer, source chunks, RRF/debug info |
| 95-110s | Usage | Show credit deduction and usage log |
| 110-120s | Technical proof | Show Technical Review / GitHub links |

## Chinese subtitle script

SmartDocs AI 是一个生产风格的企业级 RAG SaaS Demo。

它支持团队上传内部文档，并通过带来源引用的 AI 问答快速获取可信答案。

系统包含多租户 workspace、RBAC 权限、文档解析、混合检索、LangGraph RAG 流程、积分扣费和用量日志。

公开演示环境可能使用 demo-local 模式，以保证稳定和成本可控。

配置 DeepSeek、Qwen 或 OpenAI-compatible API key 后，可以切换到真实模型调用。
