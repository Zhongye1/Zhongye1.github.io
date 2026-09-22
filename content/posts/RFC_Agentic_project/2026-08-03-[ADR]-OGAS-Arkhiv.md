---
uuid:
title: 2026-08-03-[ADR]-OGAS-ArkhivRAG 设计文档
mathjax: true
abbrlink: 29089371
published: 2026-06-19 15:18:20
category: Agent
description: OGAS-ArkhivRAG 业务知识库 MCP Serve 相关设计方案
tags:
    - Agent
    - Harness Engineering
    - RAG
---


# OGAS-ArkhivRAG 设计文档

- **状态**：持续更新（跟随当前代码库）
- **读者**：扩展 Eagle-RAG 的工程师（核心、领域插件、下游 Agent）
- **范围**：`eagle_rag` 后端的架构及其对外接口（REST / SSE / MCP）。前端是 Core 能力的展示层，仅在约束后端时提及。

---

## 1. 上下文与范围

Eagle-RAG 是一个**行业无关、多租户（`kb_name`）的多模态 RAG 数据层**，面向 Agent 与 LLM。它只承担四项职责（ADR-008）：

- **ingest（入库）**——把文件/URL 路由到正确的解析器，做向量化并建索引；
- **retrieve（检索）**——对文本块与视觉切片做多模态召回；
- **assemble context（组装上下文）**——融合、重排、带溯源的答案生成；
- **admin metadata（管理元数据）**——任务审计、知识库生命周期、标签、健康探针。

它被**下游 Agent 通过 REST / SSE / MCP 消费**；内置 Next.js 前端只展示 Core（knowhere + pixelrag）检索能力。垂直领域（`plugins/biomed` 实验性、`plugins/lakehouse_bi` 开发中）以**后端 + MCP 形态**交付。

系统运行在**内网（无鉴权）**、固定的基础设施之上：Milvus 2.6、PostgreSQL 16、Redis 7、MinIO，外加 Knowhere 解析服务（或进程内 `knowhere-parse-sdk`）与 PixelRAG 进程内库。AI 供应商被限定为**DeepSeek + Qwen**。

本文描述系统在代码中的真实形态，可作为快速复习的入口和扩展功能、编写插件时可引用的资料源。

## 2. 目标与非目标

### 目标

- **双入库管线**，按「格式 + 内容形态」路由：Knowhere（语义骨架：类型化 chunk、`doc_nav` 章节树、知识图谱边）处理文本类文档；PixelRAG（视觉切片，2048 维）处理扫描件/图片文档。见 `eagle_rag/ingest/router.py`。
- **多模态融合**，通过 `eagle_visual` 上的四个锚点字段（`chunk_type`、`parent_section`、`content_summary`、`source_chunk_id`）锚定到 Knowhere 语义树，支持父文档召回（先 `type="section_summary"`，再按 `path` 前缀下钻）。
- **双层多租户**：`plugin_namespace`（Milvus Database + PG 仓储过滤）把一次部署绑定到单一领域；`kb_name` 在该领域内对标量检索做知识库过滤。
- **路由查询引擎**（`auto` / `text` / `visual` / `hybrid`），由 FallbackChain 选择器链 + 插件可扩展的 collection 计划构成，随后做逐计划重排、RRF 融合、跨 collection 去重与最终重排。
- **插件微内核**：Core 与领域插件共用同一套 Hook/MCP 扩展路径；热路径 Hook（`PARSE` / `CHUNK` / `QUERY_ASSEMBLE`）只做增强、绝不重新切块。
- **可靠性**：Celery 三队列（`router` / `knowhere` / `pixelrag`）+ `with_retry` + 死信；解析器 fail-closed（无 mock 兜底）。
- **统一对外接口**：REST + SSE 流式（`/query/stream`、`/search/stream`）与 FastMCP 工具（`core_ingest`、`core_query`、`core_retrieve_text`、`core_retrieve_visual`）。

### 非目标

- **不做 Agent 工作流，不做副作用型 MCP 工具**（ADR-008 红线）。规划、工具循环与决策属于下游 Agent 宿主。
- **不做运行时领域切换**——每个实例一个 `default_namespace`（ADR-002）。多行业 = 多套部署（`EAGLE_RAG_PROFILE`），而非运行时切换。
- **不做格式转换/Office 渲染**——已移除 LibreOffice 与 pixelrag-serve；Excel 直接走 Knowhere。
- **无 FAISS、无 OpenAI / Cohere / 其他供应商**——视觉存储由 Milvus HNSW/DiskANN 承载；模型仅 DeepSeek + Qwen。
- **不是向量数据库、工作流引擎或通用 Web 服务**——产品是只读为主的 RAG 数据层。
- **不做跨存储强一致**——入库是异步任务管线，带审计轨迹；MinIO / Milvus / PG 之间接受最终一致。

