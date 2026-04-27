#!/usr/bin/env node
/**
 * ax-scan — API Agent-Readiness Scanner
 *
 * Scans an OpenAPI spec and generates a DevEx + AX readiness report.
 *
 * Usage:
 *   node scan.js --spec path/to/spec.yaml
 *   node scan.js --spec path/to/spec.yaml --output report.md
 *   node scan.js --spec path/to/spec.yaml --format json
 *   npx ax-scan --spec path/to/spec.yaml
 */

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

// ─── CLI args ────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const get = (flag) => {
  const i = args.indexOf(flag);
  return i !== -1 ? args[i + 1] : null;
};

const specPath = get("--spec");
const outputPath = get("--output");
const format = get("--format") || "markdown";

if (!specPath) {
  console.error("Usage: node scan.js --spec <path-to-openapi-spec.yaml> [--output report.md] [--format markdown|json]");
  process.exit(1);
}

// ─── Load spec ───────────────────────────────────────────────────────────────

let spec;
try {
  const raw = fs.readFileSync(path.resolve(specPath), "utf8");
  spec = yaml.load(raw);
} catch (e) {
  console.error(`Failed to load spec: ${e.message}`);
  process.exit(1);
}

// ─── Extract operations ──────────────────────────────────────────────────────

const HTTP_METHODS = ["get", "post", "put", "patch", "delete", "head", "options"];
const MUTATING = ["post", "put", "patch", "delete"];

const operations = [];
for (const [pathKey, pathItem] of Object.entries(spec.paths || {})) {
  for (const method of HTTP_METHODS) {
    if (pathItem[method]) {
      operations.push({ path: pathKey, method, op: pathItem[method] });
    }
  }
}

// ─── Checks ──────────────────────────────────────────────────────────────────

const checks = [];

function check(id, description, fn) {
  const results = fn();
  checks.push({ id, description, ...results });
}

// C1 — x-capability present on every operation
check("C1", "x-capability present on all operations", () => {
  const missing = operations.filter((o) => !o.op["x-capability"]);
  return {
    pass: missing.length === 0,
    detail: missing.length === 0
      ? `All ${operations.length} operations have x-capability`
      : `Missing on: ${missing.map((o) => `${o.method.toUpperCase()} ${o.path}`).join(", ")}`,
    fix: "Add x-capability to each operation. See 01-spec-pattern/schema/capability-schema.json",
  };
});

// C2 — intent declared on every operation
check("C2", "intent declared on all operations", () => {
  const missing = operations.filter((o) => !o.op["x-capability"]?.intent);
  return {
    pass: missing.length === 0,
    detail: missing.length === 0
      ? "All operations have intent"
      : `Missing intent on: ${missing.map((o) => `${o.method.toUpperCase()} ${o.path}`).join(", ")}`,
    fix: "Add x-capability.intent — plain-language description of what this operation accomplishes",
  };
});

// C3 — safety classified on every operation
check("C3", "safety classification on all operations (safe|mutating|destructive)", () => {
  const VALID = ["safe", "mutating", "destructive"];
  const missing = operations.filter((o) => !VALID.includes(o.op["x-capability"]?.safety));
  return {
    pass: missing.length === 0,
    detail: missing.length === 0
      ? "All operations have safety classification"
      : `Missing/invalid safety on: ${missing.map((o) => `${o.method.toUpperCase()} ${o.path}`).join(", ")}`,
    fix: "Add x-capability.safety: safe | mutating | destructive",
  };
});

// C4 — side-effects declared on mutating operations
check("C4", "side-effects declared on mutating operations", () => {
  const mutating = operations.filter((o) => MUTATING.includes(o.method));
  const missing = mutating.filter((o) => {
    const cap = o.op["x-capability"];
    return !cap?.["side-effects"] || cap["side-effects"].length === 0;
  });
  return {
    pass: missing.length === 0,
    detail: missing.length === 0
      ? `All ${mutating.length} mutating operations declare side-effects`
      : `Missing side-effects on: ${missing.map((o) => `${o.method.toUpperCase()} ${o.path}`).join(", ")}`,
    fix: "Add x-capability.side-effects: [list of side effects]",
  };
});

// C5 — domain declared on every operation
check("C5", "domain declared on all operations", () => {
  const missing = operations.filter((o) => !o.op["x-capability"]?.domain);
  return {
    pass: missing.length === 0,
    detail: missing.length === 0
      ? "All operations have domain"
      : `Missing domain on: ${missing.map((o) => `${o.method.toUpperCase()} ${o.path}`).join(", ")}`,
    fix: "Add x-capability.domain — business domain (e.g. commerce, identity, fulfillment)",
  };
});

