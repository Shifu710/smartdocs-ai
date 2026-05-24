# SmartDocs AI - 企业级 RAG 知识库 SaaS

SmartDocs AI 是一个企业级 RAG 知识库 SaaS 平台，支持文档上传、混合检索（向量+关键词+RRF）、
引用来源、多租户权限、原子积分扣费、用量日志、管理后台、LangGraph 管道和 Langfuse 可观测性。

技术栈：Next.js · FastAPI · PostgreSQL/pgvector · Redis/Celery · LangGraph · DeepSeek/Qwen · Langfuse · Docker

## 当前进度

Phase 1 基础能力已完成：

- `apps/web` + `services/api` Monorepo
- FastAPI 分层架构：router -> service -> repository -> model
- JWT 注册、登录、登出响应、Guest Demo 登录
- 多租户 workspace、owner/viewer 成员关系和 RBAC 访问校验
- Workspace dashboard 页面和接口
- PostgreSQL/pgvector Alembic 迁移、Redis/Celery worker 骨架、uploads volume
- Next.js App Router 登录、注册、工作区列表、dashboard
- Docker Compose、`.env.example`、GitHub Actions CI、seed script

后续阶段会继续加入文档上传、索引、LangGraph RAG、SSE 流式回答、积分扣费、Langfuse 可观测性和完整测试。

## Demo 账号

运行 seed 脚本后可使用：

| 邮箱 | 密码 | 角色 |
| --- | --- | --- |
| `platform_admin@smartdocs.ai` | `admin12345` | 平台管理员 |
| `demo@smartdocs.ai` | `demo12345` | Demo 工作区 Owner |
| `guest@smartdocs.ai` | `guest123` | Guest Viewer |

## 启动方式

```bash
cp .env.example .env
docker compose up --build
docker compose exec api python seed.py
```

访问：

- 前端：http://localhost:3000
- API 文档：http://localhost:8000/docs
