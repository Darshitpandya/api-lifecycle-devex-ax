# AGENTS.md — api-lifecycle-devex-ax

Universal context for AI agents and coding tools working in this repo.

## What this repo is

A production-ready playbook for APIs that deliver world-class **DevEx** (Developer Experience) and **AX** (Agent Experience) — for humans, pipelines, and AI agents simultaneously.

## Core concepts

- **x-capability** — custom OpenAPI extension that adds intent metadata to every operation
- **DevEx** — quality from a developer's perspective: TTFHW, onboarding friction, developer churn
- **AX (Agent Experience)** — quality from an AI agent's perspective: intent resolution rate, invocation success
- **The lifecycle** — 6 stages: Design → Build → Discover → Operate → Evolve → Sunset
- **Three consumer planes** — 👩‍💻 Human · 🔧 Pipeline · 🤖 Agent

## Key files

| File | Purpose |
|---|---|
| `01-spec-pattern/schema/capability-schema.json` | JSON Schema for `x-capability` |
| `01-spec-pattern/before.yaml` | Typical API spec — no intent metadata |
| `01-spec-pattern/after.yaml` | Same spec — agent-ready (reference implementation) |
| `02-governance/.spectral.yml` | 5 lint rules enforcing agent-readiness |
| `03-agent-bridge/mapping-guide.md` | OpenAPI → MCP tool definitions |
| `tools/scan.js` | CLI scanner — 14 checks, Markdown/JSON report |
| `04-measure/lifecycle-scorecard.md` | 30-question self-assessment |
| `04-measure/devex-metrics.md` | TTFHW and developer churn measurement |

## When annotating OpenAPI specs

Add `x-capability` to every operation:

```yaml
x-capability:
  intent: "Plain-language description of what this accomplishes"  # required
  domain: commerce                                                 # required
  safety: mutating                                                 # required: safe | mutating | destructive
  side-effects: [payment-capture, inventory-reserve]              # required for mutating/destructive
  composable-with: [checkInventory, dispatchFulfillment]          # recommended
  idempotency: supported                                           # supported | not-supported | natural
```

Error responses must use RFC 9457 Problem Details (`application/problem+json`).

## Lint command

```bash
cd governance && npm install && npm run lint:api -- --spec ../your-spec.yaml
```

## Scan command (automated assessment)

```bash
cd tools && npm install && node scan.js --spec ../your-spec.yaml
```

## When creating MCP tool definitions

- `operationId` → tool `name`
- `x-capability.intent` → tool `description`
- Request body schema → `inputSchema`

See `03-agent-bridge/mapping-guide.md` for the full guide.
