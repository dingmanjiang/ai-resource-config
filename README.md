# AI Resource Config

**[English](README.md)** | **[中文](README.zh-CN.md)**

**Multi-provider AI model catalog with pricing, routing strategies, and MCP resources.**

Help individual developers and small teams manage AI costs and model selection across multiple providers.

## What's Inside

```
ai-resource-config/
├── model-map.json          # Main config: models + pricing + routing
├── providers/              # Per-provider details (coming soon)
└── tools/                  # CLI utilities (coming soon)
```

## Quick Start

### Fetch the config

```bash
# One-liner fetch
curl -s https://raw.githubusercontent.com/dingmanjiang/ai-resource-config/main/model-map.json \
  -o model-map.snapshot.json

# Or use in your code
const MODEL_MAP_URL = "https://raw.githubusercontent.com/dingmanjiang/ai-resource-config/main/model-map.json";
const config = await fetch(MODEL_MAP_URL).then(r => r.json());
```

### Use the data

```javascript
// Find cheapest model for trigger/ping
const zenmux = config.providers.zenmux;
const cheapest = zenmux.all_models
  .sort((a, b) => (a.cost.input + a.cost.output) - (b.cost.input + b.cost.output))[0];
console.log(cheapest.id); // "stepfun/step-3.7-flash-free"

// Get free models
console.log(zenmux.free); // ["stepfun/step-3.7-flash-free", "z-ai/glm-4.7-flash-free", ...]

// Get MCP resources from Z.AI
const zai = config.providers.zai;
console.log(zai.mcp.map(m => m.name)); // ["web-search-prime", "web-reader", "zread"]
```

## Data Structure

### `model-map.json`

| Field | Description |
|-------|-------------|
| `providers[].all_models[]` | Full model list with pricing (`cost.input`, `cost.output` in $/MTok) |
| `providers[].recommended[]` | Curated models for production use |
| `providers[].free[]` | Zero-cost models |
| `providers[].mcp[]` | MCP server resources (url, auth, capabilities) |
| `task_types{}` | Task → model routing recommendations |

### Providers Currently Tracked

| Provider | Role | Models | Free | MCP |
|----------|------|--------|------|-----|
| ZenMux | Aggregator (PAYG) | 58 | 4 | - |
| Z.AI | Coding Plan | 5 | 1 | 3 |
| OpenAI Plus | OAuth Direct | 4 | - | - |

## Update Cycle

- **30-day review** or **flagship model release** triggers update
- Data sources: Provider APIs, official pricing pages
- Community PRs welcome for corrections

## Use Cases

1. **Cost optimization**: Find cheapest model for your task
2. **Trigger model selection**: Test which free/cheap model can trigger usage reset
3. **MCP discovery**: Find available MCP tools from providers
4. **Multi-provider routing**: Route tasks to appropriate models

## Contributing

PRs welcome! See [CONTRIBUTING.md](CONTRIBUTING.md).

- Add new providers
- Update pricing
- Improve task_type routing
- Add CLI tools

## License

MIT

## Related Projects

- [LiteLLM](https://github.com/BerriAI/litellm) - Runtime AI gateway
- [OpenRouter](https://openrouter.ai) - Model aggregator
- [AgentOps](https://github.com/AgentOps-AI/agentops) - Cost tracking SDK