## 3. 真正的设计

### 3.1 技术选型与取舍

| 关注点     | 选择                                                                                                                                          | 理由                                                                                                                                                                                                                                                            |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 编排框架   | **LlamaIndex**（`llama_index.core` + 官方集成包）                                                                                             | 提供 RAG 原语（节点 schema、`BaseRetriever`、`CustomQueryEngine`、`MilvusVectorStore`、模型包），又不引入 Agent 编排。LangChain 曾评估并否决：其差异化是 Agent/LCEL 工作流，恰是 ADR-008 排除的范围；迁移需要重写检索器、生成链路与全部模型集成，召回收益为零。 |
| API / 流式 | FastAPI + uvicorn + sse-starlette                                                                                                             | 内网异步 API；SSE 匹配流式步骤（`session/step/sources/token/done`）。                                                                                                                                                                                           |
| 任务队列   | Celery（Redis broker）                                                                                                                        | 异步持久化入库；三队列不同并发（`router` 4 / `knowhere` 8 / `pixelrag` 1）。                                                                                                                                                                                    |
| 向量库     | Milvus 2.6（`pymilvus` + `llama-index-vector-stores-milvus`）                                                                                 | 每个 `plugin_namespace` 一个 Database；双集合 `eagle_text`（1536 维）/ `eagle_visual`（2048 维）；HNSW/DiskANN + 标量过滤。                                                                                                                                     |
| 关系库     | PostgreSQL 16 + SQLModel + SQLAlchemy 2 + Alembic                                                                                             | 文档注册表、去重、会话、任务审计、标签目录。store 内不写 DDL，只走迁移。                                                                                                                                                                                        |
| 对象存储   | MinIO                                                                                                                                         | 分布式 worker 共享文件；`kb_name` 前缀隔离。                                                                                                                                                                                                                    |
| 解析       | Knowhere（`knowhere-python-sdk` HTTP `:5005` 或进程内 `knowhere-parse-sdk`）+ PixelRAG 库（`pixelrag_render` + `pixelrag_embed`）             | 两条专业化管线，均 fail-closed，无 mock。                                                                                                                                                                                                                       |
| 模型       | DeepSeek-V4-Pro（LLM/路由）、Qwen-VL-Max（VLM）、`text-embedding-v4`（1536 维）、Qwen3-VL-Embedding-2B（2048 维，本地或百炼）、`qwen3-rerank` | 产品级供应商锁定；新模型经 LlamaIndex 集成包或插件 `EncoderRegistry` 进入。                                                                                                                                                                                     |
| MCP        | FastMCP ≥ 2.3（HTTP 默认，stdio 兜底）+ tenacity/pybreaker                                                                                    | 为下游 Agent 提供标准工具面，带重试与熔断。                                                                                                                                                                                                                     |
| 前端       | Next.js 16 / React 19 / TS / Bun / Tailwind v4 / HeroUI v3 / next-intl                                                                        | Core 展示层；本仓库垂类无 UI。                                                                                                                                                                                                                                  |

### 3.2 模块划分（核心）

