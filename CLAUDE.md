# Claude Code Context

> This file is read by **Claude Code** (`claude` CLI). For Kiro, see `.kiro/steering/`. For Cursor, see `.cursorrules`. For GitHub Copilot, see `.github/copilot-instructions.md`.

## What this repo is
A production-ready playbook for making existing APIs deliver world-class DevEx (Developer Experience) and AX (Agent Experience) — for humans, pipelines, and AI agents simultaneously.

## Key concepts
- `x-capability` is a custom OpenAPI extension that adds intent metadata to operations
- **DevEx** = quality of an API from a developer's perspective (TTFHW, churn, onboarding)
- **AX (Agent Experience)** = quality of an API from an AI agent's perspective (intent resolution, invocation success)
- The lifecycle has 6 stages: Design → Build → Discover → Operate → Evolve → Sunset

## Key files
- `x-capability-schema/capability-schema.json` — JSON Schema for the `x-capability` extension
- `api-transformation/before.yaml` — typical API spec without intent metadata
- `api-transformation/after.yaml` — same spec, agent-ready with `x-capability` (reference implementation)
- `governance-as-code/.spectral.yml` — 5 linting rules that enforce agent-readiness
- `openapi-to-mcp/mapping-guide.md` — how OpenAPI operations map to MCP tool definitions
- `metrics/devex-metrics.md` — TTFHW, developer churn, onboarding drop-off
- `scorecard/lifecycle-scorecard.md` — 30-question self-assessment across 6 stages

## When helping users annotate their API specs
1. Read `x-capability-schema/capability-schema.json` to understand the `x-capability` schema
2. Read `api-transformation/after.yaml` to see the pattern in practice
3. For every operation, add `x-capability` with: `intent`, `domain`, `safety`
4. Mutating operations (POST, PUT, PATCH, DELETE) MUST declare `side-effects`
5. Destructive operations MUST have `safety: destructive`
6. Error responses MUST use RFC 9457 Problem Details (`application/problem+json`)
7. Validate: `cd governance && npm install && npm run lint:api -- --spec ../your-spec.yaml`

## When helping users create MCP tool definitions
1. Read `openapi-to-mcp/mapping-guide.md` for the mapping pattern
2. `operationId` → MCP tool `name`
3. `x-capability.intent` → MCP tool `description`
4. Request body JSON Schema → MCP tool `inputSchema`
5. `x-capability.safety` → agent decision-making metadata

## When helping users assess their API program
- Use `scorecard/lifecycle-scorecard.md` — score 1–5 per question, find the weakest stage
- Use `checklist.md` for a quick yes/no pass on a specific API
- Use `metrics/devex-metrics.md` to set up TTFHW and developer churn tracking

## Linting commands
```bash
# npm (Mac/Windows/Linux)
cd governance && npm install && npm run lint:api -- --spec ../api-transformation/after.yaml

# make (Mac/Linux/WSL)
cd governance && make lint-api SPEC=../api-transformation/after.yaml

# GitHub Actions — runs automatically on every PR
# See .github/workflows/api-lint.yml
```
