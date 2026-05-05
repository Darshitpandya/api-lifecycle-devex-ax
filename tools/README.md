# Automated Assessment

CLI scanner that checks whether an OpenAPI spec has been enriched with the intent metadata pattern this playbook introduces (`x-capability`). It measures **readiness for the pattern** — not general API quality.

## What this scanner is — and isn't

**It is:** A readiness checker that tells you how much of the `x-capability` intent metadata pattern is present in a spec.

**It isn't:** A general API quality checker. Any real-world public API (Stripe, GitHub, Twilio) will score low because none of them use `x-capability` yet — that's the gap this playbook exists to close.

**The right way to use it:**
1. Run it against a real spec → see the gaps (this is the *problem statement*)
2. Add `x-capability` following `01-spec-pattern/after.yaml` → re-run → see the improvement
3. The before/after contrast is the value, not the absolute score

The included `01-spec-pattern/before.yaml` and `after.yaml` are the canonical before/after — same API, one without the pattern, one with it.

## Usage

```bash
# Install (once)
npm install

# Scan a spec — shows what's missing
node scan.js --spec ../your-spec.yaml

# See the before/after contrast with the included examples
node scan.js --spec ../01-spec-pattern/before.yaml   # 🔴 missing intent metadata
node scan.js --spec ../01-spec-pattern/after.yaml    # 🟡 intent metadata present

# Save report to file
node scan.js --spec ../your-spec.yaml --output report.md

# JSON output (for CI pipelines, dashboards, custom tooling)
node scan.js --spec ../your-spec.yaml --format json
```

## In CI (GitHub Actions)

Copy `.github/workflows/api-scan.yml` into your repo. It runs on every PR that touches a YAML file and posts the report as a PR comment automatically. Zero config.

## What it checks (14 checks)

**Spec checks (C1–C10):** Whether `x-capability` intent metadata is present and complete.

| ID | Check | Blocks merge? |
|---|---|---|
| C1 | x-capability on every operation | ❌ Blocks merge |
| C2 | intent declared | ❌ Blocks merge |
| C3 | safety classification (safe/mutating/destructive) | ❌ Blocks merge |
| C4 | side-effects on mutating operations | ❌ Blocks merge |
| C5 | domain declared | ❌ Blocks merge |
| C6 | idempotency documented | ❌ Blocks merge |
| C7 | RFC 9457 error responses (application/problem+json) | ❌ Blocks merge |
| C8 | composable-with declared | ⚠️ Warn only |
| C9 | operationId present (required for MCP tool name) | ❌ Blocks merge |
| C10 | ProblemDetails schema in components | ❌ Blocks merge |

**Repo structure checks (R1–R4):** Whether the lifecycle tooling is in place.

| ID | Check | Status |
|---|---|---|
| R1 | `.spectral.yml` exists (Design stage governance) | ❌ Blocks merge |
| R2 | GitHub Actions workflow exists (Build stage CI) | ❌ Blocks merge |
| R3 | MCP server config exists (Discover stage) | ℹ️ Next step |
| R4 | Deprecation runway has dates filled in (Sunset stage) | ℹ️ Next step |

## Exit codes

- `0` — all checks pass (or only warnings/info)
- `1` — one or more hard failures

## What this can't assess

The scanner covers everything objectively verifiable from the spec. For TTFHW, developer churn, product ownership, and org maturity — see [`04-measure/`](../04-measure/).
