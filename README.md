# api-lifecycle-devex-ax

> The production-ready playbook for APIs that deliver world-class DevEx **and** AX (Agent Experience) — for humans, pipelines, and AI agents.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## The Problem

Your APIs work for developers. But do they work for AI agents?

Developers read docs, infer intent, ask questions. Agents parse schemas literally, skip docs, and break silently on edge cases your team never designed for. Most APIs answer **"what can I call?"** — almost none answer **"what can I accomplish?"**

The fix isn't a rewrite. It's product discipline applied to the full lifecycle.

---

## The Approach

Add **intent metadata** (`x-capability`) to your existing OpenAPI specs. Lint it. Bridge it to MCP. Measure both DevEx and AX. Govern the full lifecycle from design to deprecation.

No new framework. No runtime dependencies. Just patterns that work.

---

## Quickstart (30 minutes)

```bash
# 1. Fork this repo
# 2. Copy examples/after.yaml as your starting point
# 3. Add x-capability to each operation (schema: spec/capability-schema.json)
# 4. Lint your spec
npm install && npm run lint:api -- --spec your-spec.yaml
# 5. Map to MCP tools: see mcp/mapping-guide.md
```

---

## What's Inside

| Path | What it is |
|---|---|
| `examples/before.yaml` | A typical API spec — no intent metadata |
| `examples/after.yaml` | Same spec — agent-ready with `x-capability` **(start here)** |
| `spec/capability-schema.json` | JSON Schema for the `x-capability` extension |
| `governance/.spectral.yml` | 5 lint rules — drop into CI today |
| `governance/package.json` | `npm run lint:api` — Mac / Windows / Linux |
| `governance/Makefile` | `make lint-api SPEC=your-spec.yaml` — platform engineers |
| `.github/workflows/api-lint.yml` | GitHub Actions — runs on every PR, zero local setup |
| `governance/deprecation-runway.md` | 4-stage deprecation template (Announce→Warn→Migrate→Sunset) |
| `mcp/mapping-guide.md` | OpenAPI → MCP tool definitions (table + worked example) |
| `metrics/devex-metrics.md` | TTFHW, developer churn, onboarding drop-off — how to measure |
| `metrics/api-product-metrics.md` | Operational + business value metrics stack |
| `checklist.md` | 12-item "Is my API agent-ready?" yes/no checklist |
| `scorecard/lifecycle-scorecard.md` | 30-question self-assessment across 6 lifecycle stages |

---

## Before / After

The diff is the concept. Open both files side by side:

- [`examples/before.yaml`](examples/before.yaml) — what most APIs look like today
- [`examples/after.yaml`](examples/after.yaml) — the same API, agent-ready

15 lines of `x-capability` per operation. That's it.

---

## DevEx vs AX

| | DevEx (Developer Experience) | AX (Agent Experience) |
|---|---|---|
| **Consumer** | Human developer | AI agent |
| **Discovery** | Portal, docs, sandbox | MCP server, capability registry |
| **Key metric** | TTFHW < 15 minutes | Intent resolution rate |
| **Failure mode** | Abandonment | Wrong tool chosen silently |
| **Needs** | Good docs, clear examples | Explicit intent, safety classification |

This playbook optimises both simultaneously. See `metrics/devex-metrics.md`.

---

## Is My API Agent-Ready?

Run the checklist: [`checklist.md`](checklist.md) — 12 yes/no items, score in 5 minutes.

Rate your entire API program: [`scorecard/lifecycle-scorecard.md`](scorecard/lifecycle-scorecard.md) — 30 questions across 6 lifecycle stages.

---

## Works With AI Coding Tools

Open this repo in your AI coding tool and say **"make my API agent-ready"** — it works automatically.

| Tool | Context file | What it does |
|---|---|---|
| **Kiro** | `.kiro/steering/` | 3 steering files: project overview (always loaded), API spec patterns (loaded on `.yaml` files), MCP patterns (loaded on `mcp/` files) |
| **Claude Code** | `CLAUDE.md` | Full project context, lint commands, pattern guide |
| **Cursor** | `.cursorrules` | Inline rules for spec annotation and MCP mapping |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Suggestion context for OpenAPI edits |

---

## The Lifecycle

This playbook covers all 6 stages:

```
DESIGN → BUILD → DISCOVER → OPERATE → EVOLVE → SUNSET
```

Each stage serves three consumer planes: 👩‍💻 Human · 🔧 Pipeline · 🤖 Agent

---

## License

MIT — fork it, adapt it, ship it.

---

*From the talk: "The API Product Playbook: Managing the Full Lifecycle for a World-Class DevEx" — NZ Tech Rally 2026*
