# Automated Assessment

CLI scanner that generates an agent-readiness report for any OpenAPI spec. Works on any machine, any organisation, any repo.

## Usage

```bash
# Install (once)
npm install

# Scan a local spec — Markdown report to stdout
node scan.js --spec ../your-spec.yaml

# Save report to file
node scan.js --spec ../your-spec.yaml --output report.md

# JSON output (for CI pipelines, dashboards, custom tooling)
node scan.js --spec ../your-spec.yaml --format json

# Test against the included examples
npm test
```

## In CI (GitHub Actions)

Copy `.github/workflows/api-scan.yml` into your repo. It runs on every PR that touches a YAML file and posts the report as a PR comment automatically. Zero config.

## What it checks (10 checks)

| ID | Check | Blocks merge? |
|---|---|---|
| C1 | x-capability on every operation | ✅ Yes |
| C2 | intent declared | ✅ Yes |
| C3 | safety classification (safe/mutating/destructive) | ✅ Yes |
| C4 | side-effects on mutating operations | ✅ Yes |
| C5 | domain declared | ✅ Yes |
| C6 | idempotency documented | ✅ Yes |
| C7 | RFC 9457 error responses (application/problem+json) | ✅ Yes |
| C8 | composable-with declared | ⚠️ Warn only |
| C9 | operationId present (required for MCP tool name) | ✅ Yes |
| C10 | ProblemDetails schema in components | ✅ Yes |

## Exit codes

- `0` — all checks pass (or only warnings)
- `1` — one or more hard failures

## What this can't assess

The scanner covers everything objectively verifiable from the spec. For TTFHW, developer churn, product ownership, and org maturity — see [`lifecycle-assessment/`](../lifecycle-assessment/).
