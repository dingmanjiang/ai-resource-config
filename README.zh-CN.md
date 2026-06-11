# AI Resource Config

**[English](README.md)** | **[中文](README.zh-CN.md)**

**两层式 AI 模型决策基座：从上游聚合的客观数据，加上人工精选的任务路由。**

这不是又一个模型排行榜。它是一个可直接消费的配置文件，回答个人/小团队 AI 开发者的三个问题：

1. **有哪些模型，从哪里获取，价格多少？**（跨 Provider 价格比较）
2. **这类任务该用哪个模型？**（任务 → 模型路由，附证据）
3. **每个 Provider 能给我哪些 MCP 工具？**

## 架构：两层

```
models.json     # 客观层 — 从 models.dev 自动同步（MIT 协议）。禁止手动编辑。
                #   模型目录 · 能力参数 · 跨 Provider 定价
routing.json    # 主观层 — 人工维护。项目的核心价值所在。
                #   task_types 路由 · 精选推荐 · 红线模型 · MCP · 消费契约
model-map.json  # 合并产物（客观 + 主观），供一次性拉取的消费者使用。
tools/          # sync.mjs · validate.mjs · build.mjs
```

**为什么要拆分？** 客观层（价格、上下文窗口、能力参数）是大路货——不值得手动维护；我们直接从 [models.dev](https://models.dev) 派生。主观层（什么场景用什么模型）才是需要人工判断的部分，也是值得贡献的部分。

## 快速开始

### 拉取数据

```bash
# 客观层（模型目录 + 跨 Provider 定价）
curl -sO https://raw.githubusercontent.com/dingmanjiang/ai-resource-config/main/models.json

# 主观层（路由 + 精选推荐）
curl -sO https://raw.githubusercontent.com/dingmanjiang/ai-resource-config/main/routing.json

# 或直接拉取合并后的单文件
curl -sO https://raw.githubusercontent.com/dingmanjiang/ai-resource-config/main/model-map.json
```

> 消费者应锁定 release tag 而非 `main` 分支，以固定 schema 版本。

### 跨 Provider 价格比较

```javascript
const models = await fetch(MODELS_URL).then(r => r.json());

// 同一模型，所有提供该模型的 Provider，按价格从低到高排列
const opus = models.models["claude opus 4.8"];
console.log(opus.offerings);
// [ {provider:"zenmux", input:5, output:25}, {provider:"anthropic", ...}, ... ]
console.log(opus.cheapest); // { provider: "zenmux", total_per_mtok: 30 }
```

### 任务路由（关联两层）

```javascript
const routing = await fetch(ROUTING_URL).then(r => r.json());

const task = routing.task_types["spec-architecture"];
console.log(task.primary);   // { provider:"zenmux", model_id:"...", model_ref:"claude opus 4.8", effort:"high" }
console.log(task.evidence);  // { confidence:"high", source:"...", ... }

// model_ref 可回连客观层，获取价格/能力信息：
const priced = models.models[task.primary.model_ref];
```

## 数据层详解

### `models.json`（客观层，自动生成）

| 字段 | 说明 |
|------|------|
| `models[key].offerings[]` | 所有白名单 Provider 对该模型的报价，含 `input`/`output`/`cache_read` 价格（$/MTok） |
| `models[key].cheapest` | 该模型的最低成本 Provider |
| `models[key].context` / `reasoning` / `modalities` | 能力元数据 |
| 以标准化显示名为 key | 如 `"claude opus 4.8"`——跨 Provider 稳定 |

聚合 Provider 白名单位于 `tools/sync.config.json`。OpenRouter 仅作为价格比较基准纳入（仅当另一 Provider 也提供该模型时才保留）。

### `routing.json`（主观层，人工维护）

| 字段 | 说明 |
|------|------|
| `task_types{}` | 任务 → `primary`/`fallback`/`downgrade`，每个都带 `model_ref` + `evidence` |
| `provider_picks{}` | 每个 Provider 的 `recommended` / `flagship` / `economy_downgrade` / `free` |
| `redline_models[]` | 绝不可被路由替换的模型 |
| `mcp{}` | 每个 Provider 的 MCP 服务器资源 |
| `consumption_contract{}` | 如何拉取、过期策略、触发模型策略 |

路由方法论——任务标签如何定义、模型组合如何赢得其 `evidence`——详见 [METHODOLOGY.md](METHODOLOGY.md)。

## 维护工作流

```bash
npm run sync       # 从 models.dev 刷新 models.json
npm run validate   # 校验 JSON + 跨文件 model_ref 关联 + 价格合理性
npm run build      # 重新生成合并后的 model-map.json
npm run ci         # 执行以上全部（CI 实际运行的命令）
```

- **客观层**：按 30 天周期或在旗舰模型发布后执行 `npm run sync`。你只需 review diff。
- **主观层**：当你的测试结果改变了推荐时，手动编辑 `routing.json`。随着样本积累，添加/提高 `evidence.confidence`。
- CI 强制门控 `validate` + 合并产物的时效性；`sync-drift` 是 models.dev 有更新的软信号。

## 使用场景

1. **成本优化** — 为指定模型找到最便宜的 Provider
2. **任务路由** — 哪种任务用哪个模型，背后有证据支撑
3. **触发模型选择** — 按 cost 排序 `offerings`，测试用量重置触发器
4. **MCP 发现** — 查看每个 Provider 可用的 MCP 工具

## 贡献

欢迎 PR——尤其是路由证据。详见 [CONTRIBUTING.md](CONTRIBUTING.md) 和 [METHODOLOGY.md](METHODOLOGY.md)。

## 致谢

客观模型数据派生自 [models.dev](https://github.com/sst/models.dev)（MIT 协议）。主观路由和精选内容为本项目原创。

## 许可证

MIT

## 相关项目

- [models.dev](https://models.dev) — 本项目客观层的数据来源，开放模型数据库
- [LiteLLM](https://github.com/BerriAI/litellm) — 运行时 AI 网关
- [OpenRouter](https://openrouter.ai) — 模型聚合平台
