#!/usr/bin/env node
/**
 * api-lifecycle-scan — API Lifecycle Readiness Scanner
 *
 * Scores any OpenAPI spec across 4 dimensions (25 pts each = 100 total).
 * With --fix, writes x-capability skeleton to every failing operation.
 *
 * Usage:
 *   node scan.js --spec path/to/spec.yaml
 *   node scan.js --spec path/to/spec.yaml --fix
 *   node scan.js --spec path/to/spec.yaml --fix --fill-ai
 *   node scan.js --spec path/to/spec.yaml --fix --output enriched-spec.yaml
 *   node scan.js --spec path/to/spec.yaml --format json
 *   node scan.js --spec path/to/spec.yaml --output report.md
 */

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

// ─── CLI args ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };
const has = (flag) => args.includes(flag);

const specPath = get("--spec");
const outputPath = get("--output");
const format = get("--format") || "terminal";
const fixMode = has("--fix");
const fillAi = has("--fill-ai");

if (!specPath) {
  console.error("Usage: node scan.js --spec <spec.yaml> [--fix [--fill-ai]] [--output file] [--format terminal|json|markdown]");
  process.exit(1);
}

// ─── Colours ──────────────────────────────────────────────────────────────────

const c = {
  reset:  "\x1b[0m",
  bold:   "\x1b[1m",
  red:    "\x1b[31m",
  green:  "\x1b[32m",
  yellow: "\x1b[33m",
  blue:   "\x1b[34m",
  cyan:   "\x1b[36m",
  white:  "\x1b[37m",
  gray:   "\x1b[90m",
  bgRed:  "\x1b[41m",
  bgGreen:"\x1b[42m",
  bgYellow:"\x1b[43m",
};

const noColor = format !== "terminal" || !!outputPath;
const col = (code, text) => noColor ? text : `${code}${text}${c.reset}`;

// ─── Load spec ────────────────────────────────────────────────────────────────

let spec;
try {
  const raw = fs.readFileSync(path.resolve(specPath), "utf8");
  spec = yaml.load(raw);
} catch (e) {
  console.error(`Failed to load spec: ${e.message}`);
  process.exit(1);
}

// ─── Extract operations ───────────────────────────────────────────────────────

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"];
const MUTATING = ["post", "put", "patch", "delete"];
const operations = [];

for (const [pathKey, pathItem] of Object.entries(spec.paths || {})) {
  for (const method of HTTP_METHODS) {
    if (pathItem[method]) operations.push({ path: pathKey, method, op: pathItem[method] });
  }
}

const specDir = path.dirname(path.resolve(specPath));

