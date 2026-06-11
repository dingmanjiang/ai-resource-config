# AI Resource Config

**[English](README.md)** | **[中文](README.zh-CN.md)**

**A two-layer AI model decision base: objective data aggregated from upstream, plus hand-curated task routing.**

This is not another model leaderboard. It is a directly consumable config that answers three questions for an individual/small-team AI developer:

1. **What models exist, and where can I get them, for how much?** (cross-provider price comparison)
2. **Which model should I use for this kind of task?** (task → model routing, with evidence)
3. **What MCP tools can each provider give me?**

## Architecture: two layers

```
models.json     # OBJECTIVE — auto-synced from models.dev (MIT). Never hand-edited.
                #   model catalog · capabilities · cross-provider pricing
routing.json    # SUBJECTIVE — hand-maintained. The actual value-add.
                #   task_types routing · curated picks · redline · MCP · contract
model-map.json  # MERGED artifact (objective + subjective), for one-fetch consumers.
tools/          # sync.mjs · validate.mjs · build.mjs
```

**Why split?** The objective layer (prices, context windows, capabilities) is a commodity — we do not re-maintain it by hand; we derive it from [models.dev](https://models.dev). The subjective layer (what to use when) is the only part that needs human judgment, and the only part worth contributing to.

## Quick Start

### Fetch

```bash
# Objective layer (model catalog + cross-provider pricing)
curl -sO https://raw.githubusercontent.com/dingmanjiang/ai-resource-config/main/models.json

# Subjective layer (routing + curated picks)
curl -sO https://raw.githubusercontent.com/dingmanjiang/ai-resource-config/main/routing.json

# Or the merged single file
curl -sO https://raw.githubusercontent.com/dingmanjiang/ai-resource-config/main/model-map.json
```

> Consumers should pin a release tag rather than `main` to lock the schema.

### Cross-provider price comparison

```javascript
const models = await fetch(MODELS_URL).then(r => r.json());

// Same model, every provider that offers it, sorted cheapest-first.
const opus = models.models["claude opus 4.8"];
console.log(opus.offerings);
// [ {provider:"zenmux", input:5, output:25}, {provider:"anthropic", ...}, ... ]
console.log(opus.cheapest); // { provider: "zenmux", total_per_mtok: 30 }
```

### Task routing (join the two layers)

```javascript
const routing = await fetch(ROUTING_URL).then(r => r.json());

const task = routing.task_types["spec-architecture"];
console.log(task.primary);   // { provider:"zenmux", model_id:"...", model_ref:"claude opus 4.8", effort:"high" }
console.log(task.evidence);  // { confidence:"high", source:"...", ... }

// model_ref joins back into the objective layer for price/capability:
const priced = models.models[task.primary.model_ref];
```

## Data layers in detail

### `models.json` (objective, generated)

| Field | Description |
|-------|-------------|
| `models[key].offerings[]` | Every whitelisted provider offering this model, with `input`/`output`/`cache_read` cost in $/MTok |
| `models[key].cheapest` | Lowest-cost provider for this model |
| `models[key].context` / `reasoning` / `modalities` | Capability metadata |
| keyed by normalized display name | e.g. `"claude opus 4.8"` — stable across providers |

Whitelist of aggregated providers lives in `tools/sync.config.json`. OpenRouter is included as a *price-comparison basis only* (kept only where another provider also offers the model).

### `routing.json` (subjective, hand-maintained)

| Field | Description |
|-------|-------------|
| `task_types{}` | task → `primary`/`fallback`/`downgrade`, each with `model_ref` + `evidence` |
| `provider_picks{}` | per-provider `recommended` / `flagship` / `economy_downgrade` / `free` |
| `redline_models[]` | models that must never be routed away from |
| `mcp{}` | MCP server resources per provider |
| `consumption_contract{}` | how to fetch, stale policy, trigger-model policy |

Routing methodology — how task labels are defined and how a model pairing earns its `evidence` — is documented in [METHODOLOGY.md](METHODOLOGY.md).

## Maintenance workflow

```bash
npm run sync       # refresh models.json from models.dev
npm run validate   # check JSON + cross-file model_ref join + price sanity
npm run build      # regenerate merged model-map.json
npm run ci         # all of the above (what CI runs)
```

- **Objective layer**: `npm run sync` on a 30-day cadence or after a flagship release. You only review the diff.
- **Subjective layer**: edit `routing.json` by hand when your testing changes a recommendation. Add/raise `evidence.confidence` as samples accumulate.
- CI hard-gates `validate` + merged-artifact freshness; `sync-drift` is a soft signal that models.dev moved.

## Use Cases

1. **Cost optimization** — find the cheapest provider for a given model
2. **Task routing** — which model for which task, with the evidence behind it
3. **Trigger-model selection** — sort `offerings` by cost to test usage-reset triggers
4. **MCP discovery** — available MCP tools per provider

## Contributing

PRs welcome — especially routing evidence. See [CONTRIBUTING.md](CONTRIBUTING.md) and [METHODOLOGY.md](METHODOLOGY.md).

## Attribution

Objective model data is derived from [models.dev](https://github.com/sst/models.dev) (MIT). Subjective routing and curation are original to this project.

## License

MIT

## Related Projects

- [models.dev](https://models.dev) — the open model database this project's objective layer is derived from
- [LiteLLM](https://github.com/BerriAI/litellm) — runtime AI gateway
- [OpenRouter](https://openrouter.ai) — model aggregator