// C6 — idempotency documented on all operations
check("C6", "idempotency documented on all operations", () => {
  const VALID = ["supported", "not-supported", "natural"];
  const missing = operations.filter((o) => !VALID.includes(o.op["x-capability"]?.idempotency));
  return {
    pass: missing.length === 0,
    detail: missing.length === 0
      ? "All operations document idempotency"
      : `Missing idempotency on: ${missing.map((o) => `${o.method.toUpperCase()} ${o.path}`).join(", ")}`,
    fix: "Add x-capability.idempotency: supported | not-supported | natural",
  };
});

// C7 — error responses use RFC 9457 Problem Details
check("C7", "error responses use RFC 9457 Problem Details (application/problem+json)", () => {
  const ERROR_CODES = ["400", "401", "403", "404", "409", "422", "500"];
  const violations = [];
  for (const { path: p, method, op } of operations) {
    for (const code of ERROR_CODES) {
      const resp = op.responses?.[code];
      if (!resp) continue;
      const content = resp.content || {};
      if (!content["application/problem+json"]) {
        violations.push(`${method.toUpperCase()} ${p} → ${code}`);
      }
    }
  }
  return {
    pass: violations.length === 0,
    detail: violations.length === 0
      ? "All error responses use application/problem+json"
      : `Not using Problem Details: ${violations.join(", ")}`,
    fix: "Use content-type application/problem+json for error responses (RFC 9457)",
  };
});

// C8 — composable-with declared (warning, not error)
check("C8", "composable-with declared (workflow planning for agents)", () => {
  const missing = operations.filter((o) => {
    const cap = o.op["x-capability"];
    return !cap?.["composable-with"] || cap["composable-with"].length === 0;
  });
  return {
    pass: missing.length === 0,
    warn: missing.length > 0 && missing.length < operations.length,
    detail: missing.length === 0
      ? "All operations declare composability"
      : `No composable-with on: ${missing.map((o) => `${o.method.toUpperCase()} ${o.path}`).join(", ")}`,
    fix: "Add x-capability.composable-with: [operationIds] — helps agents plan multi-step workflows",
  };
});

// C9 — operationId present on all operations
check("C9", "operationId present on all operations (required for MCP tool name)", () => {
  const missing = operations.filter((o) => !o.op.operationId);
  return {
    pass: missing.length === 0,
    detail: missing.length === 0
      ? "All operations have operationId"
      : `Missing operationId on: ${missing.map((o) => `${o.method.toUpperCase()} ${o.path}`).join(", ")}`,
    fix: "Add operationId to every operation — this becomes the MCP tool name",
  };
});

// C10 — ProblemDetails schema defined in components
check("C10", "ProblemDetails schema defined in components/schemas", () => {
  const schemas = spec.components?.schemas || {};
  const hasProblem = Object.keys(schemas).some((k) =>
    k.toLowerCase().includes("problem") || k.toLowerCase().includes("error")
  );
  return {
    pass: hasProblem,
    detail: hasProblem
      ? "ProblemDetails schema found in components"
      : "No ProblemDetails/Error schema in components/schemas",
    fix: "Add a ProblemDetails schema to components/schemas (RFC 9457: type, title, status, detail, instance)",
  };
});

// ─── Repo structure checks (lifecycle stage signals) ─────────────────────────
// Resolved relative to the spec file's directory

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

function findUpGlob(patterns, startDir) {
  for (const p of patterns) {
    const found = findUp(p, startDir);
    if (found) return found;
  }
  return null;
}

// R1 — Spectral ruleset exists (Design stage)
check("R1", "[Repo] Spectral ruleset exists (.spectral.yml) — Design stage governance", () => {
  const found = findUpGlob([".spectral.yml", ".spectral.yaml", "02-governance/.spectral.yml"], specDir);
  return {
    pass: !!found,
    detail: found ? `Found: ${path.relative(specDir, found)}` : "No .spectral.yml found in repo",
    fix: "Add 02-governance/.spectral.yml — copy from this playbook repo",
  };
});

// R2 — GitHub Actions CI workflow exists (Build stage)
check("R2", "[Repo] GitHub Actions workflow exists — Build stage CI", () => {
  const workflowDir = findUp(".github/workflows", specDir);
  let found = null;
  if (workflowDir) {
    try {
      const files = fs.readdirSync(workflowDir);
      found = files.find((f) => f.endsWith(".yml") || f.endsWith(".yaml"));
    } catch (_) {}
  }
  return {
    pass: !!found,
    detail: found ? `Found workflow: .github/workflows/${found}` : "No .github/workflows/*.yml found",
    fix: "Add a GitHub Actions workflow — copy .github/workflows/api-lint.yml from this playbook repo",
  };
});

