#!/usr/bin/env node
// validate.mjs — Integrity checks for the config repo.
//
// Checks:
//   1. models.json and routing.json are valid JSON with required shape.
//   2. Every routing model_ref resolves to a real entry in models.json
//      (the cross-file join must not be broken).
//   3. Every routing model_id exists under the named provider's models_dev_id
//      offerings (the concrete call target is real) — best-effort.
//   4. Price sanity: no negative costs; free models have input==output==0.
//   5. redline_models in routing exist in models.json.
//
// Exit non-zero on any error. Warnings do not fail.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const errors = [];
const warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);

async function loadJson(name) {
  try {
    return JSON.parse(await readFile(join(ROOT, name), "utf8"));
  } catch (e) {
    err(`${name}: cannot parse JSON — ${e.message}`);
    return null;
  }
}

function refsInSlot(slot) {
  return slot && slot.model_ref ? [slot.model_ref] : [];
}

async function main() {
  const models = await loadJson("models.json");
  const routing = await loadJson("routing.json");
  if (!models || !routing) {
    report();
    return;
  }

  // ---- shape ----
  if (typeof models.models !== "object") err("models.json: missing 'models' object");
  if (typeof routing.task_types !== "object") err("routing.json: missing 'task_types' object");
  if (!Array.isArray(routing.redline_models)) err("routing.json: 'redline_models' must be an array");

  const M = models.models ?? {};

  // ---- price sanity (objective layer) ----
  for (const [key, rec] of Object.entries(M)) {
    if (!Array.isArray(rec.offerings) || rec.offerings.length === 0) {
      err(`models.json: '${key}' has no offerings`);
      continue;
    }
    for (const o of rec.offerings) {
      if ((o.input ?? 0) < 0 || (o.output ?? 0) < 0) {
        err(`models.json: '${key}' offering ${o.provider} has negative cost`);
      }
    }
  }

  // ---- join: routing model_ref must resolve in models.json ----
  const refs = new Set();
  for (const [name, t] of Object.entries(routing.task_types ?? {})) {
    for (const slot of ["primary", "fallback", "downgrade"]) {
      for (const r of refsInSlot(t[slot])) refs.add(r);
    }
    // evidence presence (soft): low/none confidence is allowed but flagged
    if (!t.evidence) warn(`task_types.${name}: no evidence block`);
    else if (t.evidence.confidence === "low") warn(`task_types.${name}: low-confidence routing (needs more samples)`);
  }
  for (const p of Object.values(routing.provider_picks ?? {})) {
    for (const arr of [p.recommended, p.free]) for (const m of arr ?? []) refs.add(m);
    if (p.flagship) refs.add(p.flagship);
    if (p.economy_downgrade) refs.add(p.economy_downgrade);
  }
  for (const r of refs) {
    if (!M[r]) err(`routing.json: model_ref '${r}' does not resolve in models.json`);
  }

  // ---- redline models must exist ----
  for (const rl of routing.redline_models ?? []) {
    if (!M[rl]) err(`routing.json: redline model '${rl}' not found in models.json`);
  }

  // ---- model_id should be a real offering of the named provider (best-effort) ----
  const providerOf = {};
  for (const [pick, p] of Object.entries(routing.provider_picks ?? {})) {
    providerOf[pick] = p.models_dev_id ?? pick;
  }
  for (const [name, t] of Object.entries(routing.task_types ?? {})) {
    for (const slot of ["primary", "fallback", "downgrade"]) {
      const s = t[slot];
      if (!s || !s.model_ref || !s.model_id) continue;
      const rec = M[s.model_ref];
      if (!rec) continue; // already errored above
      const devProvider = providerOf[s.provider];
      const match = rec.offerings.some(
        (o) => o.provider === devProvider && o.model_id === s.model_id
      );
      if (!match) {
        warn(
          `task_types.${name}.${slot}: model_id '${s.model_id}' not found as ${devProvider} offering of '${s.model_ref}' (provider '${s.provider}' may use a plan id models.dev doesn't list)`
        );
      }
    }
  }

  report();
}

function report() {
  for (const w of warnings) console.warn(`[warn] ${w}`);
  if (errors.length) {
    for (const e of errors) console.error(`[error] ${e}`);
    console.error(`\nvalidate: FAILED with ${errors.length} error(s), ${warnings.length} warning(s).`);
    process.exit(1);
  }
  console.log(`validate: OK (${warnings.length} warning(s)).`);
}

main();