| 模块                                                                   | 职责                                                           | 关键文件                                                                                                                                      |
| ---------------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `api/`                                                                 | FastAPI 路由、Pydantic schema、MCP server、SSE                 | `api/query.py`、`api/ingest.py`、`api/mcp_server.py`、`api/schemas/`                                                                          |
| `ingest/`                                                              | 路由矩阵、Knowhere/PixelRAG 适配器、runner                     | `ingest/router.py`、`ingest/runner.py`、`ingest/knowhere_adapter.py`、`ingest/pixelrag_adapter.py`                                            |
| `index/`                                                               | Milvus store、按 DB 的客户端池、注册表、标签目录               | `index/milvus_text_store.py`、`index/milvus_visual_store.py`、`index/milvus_pool.py`、`index/registry.py`                                     |
| `retrievers/`                                                          | 文本（图）检索与视觉检索                                       | `retrievers/knowhere_graph_retriever.py`、`retrievers/pixelrag_visual_retriever.py`                                                           |
| `router/`                                                              | 查询路由、RRF 融合、重排、LLM 工厂                             | `router/router_engine.py`、`router/selectors.py`、`router/rerank_fusion.py`                                                                   |
| `generation/`                                                          | 多模态答案生成                                                 | `generation/multimodal_engine.py`                                                                                                             |
| `plugins/`                                                             | 微内核：管理器、HookBus、Core 默认插件、编排器                 | `plugins/manager.py`、`plugins/hookbus.py`、`plugins/core_defaults.py`、`plugins/ingest_orchestrator.py`、`plugins/retriever_orchestrator.py` |
| `db/`                                                                  | SQLModel 模型、按 namespace 隔离的仓储                         | `db/models/`、`db/repositories/`、`db/namespace.py`                                                                                           |
| `tasks/`                                                               | Celery 应用、任务状态、死信                                    | `tasks/celery_app.py`、`tasks/state.py`、`tasks/dead_letter.py`                                                                               |
| `kb/`、`sessions/`、`storage/`、`attachments/`、`admin/`、`telemetry/` | 知识库生命周期、会话、MinIO/去重、附件惰性解析、运维、可观测性 | —                                                                                                                                             |

### 3.3 业务流：入库

```
POST /ingest (file | bytes | object_key | URL)
  └─ runner.ingest()
       ├─ 生成 job/document id
       ├─ 按 (sha256, kb_name, plugin_namespace) 去重
       ├─ 上传 MinIO（kb_name 前缀隔离）
       ├─ 创建审计 + 注册文档
       └─ app.send_task(ingest_router)            # router_queue
            └─ ingest.router.ingest_router
                 └─ FallbackChain 路由               # 格式 + 内容形态
                      前缀 knowhere:/pixelrag:
                      → settings.router.mode (text/visual/hybrid)
                      → http(s) URI → PixelRAG
                      → PDF 形态探测 (pypdf/pdfplumber)
                      → 扩展名 → content_type
                 ├─ knowhere → knowhere_parse     # knowhere_queue
                 │    └─ 解析（api SDK :5005 | parser SDK 进程内）
                 │       ├─ 文本节点 + section_summary 节点
                 │       ├─ doc_nav 章节树
                 │       ├─ 关键词目录（document_keywords）
                 │       └─ 视觉分发 → knowhere_visual_chunks / pixelrag_build
                 └─ pixelrag → pixelrag_build      # pixelrag_queue（并发 1）
                      └─ 渲染切片 → Qwen3-VL 2048 维 → upsert eagle_visual
```

文本管线用 Qwen `text-embedding-v4`（1536 维）写入 `eagle_text`；视觉切片带四个融合锚点字段落入 `eagle_visual`。热路径 `PARSE` / `CHUNK` Hook 只增强节点，必须保留 Knowhere 的 `doc_nav` / `path` / 类型化 chunk（ADR-005）。

### 3.4 业务流：查询

```
POST /query | /search | /query/stream | /search/stream
  └─ EagleRouterQueryEngine
       ├─ 解析附件（惰性解析；不写 Milvus）
       ├─ route_query: FallbackChain
       │    ForcedModeSelector → AttachmentSelector → LLMIntentSelector → HeuristicSelector
       ├─ _plan_query_route: CLASSIFY_QUERY Hook → QueryRouteDecision（collection 计划）
       │    + scope 感知并集（scope_filter: kb_names ∪ document_ids ∪ tags）
       ├─ RetrieverOrchestrator.retrieve
       │    每个计划：ANN（Qwen 文本 | Qwen3-VL 视觉 | 插件编码器）
       │    → 计划内重排 → supplement Hook
       │    → merge_rrf → dedupe_cross_collection → RRF_POST_MERGE → 最终重排
       ├─ 两阶段父文档召回：section_summary → path 前缀下钻
       └─ 生成（EagleMultimodalQueryEngine）
            文本答案走 DeepSeek；图像推理走 Qwen-VL-Max
            SSE 事件：session → step(route/recall/rerank) → sources → token* → done
```

代码中的关键保证：空召回列表不参与 RRF 产生虚排位（`merge_rrf`）；跨 collection 重复按 `source_chunk_id` / `(document_id, path)` 折叠（`dedupe_cross_collection`）；单个 collection 计划失败时跳过并记录审计，而不是让整个查询失败（G14）。

