# Contributing to AI Resource Config

**[English](CONTRIBUTING.md)** | **[中文](CONTRIBUTING.zh-CN.md)**

Thanks for your interest in contributing!

## Ways to Contribute

### 1. Update Pricing Data

Pricing changes frequently. If you spot outdated prices:

1. Check the provider's official pricing page
2. Update `model-map.json` with correct values
3. Submit a PR with source link in description

### 2. Add New Providers

To add a new provider (e.g., Groq, Together, Fireworks):

1. Add entry in `providers` section of `model-map.json`:

```json
"groq": {
  "role": "inference-provider",
  "all_models": [
    {"id": "llama-3.3-70b", "cost": {"input": 0.59, "output": 0.79}, "context": 131072, "reasoning": true}
  ],
  "recommended": ["llama-3.3-70b"],
  "free": [],
  "flagship": "llama-3.3-70b",
  "economy_downgrade": "llama-3.3-8b",
  "mcp": []
}
```

2. Include data source (API endpoint or pricing page URL)

### 3. Add MCP Resources

If a provider offers MCP servers:

```json
"mcp": [
  {
    "name": "tool-name",
    "url": "https://...",
    "type": "remote",
    "auth": "header:Authorization=${ENV_VAR}",
    "capabilities": ["capability1", "capability2"],
    "note": "Brief description"
  }
]
```

### 4. Improve Task Type Routing

The `task_types` section maps task categories to recommended models. If you have evidence (benchmarks, real-world testing) that a different model works better:

1. Describe the task type
2. Share your testing methodology
3. Propose the change

## Pull Request Process

1. Fork the repo
2. Create a branch: `git checkout -b add-groq-provider`
3. Make your changes
4. Test JSON validity: `cat model-map.json | jq .`
5. Submit PR with description of changes and data sources

## Data Quality Guidelines

- **Source everything**: Include links to official pricing pages or API responses
- **Use consistent units**: Pricing in $/MTok (dollars per million tokens)
- **Mark uncertainty**: If a price is estimated, add a `note` field
- **Keep it simple**: We're not tracking every model variant, focus on commonly used ones

## Questions?

Open an issue for discussion.