// R3 — MCP server config exists (Discover stage)
check("R3", "[Repo] MCP server config exists — Discover stage agent discoverability", () => {
  const candidates = [
    "mcp-server.json",
    "03-agent-bridge/mcp-server.json",
    ".kiro/settings/mcp.json",
    "claude_desktop_config.json",
  ];
  const found = findUpGlob(candidates, specDir);
  return {
    pass: !!found,
    info: !found,  // template-expected: generate this after annotating your spec
    detail: found
      ? `Found: ${path.relative(specDir, found)}`
      : "No MCP server config found — expected next step after annotating your spec",
    fix: "Generate your MCP server config: follow 03-agent-bridge/mapping-guide.md, then register with your MCP host (Claude Desktop, Kiro, or your agent framework)",
  };
});

// R4 — Deprecation runway template exists and has dates filled in (Sunset stage)
check("R4", "[Repo] Deprecation runway template has dates filled in — Sunset stage", () => {
  const found = findUpGlob([
    "02-governance/deprecation-runway.md",
    "deprecation-runway.md",
  ], specDir);
  if (!found) {
    return {
      pass: false,
      detail: "No deprecation-runway.md found",
      fix: "Add 02-governance/deprecation-runway.md — copy from this playbook repo",
    };
  }
  const content = fs.readFileSync(found, "utf8");
  const hasPlaceholder = content.includes("[YYYY-MM-DD]");
  return {
    pass: !hasPlaceholder,
    info: hasPlaceholder,  // template-expected: fill in when you deprecate an API
    detail: hasPlaceholder
      ? "Deprecation runway template found — fill in dates when you deprecate an API"
      : "Deprecation runway template found with dates filled in",
    fix: "Fill in the announce and sunset dates in 02-governance/deprecation-runway.md when you start a deprecation",
  };
});

// ─── Score ───────────────────────────────────────────────────────────────────

const passed = checks.filter((c) => c.pass).length;
const total = checks.length;
const score = passed;
const pct = Math.round((passed / total) * 100);

const band =
  pct >= 90 ? "🟢 Agent-Ready"
  : pct >= 70 ? "🟡 Close — address the gaps"
  : "🔴 Needs work — start with [critical] items";

// ─── Report ──────────────────────────────────────────────────────────────────

const now = new Date().toISOString().split("T")[0];
const specName = path.basename(specPath);

if (format === "json") {
  const report = {
    spec: specPath,
    date: now,
    score: `${score}/${total}`,
    percent: pct,
    band,
    operations: operations.length,
    checks,
  };
  const out = JSON.stringify(report, null, 2);
  if (outputPath) {
    fs.writeFileSync(outputPath, out);
    console.log(`Report written to ${outputPath}`);
  } else {
    console.log(out);
  }
  process.exit(passed === total ? 0 : 1);
}

// Markdown report
const lines = [
  `# API Agent-Readiness Report`,
  ``,
  `**Spec:** \`${specName}\`  `,
  `**Date:** ${now}  `,
  `**Operations scanned:** ${operations.length}  `,
  `**Score:** ${score}/${total} checks passed (${pct}%)  `,
  `**Status:** ${band}`,
  ``,
  `---`,
  ``,
  `## Results`,
  ``,
  `| # | Check | Result | Detail |`,
  `|---|---|---|---|`,
  ...checks.map((c) =>
    `| ${c.id} | ${c.description} | ${c.pass ? "✅ Pass" : c.info ? "ℹ️ Next step" : c.warn ? "⚠️ Warn" : "❌ Fail"} | ${c.detail} |`
  ),
  ``,
];

const failures = checks.filter((c) => !c.pass);
if (failures.length > 0) {
  lines.push(`---`, ``, `## Next Steps`, ``);
  failures.forEach((c) => {
    lines.push(`**${c.id} — ${c.description}**`);
    lines.push(`> ${c.fix}`);
    lines.push(``);
  });
}

lines.push(`---`);
lines.push(``);
lines.push(`*Generated by [api-lifecycle-devex-ax](https://github.com/Darshitpandya/api-lifecycle-devex-ax) — a [platformpioneer.io](https://platformpioneer.io) open-source playbook*`);

const report = lines.join("\n");

if (outputPath) {
  fs.writeFileSync(outputPath, report);
  console.log(`Report written to ${outputPath}`);
} else {
  console.log(report);
}

// Exit 1 if any hard failures (not warnings or info)
const hardFails = checks.filter((c) => !c.pass && !c.warn && !c.info);
process.exit(hardFails.length > 0 ? 1 : 0);
