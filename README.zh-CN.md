# AI Resource Config

**[English](README.md)** | **[中文](README.zh-CN.md)**

**多 Provider AI 模型目录，含定价、路由策略和 MCP 资源。**

帮助个人开发者和小团队管理跨多个 Provider 的 AI 成本与模型选型。

## 目录结构

```
ai-resource-config/
├── model-map.json          # 主配置：模型 + 定价 + 路由
├── providers/              # 各 Provider 详情（规划中）
└── tools/                  # CLI 工具（规划中）
```

## 快速开始

### 获取配置

```bash
# 一行命令获取
curl -s https://raw.githubusercontent.com/dingmanjiang/ai-resource-config/main/model-map.json \
  -o model-map.snapshot.json

# 或在代码中使用
const MODEL_MAP_URL = "https://raw.githubusercontent.com/dingmanjiang/ai-resource-config/main/model-map.json";
const config = await fetch(MODEL_MAP_URL).then(r => r.json());
```

### 使用数据

```javascript
// 查找最便宜的模型（用于 trigger/ping）
const zenmux = config.providers.zenmux;
const cheapest = zenmux.all_models
  .sort((a, b) => (a.cost.input + a.cost.output) - (b.cost.input + b.cost.output))[0];
console.log(cheapest.id); // "stepfun/step-3.7-flash-free"

// 获取免费模型
console.log(zenmux.free); // ["stepfun/step-3.7-flash-free", "z-ai/glm-4.7-flash-free", ...]

// 获取 Z.AI 的 MCP 资源
const zai = config.providers.zai;
console.log(zai.mcp.map(m => m.name)); // ["web-search-prime", "web-reader", "zread"]
```

## 数据结构

### `model-map.json`

| 字段 | 说明 |
|------|------|
| `providers[].all_models[]` | 完整模型列表，含定价（`cost.input`、`cost.output`，单位 $/MTok） |
| `providers[].recommended[]` | 生产环境推荐模型 |
| `providers[].free[]` | 零成本模型 |
| `providers[].mcp[]` | MCP 服务器资源（url、auth、capabilities） |
| `task_types{}` | 任务 → 模型路由推荐 |

### 当前覆盖的 Provider

| Provider | 角色 | 模型数 | 免费 | MCP |
|----------|------|--------|------|-----|
| ZenMux | 聚合平台（按量付费） | 58 | 4 | - |
| Z.AI | 编码套餐 | 5 | 1 | 3 |
| OpenAI Plus | OAuth 直连 | 4 | - | - |

## 更新周期

- **30 天 review** 或 **旗舰模型发布** 触发更新
- 数据来源：Provider API、官方定价页
- 欢迎社区 PR 修正数据

## 使用场景

1. **成本优化**：为你的任务找最便宜的模型
2. **Trigger 模型选择**：测试哪个免费/低价模型能触发用量重置
3. **MCP 发现**：查找 Provider 提供的 MCP 工具
4. **多 Provider 路由**：将任务路由到合适的模型

## 贡献

欢迎 PR！详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

- 添加新 Provider
- 更新定价
- 改进 task_type 路由
- 添加 CLI 工具

## 许可证

MIT

## 相关项目

- [LiteLLM](https://github.com/BerriAI/litellm) - 运行时 AI 网关
- [OpenRouter](https://openrouter.ai) - 模型聚合平台
- [AgentOps](https://github.com/AgentOps-AI/agentops) - 成本追踪 SDK
