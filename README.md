# api-lifecycle-devex-ax

> The production-ready playbook for APIs that deliver world-class **DevEx** and **AX (Agent Experience)** — for humans, pipelines, and AI agents.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.1-green)](spec/capability-schema.json)
[![Spectral](https://img.shields.io/badge/Linting-Spectral-blue)](governance/.spectral.yml)

---

## Why This Exists

APIs are no longer consumed only by human developers. They are the nervous system of agentic AI — the interface through which autonomous agents discover capabilities, orchestrate workflows, and take action.

Most APIs were designed for one consumer type. This playbook designs for three simultaneously:

| Consumer | How they discover | What they need | Key metric |
|---|---|---|---|
| 👩‍💻 **Human** | Portal, docs, sandbox | Clear examples, fast onboarding | TTFHW < 15 min |
| 🔧 **Pipeline** | SDK, CLI, registry | Contracts, predictability | Breaking change escape rate |
| 🤖 **Agent** | MCP, capability registry | Explicit intent, safety classification | Intent resolution rate |

The same lifecycle discipline that makes APIs great for developers makes them great for agents — but you have to build it deliberately.

---

## The Blueprint

```
┌─────────────────────────────────────────────────────────────────────────────┐
│              THE API PRODUCT LIFECYCLE — REDESIGNED FOR THE AGENTIC ERA     │
│                                                                             │
│  ┌─────────┐  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌────────┐          │
│  │ DESIGN  │→ │  BUILD  │→ │ DISCOVER │→ │ OPERATE │→ │ EVOLVE │→ SUNSET  │
│  │         │  │         │  │          │  │         │  │        │          │
│  │Contract │  │Gateway  │  │Portal    │  │SLOs per │  │Schema  │ Runway + │
│  │+Intent  │  │+3 Trust │  │+MCP      │  │consumer │  │+Intent │ Cap.     │
│  │First    │  │Models   │  │+Catalog  │  │type     │  │Contracts│ Redirect │
│  └─────────┘  └─────────┘  └──────────┘  └─────────┘  └────────┘          │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  PLATFORM ENGINEERING LAYER                                         │   │
│  │  API Gateway · Policy Engine (OPA/Cedar) · Capability Registry      │   │
│  │  OpenTelemetry · Spectral Governance-as-Code · Consumer Registry    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  PRODUCT DISCIPLINE LAYER                                           │   │
│  │  API Product Owner · Lifecycle Roadmap · Success Metrics · Sunset   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  THROUGHLINE: "What can I accomplish?" — not just "What can I call?"        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## The Core Concept: `x-capability`

The shift from endpoint-thinking to intent-thinking is 15 lines of YAML per operation:

**Before** — describes operations, not intent:
```yaml
/orders:
  post:
    operationId: createOrder
    summary: Create a new order
```

**After** — describes intent, safety, composability:
```yaml
/orders:
  post:
    operationId: createOrder
    summary: Create a new order
    x-capability:
      intent: "Create a commerce order with payment capture and inventory reservation"
      domain: commerce
      safety: mutating
      side-effects: [payment-capture, inventory-reserve]
      composable-with: [checkInventory, dispatchFulfillment]
      idempotency: supported
```

A human developer reads `intent` and understands the purpose. An AI agent reads `intent` to decide whether this tool solves its current task. An agent reads `safety: mutating` to decide whether to proceed automatically or request confirmation.

See the full transformation: [`examples/before.yaml`](examples/before.yaml) → [`examples/after.yaml`](examples/after.yaml)

---

## Architecture: Multi-Consumer API Platform

```
                         ┌──────────────────────────┐
                         │       API Catalog         │
                         │   (Single Source of Truth)│
                         └────────────┬─────────────┘
                                      │
               ┌──────────────────────┼──────────────────────┐
               │                      │                      │
    ┌──────────▼──────┐    ┌──────────▼──────┐    ┌─────────▼───────┐
    │  Developer       │    │  SDK / CLI       │    │  MCP Server     │
    │  Portal          │    │  Registry        │    │                 │
    │                  │    │                  │    │  x-capability   │
    │  👩‍💻 Human        │    │  🔧 Pipeline     │    │  → tool desc    │
    │  TTFHW < 15 min  │    │  Contract-tested │    │  🤖 Agent       │
    └──────────────────┘    └──────────────────┘    └─────────────────┘
               │                      │                      │
               └──────────────────────┼──────────────────────┘
                                      │
                         ┌────────────▼─────────────┐
                         │     API Gateway            │
                         │   + Policy Engine          │
                         │     (OPA / Cedar)          │
                         └────────────┬──────────────┘
                                      │
              ┌───────────────────────┼───────────────────────┐
              │                       │                       │
   ┌──────────▼──────┐    ┌──────────▼──────┐    ┌──────────▼──────┐
   │  OAuth 2.0       │    │  Scoped API Keys │    │  Short-lived    │
   │  + PKCE          │    │  Token exchange  │    │  scoped tokens  │
   │  👩‍💻 Human        │    │  🔧 Pipeline     │    │  Least privilege│
   └──────────────────┘    └──────────────────┘    │  🤖 Agent       │
                                                    └─────────────────┘
```

---

## Two Ways to Assess Your APIs

Choose the approach that fits your situation — or use both.

### 🤖 Automated Assessment
**For:** Any OpenAPI spec, any machine, any org. Instant. No human judgment needed.

```bash
cd automated-assessment && npm install
node scan.js --spec ../your-spec.yaml
```

Runs 10 checks. Outputs a Markdown or JSON report. Exit code 1 on failures — integrates with any CI gate.
Also available as a GitHub Actions workflow that posts the report as a PR comment: `.github/workflows/api-scan.yml`

→ **[`automated-assessment/`](automated-assessment/)** — full docs, CI setup, check list

---

### 👤 Human Assessment
**For:** Things no scanner can verify — TTFHW, developer churn, product ownership, org maturity.

| Tool | What it covers | Time |
|---|---|---|
| [`checklist.md`](human-assessment/checklist.md) | 12-item yes/no for a specific API | 5 min |
| [`lifecycle-scorecard.md`](human-assessment/lifecycle-scorecard.md) | 30-question self-assessment, 6 lifecycle stages | Half a day |
| [`devex-metrics.md`](human-assessment/devex-metrics.md) | How to measure TTFHW and developer churn | Setup: 1–2 days |
| [`api-product-metrics.md`](human-assessment/api-product-metrics.md) | Operational + business value metrics | Setup: 1–2 days |

→ **[`human-assessment/`](human-assessment/)** — full docs, what the scanner can't cover

---

**Recommended workflow:** Run the automated scanner first. Then use the lifecycle scorecard to assess the stages the scanner can't see.

---

## Quickstart

**Option 1 — Make one API agent-ready (30 min):**
```bash
# 1. Fork this repo
# 2. Open examples/after.yaml — see the pattern
# 3. Add x-capability to your own spec (schema: spec/capability-schema.json)
# 4. Lint — validates metadata is complete and correct
cd governance && npm install && npm run lint:api -- --spec ../your-spec.yaml
# 5. Generate MCP server config from your enriched spec
#    Follow mcp/mapping-guide.md to produce a config like:
#    { "mcpServers": { "your-api": { ... } } }
# 6. Register with your MCP host:
#    - Claude Desktop: add to ~/.config/claude/claude_desktop_config.json
#    - Kiro: add to .kiro/settings/mcp.json
#    - Your agent framework: point at the MCP server URL
# ✅ Agents can now discover and invoke your API via MCP
```

> **What each step achieves:**
> - Steps 3–4: spec is intent-rich — humans benefit immediately, spec is semantically agent-ready
> - Steps 5–6: agents can *operationally* discover and invoke your API — this is what makes it truly agent-ready

**Option 2 — Enforce across your team (1 hour):**
```bash
# npm — Mac / Windows / Linux
cp governance/package.json your-repo/ && npm install
npm run lint:api -- --spec your-spec.yaml

# GitHub Actions — zero local setup, runs on every PR
cp .github/workflows/api-lint.yml your-repo/.github/workflows/

# make — platform engineers
make lint-api SPEC=your-spec.yaml
```

**Option 3 — Assess your API program (half day):**
Open [`human-assessment/lifecycle-scorecard.md`](human-assessment/lifecycle-scorecard.md) — 30 questions, 6 stages, score 1–5. Find the weakest stage. Start there.

---

## What's Inside

| Path | What it is |
|---|---|
| `examples/before.yaml` | A typical API spec — no intent metadata |
| `examples/after.yaml` | Same spec — agent-ready **(start here)** |
| `spec/capability-schema.json` | JSON Schema for the `x-capability` extension |
| `governance/.spectral.yml` | 5 lint rules — drop into CI today |
| `governance/package.json` | `npm run lint:api` — Mac / Windows / Linux |
| `governance/Makefile` | `make lint-api` — platform engineers |
| `.github/workflows/api-lint.yml` | GitHub Actions lint — runs on every PR |
| `governance/deprecation-runway.md` | 4-stage deprecation template (RFC 8594) |
| `mcp/mapping-guide.md` | OpenAPI → MCP tool definitions |
| **`automated-assessment/`** | **Scanner CLI — 10 checks, Markdown/JSON report, CI workflow** |
| **`human-assessment/`** | **Checklist, scorecard, DevEx + metrics guides** |

---

## DevEx vs AX

| | DevEx | AX (Agent Experience) |
|---|---|---|
| Consumer | Human developer | AI agent |
| Discovery | Portal, docs, sandbox | MCP server, capability registry |
| Key metric | TTFHW < 15 minutes | Intent resolution rate |
| Failure mode | Abandonment | Wrong tool chosen silently |
| Needs | Good docs, clear examples | Explicit intent, safety classification |

Great DevEx and great AX share the same foundations — good specs, clear naming, structured errors, predictable behaviour. They diverge on intent: agents need it explicit in the spec. This playbook optimises both.

---

## Works With AI Coding Tools

Open this repo in your AI coding tool and say **"make my API agent-ready"** — it works automatically.

| Tool | Context file | Behaviour |
|---|---|---|
| **Kiro** | `.kiro/steering/` | `project.md` always loaded · `api-patterns.md` on YAML files · `mcp-patterns.md` on mcp/ files |
| **Claude Code** | `CLAUDE.md` | Full project context, lint commands, pattern guide |
| **Cursor** | `.cursorrules` | Inline rules for spec annotation and MCP mapping |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Suggestion context for OpenAPI edits |

---

## License

MIT — fork it, adapt it, ship it.

---

*From the talk: **"The API Product Playbook: Managing the Full Lifecycle for a World-Class DevEx"** — NZ Tech Rally 2026*
*Speaker: Darshit Pandya, Senior Principal Engineer – Platform @ Serko, AWS Community Builder*