function findUp(filename, startDir) {
  let dir = startDir;
  for (let i = 0; i < 6; i++) {
    if (fs.existsSync(path.join(dir, filename))) return path.join(dir, filename);
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return null;
}

// ─── Fix mode ─────────────────────────────────────────────────────────────────

if (fixMode) {
  let fixCount = 0;
  for (const [, pathItem] of Object.entries(spec.paths || {})) {
    for (const method of HTTP_METHODS) {
      if (!pathItem[method]) continue;
      const op = pathItem[method];
      if (op["x-capability"]) continue;
      const isMutating = MUTATING.includes(method);

      // --fill-ai: derive intent hint from existing summary/description
      let intentValue = "TODO: describe what this operation accomplishes in plain language";
      let domainValue = "TODO: e.g. commerce, identity, fulfillment";
      if (fillAi && (op.summary || op.description)) {
        const hint = op.summary || op.description;
        intentValue = `AI-SUGGESTED: ${hint.trim()} — review and refine`;
        // Attempt simple domain inference from path/tags
        const tag = op.tags?.[0];
        if (tag) domainValue = tag.toLowerCase();
      }

      op["x-capability"] = {
        intent: intentValue,
        domain: domainValue,
        safety: method === "delete" ? "destructive" : isMutating ? "mutating" : "safe",
        ...(isMutating ? { "side-effects": ["TODO: list side effects"] } : {}),
        "composable-with": ["TODO: list operationIds this chains with, or remove"],
        idempotency: method === "get" || method === "put" ? "natural" : isMutating ? "supported" : "natural",
      };
      fixCount++;
    }
  }
  const fixOut = outputPath || specPath.replace(/\.ya?ml$/, "-enriched.yaml");
  fs.writeFileSync(fixOut, yaml.dump(spec, { lineWidth: 120, noRefs: true }));

  const minsPerOp = 2;
  const totalMins = fixCount * minsPerOp;
  const timeEst = totalMins <= 2 ? "~2 min" : totalMins <= 10 ? `~${totalMins} min` : `~${Math.ceil(totalMins / 60 * 10) / 10} hr`;

  console.log(col(c.green + c.bold, `✅  Fixed ${fixCount} operation(s) — x-capability skeleton added`));
  console.log(col(c.cyan, `📄  Written to: ${fixOut}`));
  console.log();
  console.log(col(c.bold, "Next steps:"));
  if (fillAi) {
    console.log(`  1. Review AI-SUGGESTED intent fields in ${fixOut} (${fixCount} ops · ${timeEst} estimated)`);
    console.log(`     Each field starts with "AI-SUGGESTED:" — edit to confirm or refine`);
  } else {
    console.log(`  1. Open ${fixOut} and replace every TODO (${fixCount} ops · ~${minsPerOp} min each · ${timeEst} total)`);
    console.log(`     💡 Tip: run with --fill-ai to pre-populate intent from your existing summaries`);
  }
  console.log(`  2. Re-run: node scan.js --spec ${fixOut}`);
  console.log(`  3. Generate MCP config: node ../03-agent-bridge/generate-mcp.js --spec ${fixOut}`);
  process.exit(0);
}

// ─── Scoring: 4 dimensions × 25 pts = 100 ────────────────────────────────────
//
//  DevEx (25)      — clarity, discoverability, developer onboarding quality
//  AX    (25)      — agent readiness: intent, safety, composability, errors
//  Governance (25) — CI, Spectral, deprecation runway in repo
//  Reliability(25) — idempotency, versioning signals, contract testability

const results = { devex: [], ax: [], governance: [], reliability: [] };

function check(dim, id, label, fn) {
  const r = fn();
  results[dim].push({ id, label, ...r });
}

// ── DevEx checks (25 pts, 5 checks × 5 pts each) ─────────────────────────────

check("devex", "D1", "operationId on all operations", () => {
  const missing = operations.filter(o => !o.op.operationId);
  return { pass: missing.length === 0, pts: 5,
    detail: missing.length === 0 ? "All operations have operationId" : `Missing on: ${missing.map(o => `${o.method.toUpperCase()} ${o.path}`).join(", ")}`,
    fix: "Add operationId to every operation — required for SDK generation and MCP tool names" };
});

check("devex", "D2", "summary or description on all operations", () => {
  const missing = operations.filter(o => !o.op.summary && !o.op.description);
  return { pass: missing.length === 0, pts: 5,
    detail: missing.length === 0 ? "All operations have summary/description" : `Missing on: ${missing.map(o => `${o.method.toUpperCase()} ${o.path}`).join(", ")}`,
    fix: "Add summary or description to every operation" };
});

check("devex", "D3", "servers block defined", () => {
  const has = spec.servers && spec.servers.length > 0;
  return { pass: has, pts: 5,
    detail: has ? `${spec.servers.length} server(s) defined` : "No servers block — developers don't know where to call",
    fix: "Add a servers block with at least a sandbox URL" };
});

check("devex", "D4", "contact info in info block", () => {
  const has = spec.info?.contact?.email || spec.info?.contact?.url;
  return { pass: !!has, pts: 5,
    detail: has ? "Contact info present" : "No contact info — developers don't know who to reach",
    fix: "Add info.contact with email or url" };
});

check("devex", "D5", "error responses use RFC 9457 Problem Details", () => {
  const ERROR_CODES = ["400", "401", "403", "404", "409", "422", "500"];
  const violations = [];
  for (const { path: p, method, op } of operations) {
    for (const code of ERROR_CODES) {
      const resp = op.responses?.[code];
      if (!resp) continue;
      if (!resp.content?.["application/problem+json"]) violations.push(`${method.toUpperCase()} ${p} → ${code}`);
    }
  }
  return { pass: violations.length === 0, pts: 5,
    detail: violations.length === 0 ? "All error responses use application/problem+json" : `Not using Problem Details: ${violations.slice(0,3).join(", ")}${violations.length > 3 ? ` +${violations.length-3} more` : ""}`,
    fix: "Use content-type application/problem+json for error responses (RFC 9457)" };
});

// ── AX checks (25 pts, 5 checks × 5 pts each) ────────────────────────────────

check("ax", "A1", "x-capability on all operations", () => {
  const missing = operations.filter(o => !o.op["x-capability"]);
  return { pass: missing.length === 0, pts: 5,
    detail: missing.length === 0 ? `All ${operations.length} operations have x-capability` : `Missing on: ${missing.map(o => `${o.method.toUpperCase()} ${o.path}`).join(", ")}`,
    fix: "Add x-capability to each operation. Run --fix to generate skeleton." };
});

check("ax", "A2", "intent declared on all operations", () => {
  const missing = operations.filter(o => !o.op["x-capability"]?.intent || o.op["x-capability"].intent.includes("TODO"));
  return { pass: missing.length === 0, pts: 5,
    detail: missing.length === 0 ? "All operations have intent" : `Missing/TODO intent on: ${missing.map(o => `${o.method.toUpperCase()} ${o.path}`).join(", ")}`,
    fix: "Add x-capability.intent — plain-language description of what this operation accomplishes" };
});

check("ax", "A3", "safety classification on all operations", () => {
  const VALID = ["safe", "mutating", "destructive"];
  const missing = operations.filter(o => !VALID.includes(o.op["x-capability"]?.safety));
  return { pass: missing.length === 0, pts: 5,
    detail: missing.length === 0 ? "All operations have safety classification" : `Missing on: ${missing.map(o => `${o.method.toUpperCase()} ${o.path}`).join(", ")}`,
    fix: "Add x-capability.safety: safe | mutating | destructive" };
});

check("ax", "A4", "side-effects declared on mutating operations", () => {
  const mutating = operations.filter(o => MUTATING.includes(o.method));
  const missing = mutating.filter(o => !o.op["x-capability"]?.["side-effects"]?.length || o.op["x-capability"]["side-effects"][0]?.includes("TODO"));
  return { pass: missing.length === 0, pts: 5,
    detail: missing.length === 0 ? `All ${mutating.length} mutating operations declare side-effects` : `Missing on: ${missing.map(o => `${o.method.toUpperCase()} ${o.path}`).join(", ")}`,
    fix: "Add x-capability.side-effects: [list of side effects]" };
});

check("ax", "A5", "idempotency documented on all operations", () => {
  const VALID = ["supported", "not-supported", "natural"];
  const missing = operations.filter(o => !VALID.includes(o.op["x-capability"]?.idempotency));
  return { pass: missing.length === 0, pts: 5,
    detail: missing.length === 0 ? "All operations document idempotency" : `Missing on: ${missing.map(o => `${o.method.toUpperCase()} ${o.path}`).join(", ")}`,
    fix: "Add x-capability.idempotency: supported | not-supported | natural" };
});

// ── Governance checks (25 pts) ────────────────────────────────────────────────

check("governance", "G1", "Spectral ruleset exists (.spectral.yml)", () => {
  const found = findUp(".spectral.yml", specDir) || findUp("governance-as-code/.spectral.yml", specDir);
  return { pass: !!found, pts: 10,
    detail: found ? `Found: ${path.relative(specDir, found)}` : "No .spectral.yml found",
    fix: "Add governance-as-code/.spectral.yml — copy from this playbook repo" };
});

check("governance", "G2", "GitHub Actions CI workflow exists", () => {
  const workflowDir = findUp(".github/workflows", specDir);
  let found = null;
  if (workflowDir) {
    try { found = fs.readdirSync(workflowDir).find(f => f.endsWith(".yml") || f.endsWith(".yaml")); } catch (_) {}
  }
  return { pass: !!found, pts: 10,
    detail: found ? `Found: .github/workflows/${found}` : "No GitHub Actions workflow found",
    fix: "Add .github/workflows/api-lint.yml — copy from this playbook repo" };
});

check("governance", "G3", "Deprecation runway template exists", () => {
  const found = findUp("governance-as-code/deprecation-runway.md", specDir) || findUp("deprecation-runway.md", specDir);
  const hasPlaceholder = found ? fs.readFileSync(found, "utf8").includes("[YYYY-MM-DD]") : true;
  return { pass: !!found && !hasPlaceholder, pts: 5,
    info: !!found && hasPlaceholder,
    detail: !found ? "No deprecation-runway.md found" : hasPlaceholder ? "Template found — fill in dates when you deprecate an API" : "Deprecation runway template found with dates",
    fix: "Add governance-as-code/deprecation-runway.md and fill in dates when starting a deprecation" };
});

// ── Reliability checks (25 pts) ───────────────────────────────────────────────

check("reliability", "R1", "ProblemDetails schema in components", () => {
  const schemas = spec.components?.schemas || {};
  const has = Object.keys(schemas).some(k => k.toLowerCase().includes("problem") || k.toLowerCase().includes("error"));
  return { pass: has, pts: 10,
    detail: has ? "ProblemDetails schema found in components" : "No ProblemDetails/Error schema in components/schemas",
    fix: "Add ProblemDetails schema to components/schemas (RFC 9457: type, title, status, detail, instance)" };
});

check("reliability", "R2", "composable-with declared (workflow planning)", () => {
  const missing = operations.filter(o => !o.op["x-capability"]?.["composable-with"]?.length || o.op["x-capability"]["composable-with"][0]?.includes("TODO"));
  return { pass: missing.length === 0, pts: 10,
    detail: missing.length === 0 ? "All operations declare composability" : `Missing on: ${missing.map(o => `${o.method.toUpperCase()} ${o.path}`).join(", ")}`,
    fix: "Add x-capability.composable-with: [operationIds] — helps agents plan multi-step workflows" };
});

check("reliability", "R3", "MCP server config exists", () => {
  const candidates = ["mcp-server.json", "03-agent-bridge/mcp-server.json", ".kiro/settings/mcp.json"];
  const found = candidates.map(c => findUp(c, specDir)).find(Boolean);
  return { pass: !!found, pts: 5,
    info: !found,
    detail: found ? `Found: ${path.relative(specDir, found)}` : "No MCP server config — expected next step after enriching spec",
    fix: "Generate MCP config: node 03-agent-bridge/generate-mcp.js --spec your-spec.yaml --base-url https://your-api.com" };
});

// ─── Score calculation ────────────────────────────────────────────────────────

function dimScore(dim) {
  return results[dim].reduce((sum, c) => sum + (c.pass ? c.pts : 0), 0);
}

const scores = {
  devex:      dimScore("devex"),
  ax:         dimScore("ax"),
  governance: dimScore("governance"),
  reliability:dimScore("reliability"),
};
const total = Object.values(scores).reduce((a, b) => a + b, 0);

// ─── Terminal output ──────────────────────────────────────────────────────────

function bar(score, max, width = 20) {
  const filled = Math.round((score / max) * width);
  const empty = width - filled;
  const colour = score === max ? c.green : score >= max * 0.6 ? c.yellow : c.red;
  return col(colour, "█".repeat(filled)) + col(c.gray, "░".repeat(empty));
}

function statusIcon(check) {
  if (check.pass) return col(c.green, "✅");
  if (check.info) return col(c.cyan, "ℹ️ ");
  return col(c.red, "❌");
}

function totalBand(score) {
  if (score >= 85) return col(c.green + c.bold, "● Agent-Ready");
  if (score >= 60) return col(c.yellow + c.bold, "● Close — address the gaps");
  return col(c.red + c.bold, "● Needs work");
}

const W = 62;
const border = "═".repeat(W);
const specName = path.basename(specPath);

if (format === "json") {
  const out = JSON.stringify({ spec: specPath, total, scores, results }, null, 2);
  outputPath ? fs.writeFileSync(outputPath, out) : console.log(out);
  process.exit(Object.values(results).flat().some(c => !c.pass && !c.info) ? 1 : 0);
}

// Strip ANSI to measure visible length
const stripAnsi = (s) => s.replace(/\x1b\[[0-9;]*m/g, "");
const visLen = (s) => stripAnsi(s).length;
// Pad a string (which may contain ANSI) to visible width W
const vPad = (s, w) => s + " ".repeat(Math.max(0, w - visLen(s)));

const lines = [];
const p = (line = "") => lines.push(line);

const BOX_L = col(c.bold, "║");
const BOX_R = col(c.bold, "║");

p(col(c.bold, `╔${border}╗`));
p(BOX_L + vPad(col(c.bold + c.white, `  API Lifecycle Readiness Report · ${specName}`), W) + BOX_R);
p(col(c.bold, `╠${border}╣`));
p(BOX_L + vPad(`  Overall Score: ${col(c.bold, `${total}/100`)}   ${totalBand(total)}`, W) + BOX_R);
p(col(c.bold, `╠${border}╣`));
p(BOX_L + vPad(col(c.gray, `  Dimension       Score   Progress`), W) + BOX_R);
p(BOX_L + vPad(col(c.gray, `  ${"─".repeat(W - 2)}`), W) + BOX_R);

const dims = [
  { key: "devex",       label: "DevEx      ", max: 25 },
  { key: "ax",          label: "AX         ", max: 25 },
  { key: "governance",  label: "Governance ", max: 25 },
  { key: "reliability", label: "Reliability", max: 25 },
];

for (const d of dims) {
  const s = scores[d.key];
  const scoreStr = `${s}/${d.max}`.padStart(5);
  const b = bar(s, d.max, 22);
  const content = `  ${d.label}  ${scoreStr}   ${b}`;
  p(BOX_L + vPad(content, W) + BOX_R);
}

p(col(c.bold, `╚${border}╝`));
p();

// Per-dimension details
for (const d of dims) {
  const checks = results[d.key];
  const dimTotal = scores[d.key];
  const dimMax = d.max;
  p(col(c.bold, `  ${d.label.trim()} (${dimTotal}/${dimMax})`));
  for (const ch of checks) {
    const icon = statusIcon(ch);
    const pts = ch.pass ? col(c.green, `+${ch.pts}`) : col(c.gray, ` 0`);
    p(`  ${icon}  ${pts}  ${col(c.bold, ch.id)}  ${ch.label}`);
    if (!ch.pass && !ch.info) p(col(c.gray, `         ${ch.detail}`));
  }
  p();
}

// Next steps
const failures = Object.values(results).flat().filter(c => !c.pass && !c.info);
if (failures.length > 0) {
  p(col(c.bold, "  Next Steps"));
  p(col(c.gray, "  ─────────────────────────────────────────────────────────────"));
  failures.forEach(ch => {
    p(`  ${col(c.yellow, "→")}  ${col(c.bold, ch.id)}  ${ch.fix}`);
  });
  p();
  if (failures.some(c => ["A1","A2","A3"].includes(c.id))) {
    p(`  ${col(c.cyan + c.bold, "💡  Run with --fix to auto-generate x-capability skeleton:")}`);
    p(`     ${col(c.white + c.bold, `node scan.js --spec ${specPath} --fix`)}`);
    p();
  }
}

p(col(c.gray, `  Generated by api-lifecycle-devex-ax · platformpioneer.io`));

const output = lines.join("\n");

if (outputPath) {
  // Strip ANSI for file output
  const clean = output.replace(/\x1b\[[0-9;]*m/g, "");
  fs.writeFileSync(outputPath, clean);
  console.log(`Report written to ${outputPath}`);
} else {
  console.log(output);
}

const hardFails = Object.values(results).flat().filter(c => !c.pass && !c.info);
process.exit(hardFails.length > 0 ? 1 : 0);
