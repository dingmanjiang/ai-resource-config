# AGENTS.md

Instructions for AI coding agents working in this repository.

## Project Overview

AI Resource Config is a public data/config repository for AI model selection. It has two layers:

- `models.json`: objective model catalog and cross-provider pricing generated from models.dev.
- `routing.json`: subjective, hand-maintained task routing, provider picks, redline policy, MCP resources, and consumption contract.

`model-map.json` is the generated merged artifact for consumers that want one fetch.

## Repository Layout

- `README.md`: human overview and quick start.
- `llms.txt`: AI-readable project/documentation index.
- `METHODOLOGY.md`: routing evidence standard and task taxonomy.
- `CONTRIBUTING.md`: contribution rules.
- `models.json`: generated objective layer; do not hand-edit.
- `routing.json`: hand-maintained subjective layer; primary edit target for routing changes.
- `model-map.json`: generated merged artifact; do not hand-edit.
- `tools/sync.mjs`: refreshes `models.json` from models.dev.
- `tools/validate.mjs`: validates JSON, joins, pricing sanity, and artifact freshness.
- `tools/build.mjs`: regenerates `model-map.json`.
- `.github/workflows/ci.yml`: CI hard-gates validation and generated artifact freshness; sync drift is non-blocking.

## Commands

Use Node.js 22, matching GitHub Actions.

```bash
npm run sync       # refresh models.json from models.dev
npm run validate   # validate JSON + cross-file joins + price sanity
npm run build      # regenerate model-map.json
npm run ci         # sync check + validate + build
```

For documentation-only changes, `npm run validate` is usually sufficient.

## Editing Rules

- Do not hand-edit `models.json`. Change upstream models.dev data or `tools/sync.config.json`, then run `npm run sync`.
- Do not hand-edit `model-map.json`. Edit `routing.json` or regenerate with `npm run build`.
- Prefer editing `routing.json` for project-specific value: task routing, provider picks, redline models, MCP resources, and consumption contract.
- Every routing recommendation must have an `evidence` block.
- Do not inflate `evidence.confidence`; use `low` when evidence is weak.
- Fallbacks should be cross-provider from primary when possible.
- Redline tasks/models are policy constraints; do not route them away for cost optimization.
- Keep generated files committed when their sources change.

## Validation Expectations

- After any `routing.json`, `tools/sync.config.json`, or generated data change, run `npm run validate`.
- After routing or sync changes, run `npm run build` and include the regenerated `model-map.json` diff.
- Before opening or updating a PR, run `npm run ci` when feasible.
- Existing low-confidence routing warnings are allowed unless the task is to improve evidence quality.

## Contribution Priorities

- Strengthen low/medium-confidence routing entries with reproducible evidence.
- Add or split task types only when the existing task axes are too coarse.
- Add MCP resources with clear auth and capability notes.
- Fix objective pricing/capability data upstream in models.dev, then sync here.

## Avoid

- Vibe-based model ranking changes without evidence.
- Duplicating objective pricing/capability data in subjective routing notes.
- Treating public token price as equivalent to subscription or coding-plan economics without a note.
- Large rewrites of the data schema without an explicit migration need.
