# AGENTS.md — api-lifecycle-devex-ax

> A [platformpioneer.io](https://platformpioneer.io) open-source playbook by [Darshit Pandya](https://platformpioneer.io)

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
| `SCORING.md` | **Authoritative scoring methodology** — every check, every weight, standards alignment |
| `01-spec-pattern/schema/capability-schema.json` | Versioned JSON Schema for `x-capability` (v1.0.0) |
| `01-spec-pattern/before.yaml` | Typical API spec — no intent metadata |
| `01-spec-pattern/after.yaml` | Same spec — agent-ready (reference implementation) |
| `02-governance/.spectral.yml` | 5 lint rules enforcing agent-readiness |
| `03-agent-bridge/mapping-guide.md` | OpenAPI → MCP tool definitions |
| `tools/scan.js` | CLI scanner — 14 checks, Markdown/JSON report |
| `04-measure/lifecycle-scorecard.md` | 30-question self-assessment |
| `04-measure/devex-metrics.md` | TTFHW and developer churn measurement |

## When explaining a failing check

Always consult `SCORING.md` before explaining why a check failed. It contains:
- The exact rationale for each check (D1–D5, A1–A5, G1–G3, R1–R3)
- The weight justification (why 5 pts vs 10 pts)
- The specific RFC, OWASP rule, or industry guideline each check aligns to
- Known gaps and open questions the community is debating

Example: if A3 (safety classification) fails, `SCORING.md` explains it aligns to RFC 9110 §9.2 and OWASP API8:2023 — not just "safety is missing".

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
