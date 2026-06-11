# Routing Methodology

How this project decides **which model for which task** — and how a recommendation
earns the right to be trusted.

This document exists because the routing in `routing.json` is only as useful as the
process behind it. Without a method, routing is just one person's preference. With a
method, it becomes a claim others can verify, reproduce, and improve.

---

## 1. The task label system

A "task type" is not "a thing you do." It is a **bundle of demands on a model**. We
classify tasks along three axes, because these are the axes that actually change which
model wins:

| Axis | Values | Why it changes model choice |
|------|--------|------------------------------|
| **Reasoning need** | `light` / `medium` / `heavy` | Heavy reasoning justifies flagship cost; light does not |
| **Output kind** | mechanical / structural / generative / judgment | Mechanical edits reward cheap+precise; judgment rewards depth |
| **Context need** | small / large / very-large (≥1M) | Eliminates models that physically cannot hold the input |

A task type is the **intersection** of a point on each axis, named for the work
(`spec-architecture`, `mechanical-edit`, `test-design`, …). Two tasks that share all
three axis values should route to the same model; if they don't, the label is too coarse
and should be split.

### Tiers are a consequence, not an input

`T1`/`T2`/`T3` are shorthand for the resulting cost/capability band:

- **T1** — heavy reasoning or judgment; flagship-class; cost is secondary.
- **T2** — medium reasoning; mid-tier; balance cost and quality.
- **T3** — light/mechanical; cheapest model that passes a reviewer gate.

The tier is derived *after* placing the task on the three axes — never assigned first.

---

## 2. A routing entry's anatomy

Each `task_types` entry carries three slots and an evidence block:

```json
{
  "tier": "T2",
  "reasoning_need": "medium",
  "primary":   { "provider": "...", "model_id": "...", "model_ref": "..." },
  "fallback":  { ... },   // when primary is unavailable / rate-limited
  "downgrade": { ... },   // acceptable quality loss to save cost; null = no safe downgrade
  "evidence":  { "confidence": "...", "source": "...", "metric": "...", "url": null }
}
```

- **primary** — what you actually want.
- **fallback** — same quality tier, different provider (availability insurance). Must be
  *cross-provider* from primary so a single provider outage doesn't take out both.
- **downgrade** — a cheaper model you accept *with* a quality compromise. If no model can
  do the job acceptably cheaper, this is `null`. Never invent a downgrade to fill the slot.

---

## 3. The evidence standard

This is the core discipline. **A routing claim is only as strong as its evidence.**

`evidence.confidence` is one of:

| Confidence | Bar to claim it |
|------------|-----------------|
| `high` | Reproducible signal: a benchmark with a number, or ≥10 internal cases with a recorded pass/fail metric, sourced. |
| `medium` | Directional signal: a handful of internal cases, or a credible external benchmark not yet reproduced here. |
| `low` | Hunch / single observation / inherited default. **Must be flagged; treated as provisional.** |

Rules:

1. **No silent assertions.** Every entry has an `evidence` block. "GLM is bad at e2e tests"
   is not routing data until it says *which* cases, *what* metric, and *how confident*.
2. **Confidence can only rise with samples.** A `low` entry stays `low` until new evidence
   is recorded. Time does not increase confidence; data does.
3. **Cross-provider review.** When evidence comes from one model reviewing another's output,
   reviewer and reviewed must be from different providers, to avoid same-family blind spots.
4. **Redline overrides evidence.** A `redline: true` task is never routed away from its
   model regardless of cost evidence — that is a policy choice, recorded as such.

`validate.mjs` emits a warning for every `low`-confidence entry, so the gaps stay visible.

---

## 4. How to add or change a routing entry

1. **Place the task on the three axes.** If it matches an existing type's axes, reuse it.
2. **Pick a primary** from the candidate models that satisfy the context axis.
3. **Run the smallest honest test** you can: a few representative cases, recording a metric
   (pass@1, reviewer score, did-it-compile, etc.) — not a vibe.
4. **Record evidence** with the real `confidence`. If you only have a hunch, say `low`.
5. **Set fallback (cross-provider) and downgrade (or null).**
6. `npm run validate` must pass; `npm run build` to refresh the merged artifact.
7. Open a PR describing the test and linking sources.

A `low`-confidence PR with honest evidence is welcome — it makes a gap explicit and invites
someone to strengthen it. A confident claim with no evidence is not.

---

## 5. Known limitations

- Most current evidence is from a single maintainer's internal sessions with a small sample.
  Confidence values reflect that honestly. Contributions that raise a `low`/`medium` entry to
  `high` with reproducible data are the single most valuable kind of PR here.
- The objective layer (prices/capabilities) is only as current as the last `npm run sync`.
- Provider plan pricing (e.g. coding-plan flat rates) may differ from the per-token public
  price in `models.json`; routing notes flag this where it matters.
