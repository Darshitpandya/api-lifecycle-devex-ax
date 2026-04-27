---
inclusion: always
---

# api-lifecycle-devex-ax

Production-ready playbook for APIs that deliver world-class DevEx (Developer Experience) and AX (Agent Experience) — for humans, pipelines, and AI agents simultaneously.

## Core Concepts

- **DevEx** — quality of an API from a developer's perspective: TTFHW, onboarding friction, developer churn
- **AX (Agent Experience)** — quality of an API from an AI agent's perspective: intent resolution rate, first-invocation success
- **x-capability** — custom OpenAPI extension that adds intent metadata to operations, making APIs discoverable by both humans and agents
- **The lifecycle** — 6 stages: Design → Build → Discover → Operate → Evolve → Sunset

## Key Files

| File | Purpose |
|---|---|
| `x-capability-schema/capability-schema.json` | JSON Schema for the `x-capability` extension |
| `api-transformation/before.yaml` | Typical API spec — no intent metadata |
| `api-transformation/after.yaml` | Same spec — agent-ready (reference implementation) |
| `governance-as-code/.spectral.yml` | 5 lint rules enforcing agent-readiness |
| `openapi-to-mcp/mapping-guide.md` | OpenAPI → MCP tool definitions |
| `metrics/devex-metrics.md` | TTFHW, developer churn measurement |
| `scorecard/lifecycle-scorecard.md` | 30-question lifecycle self-assessment |

## Lint Command

```bash
cd governance && npm install && npm run lint:api -- --spec ../your-spec.yaml
```