### 3.5 插件微内核

`PluginManager` 从 `settings.plugins.enabled` 加载模块（仅仓库内模块；Core `eagle_rag.plugins.core_defaults` 永远最先加载）。每个插件声明 namespace 清单；实例绑定 `settings.plugins.default_namespace` = Milvus Database + PG 仓储过滤。`HookBus` 支持 `invoke_first` / `invoke_all` / `invoke_transform`；热路径 Hook 是 `PARSE` / `CHUNK` / `QUERY_ASSEMBLE`，编排 Hook 包括 `CLASSIFY_*`、`EMBED_*`、`UPSERT_VECTORS`、`CLASSIFY_QUERY`、`QUERY_DENSE_EXPAND`、`RETRIEVE_SUPPLEMENT`、`RRF_POST_MERGE`。编码器经 `EncoderRegistry` 注册；MCP 工具经 `mcp_registry.py` 注册，带 RAG-only 命名（`assert_rag_only_tool_name`）与 G3 namespace 过滤（仅暴露 `core_*` + `default_namespace` 插件工具）。

## 4. 系统上下文图

```
                    ┌─────────────────────────────┐
                    │  内置 UI（Core 展示层）        │
                    └──────────────┬──────────────┘
                                   │ REST/SSE
        ┌───────────────┐          ▼          ┌──────────────────┐
        │ 下游 Agent    │  REST/SSE/MCP       │                  │
        │ （LLM 宿主）   │──────────────────►  │    Eagle-RAG     │
        │              │                     │  （数据层）        │
        └───────────────┘                     │                  │
                                              └───┬──────┬───────┘
                 文件 / URL ──────────────────────►│      │
                                                  │      │
        ┌──────────────┐  HTTP :5005 / 进程内     │      │
        │ Knowhere     │◄─────────────────────────┤      │
        │ （解析器）     │                          │      │
        └──────────────┘                          │      │
        ┌──────────────┐  库引用（pixelrag_*）     │      │
        │ PixelRAG     │◄─────────────────────────┤      │
        └──────────────┘                          │      │
        ┌──────────────┐  DeepSeek / Qwen（百炼）  │
        │ LLM / VLM /  │◄─────────────────────────┤
        │ embed / rerank│                        │
        └──────────────┘                          │
        ┌──────────────┐                          │
        │ Milvus / PG / │◄────────────────────────┤
        │ Redis / MinIO │                         │
        └──────────────┘                          │
```

该图展示 Eagle-RAG 与外部世界的边界：Agent 不直接访问存储，Eagle-RAG 也不拥有 Agent 工作流——它只把检索与上下文组装暴露为工具。

## 5. API

### REST / SSE

- `POST /ingest`——四种来源（文件 / 字节流 / MinIO 对象 / URL）；返回 job id、去重状态与审计日志。经 `kb_name` 多租户（缺省回退 `settings.kb_name`）。
- `POST /search`、`POST /search/stream`——仅检索；返回 `text` + `image` 来源，含路径、分数、`chunk_count`、关键词、页码。
- `POST /query`、`POST /query/stream`——检索 + 生成。SSE 依次发出 `session`、`step`（`route` / `recall` / `rerank`）、`sources`、`token*`、`done`。
- `POST /attachments`——单张 PixelRAG 图片（默认上限 5 MB）；在查询/搜索时惰性解析，从不写入 Milvus。
- 证据类——`GET /documents/{id}/structure`、`/documents/{id}/file`、`/documents/{id}/chunks/{chunk_id}`。
- 知识库/标签/会话/运维——`GET /tags`、`/sessions*`、`/admin/probes`、任务审计。

请求要点（`api/schemas/query.py`）：`mode`（`auto|text|visual|hybrid`）、`filters`（`source_type` / `pipeline` / `year`）、`scope_filter`（`ScopeSelection{kb_names, document_ids, tags}`，**并集**语义）、`attachments`（按 id）以及 MCP 的内联图片字节。

### MCP（`/mcp`，HTTP 默认，stdio 兜底）

| 工具                   | 用途                                |
| ---------------------- | ----------------------------------- |
| `core_ingest`          | 将文件/URL 摄入知识库               |
| `core_query`           | 多模态查询，返回答案 + 来源         |
| `core_retrieve_text`   | 仅文本检索                          |
| `core_retrieve_visual` | 视觉检索（支持内联 `image_base64`） |

