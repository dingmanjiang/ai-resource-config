# Contributing to AI Resource Config

**[English](CONTRIBUTING.md)** | **[中文](CONTRIBUTING.zh-CN.md)**

Thanks for your interest! This project has two layers — please contribute to the right one.

## Which layer?

| Layer | File | How it's maintained | Contribute by |
|-------|------|---------------------|---------------|
| **Objective** | `models.json` | Auto-synced from [models.dev](https://models.dev) | Do **not** hand-edit. Fix upstream at models.dev, or open an issue here |
| **Subjective** | `routing.json` | Hand-maintained | PRs welcome — this is the value-add |

**Do not hand-edit `models.json` or `model-map.json`.** They are generated. Editing them
will be overwritten by `npm run sync` / `npm run build` and will fail CI.

## The most valuable contribution: routing evidence

The single most useful PR is one that **strengthens a routing recommendation with evidence** —
turning a `low`/`medium` confidence entry into `high` with reproducible data.

Read [METHODOLOGY.md](METHODOLOGY.md) first. Then:

1. Pick a `task_types` entry in `routing.json`.
2. Run the smallest honest test (a few cases, a recorded metric — not a vibe).
3. Update its `primary`/`fallback`/`downgrade` and `evidence` block:
   ```json
   "evidence": {
     "confidence": "high",
     "source": "Terminal-Bench 2026-05 / 12 internal cases",
     "metric": "pass@1 0.82 vs GLM 0.51",
     "url": "https://..."
   }
   ```
4. `npm run validate` must pass.

An honest `low`-confidence PR that exposes a gap is welcome. A confident claim with no
evidence is not.

## Other contributions

### Add a provider to the objective layer
Edit the whitelist in `tools/sync.config.json`, then `npm run sync`. Use the models.dev
provider id (check with the models.dev API). Do not hand-add models.

### Add MCP resources
Add under `mcp` in `routing.json`:
```json
"mcp": {
  "provider-name": [
    { "name": "...", "url": "...", "type": "remote",
      "auth": "header:Authorization=${ENV_VAR}",
      "capabilities": ["..."], "note": "..." }
  ]
}
```

### Correct a price
Prices come from models.dev. If one is wrong, fix it upstream at
[models.dev](https://github.com/sst/models.dev), then `npm run sync` here.

## PR process

1. Fork and branch.
2. Make changes to `routing.json` (or `tools/sync.config.json`).
3. `npm run ci` (validate + build) must pass.
4. Commit the regenerated `model-map.json` alongside your change.
5. Open a PR describing the change, the test method, and sources.

## Questions?

Open an issue for discussion.
