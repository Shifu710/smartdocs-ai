# SmartDocs AI - 企业级 RAG 知识库 SaaS

SmartDocs AI 是一个企业级 RAG 知识库 SaaS 平台，支持文档上传、混合检索（向量 + 关键词 + RRF）、
引用来源、多租户权限、原子积分扣费、用量日志、管理后台、LangGraph RAG 编排流程和 Langfuse 可观测性扩展。

技术栈：Next.js、FastAPI、PostgreSQL/pgvector、Redis/Celery、LangGraph、DeepSeek/Qwen-ready 网关、Docker。

## 当前进度

已完成从 Phase 1 基础能力到第一版可演示 RAG 闭环：

- FastAPI 分层架构：router -> service -> repository -> model
- JWT 注册、登录、Guest Demo 登录
- 多租户 workspace、成员关系和 RBAC 校验
- Workspace dashboard 页面和接口
- 文档列表、上传、详情、chunk 展示、删除、重新索引接口
- PDF、DOCX、TXT、Markdown 抽取和 Celery 文档处理
- demo-local 1024 维确定性 embedding，兼容 pgvector 存储；配置 Qwen embedding 凭据后可接入真实 embedding
- 混合检索：向量相似度 + 关键词排序 + RRF 合并
- POST 流式 RAG Chat、引用来源、Retrieval Debug Panel
- 成功回答后原子扣减积分，失败不扣费
- AI 调用 usage logs 和 credit transactions
- Guest Demo 预置 4 个已索引文档
- `/technical-review` 技术说明页面
- Docker Compose、`.env.example`、GitHub Actions CI、seed script

当前无密钥演示路径会在 UI 和日志中明确标记为 `demo-local`。配置 DeepSeek、Qwen 或 OpenAI-compatible
密钥后，可以替换为真实模型调用。

## Demo 账号

运行 seed 脚本后可使用：

| 邮箱 | 密码 | 角色 |
| --- | --- | --- |
| `platform_admin@smartdocs.ai` | `admin12345` | 平台管理员 |
| `demo@smartdocs.ai` | `demo12345` | Demo 工作区 Owner |
| `guest@smartdocs.ai` | `guest123` | Guest Viewer |

## Demo 流程

1. 打开应用并点击 Try Guest Demo。
2. 进入 SmartDocs Demo Workspace。
3. 打开 Documents，查看 4 个预置已索引文档。
4. 打开 Chat，提问 `What is the refund policy?`。
5. 查看流式回答、引用、Retrieval Debug Panel、provider、tokens、credits、latency 和 trace id。
6. 打开 Usage，确认 AI 调用日志和积分扣减。
7. 打开 `/technical-review` 查看架构说明。

## 启动方式

```bash
cp .env.example .env
docker compose up --build
docker compose exec api python seed.py
```

访问：

- 前端：http://localhost:3000
- API 文档：http://localhost:8000/docs