工具只允许检索/组装上下文；`assert_rag_only_tool_name` 禁止副作用命名。领域插件注册 `{namespace}_{name}` 工具。

### 设计理由

- `kb_name` 贯穿所有 API、MCP 工具、Celery 任务、Milvus 标量过滤与仓储调用——多租户是横切关注点，不是开关。
- 流式是一等公民：检索 + VLM 生成较慢，客户端可以增量看到 route → recall → rerank → sources → tokens。
- `scope_filter` 把完整并集过滤下推到 Milvus（`_resolve_scope_filter`），标签经标签目录解析为 `document_id`，并带文档数量上限保护。
- 按设计不做鉴权（内网）；需要时由网关补。

## 6. 数据存储

### Milvus 2.6（每个 `plugin_namespace` 一个 Database）

- `eagle_text`——1536 维文本块（HNSW/DiskANN），标量过滤 `kb_name`、`document_id`、`year`、`source_type`、`type`、`path`；去重主键 `(sha256, kb_name, plugin_namespace)`。
- `eagle_visual`——2048 维视觉切片，带融合锚点：`chunk_type`（`tile|image|table`）、`parent_section`、`content_summary`、`source_chunk_id`。
- 客户端按 DB 名池化（`index/milvus_pool.py`），永不关闭。

### PostgreSQL 16（SQLModel + Alembic）

表：`documents`、`document_keywords`（标签目录）、`images`、`sessions` + `messages`、`task_audit`（审计/重试）、`document_dedup`、`knowledge_bases`、`attachments`、`notifications`、`mcp_call_log`、`system_setting`、`metric_samples`。每条注册表数据都带 `kb_name` + `plugin_namespace`；仓储按 namespace 过滤（`db/repositories/`）。

### Redis 7 / MinIO

Redis 是 Celery broker + 结果后端；MinIO 按 `kb_name` 前缀存储上传文件，worker 按 object key 拉取。

### 取舍

选 Milvus 而非 FAISS，因为需要托管 ANN + 标量过滤 + Database 隔离；代价是外部服务依赖以及与 PG 的最终一致。PG 保存关系型事实（注册表、审计、会话）；Milvus 只放可重建的向量（重新解析即可恢复）。

## 7. 代码与伪代码

只在代码本身就是设计点的地方贴代码：

```python
# 查询路由（简化自 router/router_engine.py）
decision = FallbackChain([
    ForcedModeSelector(default_mode=cfg.mode),   # text/visual/hybrid 覆盖
    AttachmentSelector(),                        # 图片附件 → visual
    LLMIntentSelector(llm, prompt, enabled),     # LLM 意图分类
    HeuristicSelector(rules, default),           # 关键词兜底
]).select(ctx)
```

```python
# RRF 融合核心（router/rerank_fusion.py）——空列表防护是设计点
non_empty = [lst for lst in plan_results if lst]
for lst in non_empty:
    for rank, nws in enumerate(lst, start=1):
        scores[key(nws)] += 1 / (k + rank)       # k = settings.router.rrf_k
```

其余不再贴代码：真正的重点在第 3–6 节的取舍，而非实现细节。

## 8. 约束的程度

这是一个**强约束的存量系统**，更靠近「大量决策已被锁定」的一端：

- **已锁定**：基础设施（Milvus 2.6 / PG 16 / Redis / MinIO）、模型供应商（仅 DeepSeek + Qwen）、解析 SDK（Knowhere、PixelRAG 库）、LlamaIndex 作为集成层、ADR-008 红线（无 Agent 工作流、无副作用 MCP 工具）、单域部署、中英双语文档、仓库规范（ruff/mypy、仅 Alembic 改 DDL、英文注释）。
- **缝隙内的自由度**：插件 Hook 与清单、经 `EncoderRegistry` 新增 collection/编码器、新增带 namespace 的 MCP 工具、入库/查询路由规则、Core 前端（仅展示；垂类无 UI）。
- **设计启示**：新功能应扩展插件/Hook 而非改核心；框架替换（如 LlamaIndex → LangChain）成本高、收益低——锁定的决策已覆盖通用部分，剩余的自研逻辑（路由、融合、多租户、插件总线）是与框架无关的领域代码。

遗留说明：`eagle_rag/__init__.py` 的 docstring 仍保留重构前的描述 "for the finance and tax domain"；产品现已行业无关（AGENTS.md），建议在后续清理中更新。
