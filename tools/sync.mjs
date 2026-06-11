#!/usr/bin/env node
// sync.mjs — Derive the objective layer (models.json) from models.dev (MIT).
//
// What it does:
//   1. Fetch models.dev/api.json (or read a local snapshot via --from).
//   2. Keep only providers in the whitelist (config.providers_of_interest).
//   3. Merge per-provider model entries into model-centric records, keyed by a
//      normalized display name, so the same model offered by multiple providers
//      is collapsed into one record with an `offerings[]` price comparison.
//   4. Apply per-provider include filters (e.g. OpenRouter = "compare basis only":
//      only keep its models that also appear under another whitelisted provider).
//   5. Write models.json. The subjective layer (routing.json) is never touched.
//
// Usage:
//   node tools/sync.mjs                 # fetch live, write models.json
//   node tools/sync.mjs --from snap.json
//   node tools/sync.mjs --check         # do not write; exit 1 if output would change

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "models.json");
const CONFIG_PATH = join(__dirname, "sync.config.json");
const API_URL = "https://models.dev/api.json";

const args = process.argv.slice(2);
const fromIdx = args.indexOf("--from");
const fromFile = fromIdx !== -1 ? args[fromIdx + 1] : null;
const checkOnly = args.includes("--check");

// ---------- helpers ----------

// Normalize a display name into a stable merge key.
// "Claude Opus 4.8" -> "claude opus 4.8"; collapses whitespace, lowercases.
function nameKey(name) {
  return String(name).toLowerCase().replace(/\s+/g, " ").trim();
}

function round(n) {
  return Math.round(n * 1e6) / 1e6;
}

function totalPerMTok(cost) {
  if (!cost) return null;
  const i = cost.input ?? 0;
  const o = cost.output ?? 0;
  return round(i + o);
}

async function loadJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function fetchApi() {
  if (fromFile) {
    return loadJson(fromFile);
  }
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error(`fetch ${API_URL} failed: ${res.status}`);
  return res.json();
}

// ---------- main ----------

async function main() {
  const config = await loadJson(CONFIG_PATH);
  const whitelist = config.providers_of_interest;
  const filters = config.provider_filters ?? {};

  const api = await fetchApi();

  // Pass 1: build model records keyed by normalized name.
  // Each record accumulates offerings from every whitelisted provider.
  const records = new Map(); // nameKey -> record

  for (const providerId of whitelist) {
    const provider = api[providerId];
    if (!provider) {
      console.warn(`[warn] provider not found in models.dev: ${providerId}`);
      continue;
    }
    for (const [modelId, m] of Object.entries(provider.models ?? {})) {
      const key = nameKey(m.name ?? modelId);
      let rec = records.get(key);
      if (!rec) {
        rec = {
          name: m.name ?? modelId,
          family: m.family ?? null,
          reasoning: !!m.reasoning,
          context: m.limit?.context ?? null,
          output_limit: m.limit?.output ?? null,
          modalities: m.modalities ?? null,
          open_weights: !!m.open_weights,
          release_date: m.release_date ?? null,
          offerings: [],
        };
        records.set(key, rec);
      }
      // Prefer richer capability metadata if a later provider has it.
      if (rec.context == null && m.limit?.context != null) rec.context = m.limit.context;
      if (rec.modalities == null && m.modalities) rec.modalities = m.modalities;

      rec.offerings.push({
        provider: providerId,
        model_id: modelId,
        input: m.cost?.input ?? null,
        output: m.cost?.output ?? null,
        cache_read: m.cost?.cache_read ?? null,
        cache_write: m.cost?.cache_write ?? null,
      });
    }
  }

  // Pass 2: apply per-provider "include only if overlapping" filter.
  // For a provider like openrouter configured as "overlap_only", drop its
  // offering from any record where it is the *only* provider.
  for (const [provId, rule] of Object.entries(filters)) {
    if (rule !== "overlap_only") continue;
    for (const rec of records.values()) {
      const hasOther = rec.offerings.some((o) => o.provider !== provId);
      if (!hasOther) {
        rec.offerings = rec.offerings.filter((o) => o.provider !== provId);
      }
    }
  }

  // Drop records left with no offerings; compute cheapest.
  const models = {};
  for (const rec of records.values()) {
    if (rec.offerings.length === 0) continue;
    rec.offerings.sort((a, b) => (totalPerMTok(a) ?? Infinity) - (totalPerMTok(b) ?? Infinity));
    const cheap = rec.offerings[0];
    rec.cheapest = {
      provider: cheap.provider,
      total_per_mtok: totalPerMTok(cheap),
    };
    models[nameKey(rec.name)] = rec;
  }

  const sortedKeys = Object.keys(models).sort();
  const sortedModels = {};
  for (const k of sortedKeys) sortedModels[k] = models[k];

  const output = {
    $source: "models.dev (MIT licensed) — https://models.dev/api.json",
    $note: "Objective layer. Auto-generated by tools/sync.mjs. Do NOT hand-edit. Subjective routing lives in routing.json.",
    synced_at: new Date().toISOString().slice(0, 10),
    providers_of_interest: whitelist,
    provider_filters: filters,
    model_count: sortedKeys.length,
    models: sortedModels,
  };

  const serialized = JSON.stringify(output, null, 2) + "\n";

  if (checkOnly) {
    let current = "";
    try {
      current = await readFile(OUT, "utf8");
    } catch {
      /* missing file => changed */
    }
    // Ignore synced_at when diffing, so a same-day re-run is stable.
    const strip = (s) => s.replace(/"synced_at": "[^"]*"/, '"synced_at": "*"');
    if (strip(current) !== strip(serialized)) {
      console.error("[check] models.json is out of date. Run: node tools/sync.mjs");
      process.exit(1);
    }
    console.log("[check] models.json is up to date.");
    return;
  }

  await writeFile(OUT, serialized);
  console.log(`[ok] wrote ${OUT} — ${sortedKeys.length} models from ${whitelist.length} providers.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
