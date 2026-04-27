# api-lifecycle-devex-ax

> The production-ready playbook for APIs that deliver world-class **DevEx** and **AX (Agent Experience)** — for humans, pipelines, and AI agents.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.1-green)](x-capability-schema/capability-schema.json)
[![Spectral](https://img.shields.io/badge/Linting-Spectral-blue)](governance-as-code/.spectral.yml)

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

See the full transformation: [`api-transformation/before.yaml`](api-transformation/before.yaml) → [`api-transformation/after.yaml`](api-transformation/after.yaml)

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
cd readiness-scanner && npm install
node scan.js --spec ../your-spec.yaml
```

Runs 14 checks (10 spec + 4 repo structure). Outputs a Markdown or JSON report. Exit code 1 on hard failures — integrates with any CI gate. R3/R4 show as `ℹ️ Next step` (template-expected) not failures.
Also available as a GitHub Actions workflow that posts the report as a PR comment: `.github/workflows/api-scan.yml`

→ **[`readiness-scanner/`](readiness-scanner/)** — full docs, CI setup, check list

---

### 👤 Human Assessment
**For:** Things no scanner can verify — TTFHW, developer churn, product ownership, org maturity.

| Tool | What it covers | Time |
|---|---|---|
| [`checklist.md`](lifecycle-assessment/checklist.md) | 12-item yes/no for a specific API | 5 min |
| [`lifecycle-scorecard.md`](lifecycle-assessment/lifecycle-scorecard.md) | 30-question self-assessment, 6 lifecycle stages | Half a day |
| [`devex-metrics.md`](lifecycle-assessment/devex-metrics.md) | How to measure TTFHW and developer churn | Setup: 1–2 days |
| [`api-product-metrics.md`](lifecycle-assessment/api-product-metrics.md) | Operational + business value metrics | Setup: 1–2 days |

→ **[`lifecycle-assessment/`](lifecycle-assessment/)** — full docs, what the scanner can't cover

---

**Recommended workflow:** Run the automated scanner first. Then use the lifecycle scorecard to assess the stages the scanner can't see.

---

## Quickstart

**Option 1 — Make one API agent-ready (30 min):**
```bash
# 1. Fork this repo
# 2. Open api-transformation/after.yaml — see the pattern
# 3. Add x-capability to your own spec (schema: x-capability-schema/capability-schema.json)
# 4. Lint — validates metadata is complete and correct
cd governance && npm install && npm run lint:api -- --spec ../your-spec.yaml
# 5. Generate MCP server config from your enriched spec
#    Follow openapi-to-mcp/mapping-guide.md to produce a config like:
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
cp governance-as-code/package.json your-repo/ && npm install
npm run lint:api -- --spec your-spec.yaml

# GitHub Actions — zero local setup, runs on every PR
cp .github/workflows/api-lint.yml your-repo/.github/workflows/

# make — platform engineers
make lint-api SPEC=your-spec.yaml
```

**Option 3 — Assess your API program (half day):**
Open [`lifecycle-assessment/lifecycle-scorecard.md`](lifecycle-assessment/lifecycle-scorecard.md) — 30 questions, 6 stages, score 1–5. Find the weakest stage. Start there.

---

## What's Inside

| Path | What it is |
|---|---|
| `api-transformation/before.yaml` | A typical API spec — no intent metadata |
| `api-transformation/after.yaml` | Same spec — agent-ready **(start here)** |
| `x-capability-schema/capability-schema.json` | JSON Schema for the `x-capability` extension |
| `governance-as-code/.spectral.yml` | 5 lint rules — drop into CI today |
| `governance-as-code/package.json` | `npm run lint:api` — Mac / Windows / Linux |
| `governance-as-code/Makefile` | `make lint-api` — platform engineers |
| `.github/workflows/api-lint.yml` | GitHub Actions lint — runs on every PR |
| `governance-as-code/deprecation-runway.md` | 4-stage deprecation template (RFC 8594) |
| `openapi-to-mcp/mapping-guide.md` | OpenAPI → MCP tool definitions |
| **`readiness-scanner/`** | **Automated scanner — 14 checks, Markdown/JSON report, CI workflow** |
| **`lifecycle-assessment/measuring-devex-ax.md`** | **DevEx, AX, and pipeline measurement — metrics, formulas, targets** |
| **`lifecycle-assessment/`** | **Checklist, scorecard, DevEx + AX metrics, churn SQL queries** |

---

## Measuring DevEx, AX, and Pipeline Experience

This playbook covers all three consumer types. Each has its own measurement framework:

| Consumer | Term | Key metric | Target | Guide |
|---|---|---|---|---|
| 👩‍💻 Human | **DevEx** | TTFHW (Time to First Hello World) | < 15 minutes | [`measuring-devex-ax.md`](lifecycle-assessment/measuring-devex-ax.md) |
| 🔧 Pipeline | **Reliability** | Contract pass rate | 100% | [`measuring-devex-ax.md`](lifecycle-assessment/measuring-devex-ax.md) |
| 🤖 Agent | **AX** | Intent resolution rate | > 90% | [`measuring-devex-ax.md`](lifecycle-assessment/measuring-devex-ax.md) |

**World-class DevEx** = TTFHW under 15 minutes. **World-class AX** = agents select the right tool > 90% of the time and succeed on first invocation > 80% of the time.

The scanner (`readiness-scanner/`) checks the spec foundations. Runtime measurement requires gateway telemetry — see [`lifecycle-assessment/measuring-devex-ax.md`](lifecycle-assessment/measuring-devex-ax.md) for queries and formulas.

---

## Works With AI Coding Tools

Open this repo in your AI coding tool and say **"make my API agent-ready"** — it works automatically.

| Tool | Context file | Skills / Commands |
|---|---|---|
| **Any AI tool** | `AGENTS.md` | Universal context — loaded by any agent that follows the AGENTS.md convention |
| **Kiro** | `.kiro/steering/` | `.kiro/skills/make-api-agent-ready.md` · `scan-api-readiness.md` · `generate-mcp-config.md` |
| **Claude Code** | `CLAUDE.md` | `/make-api-agent-ready` · `/scan-api` · `/generate-mcp` |
| **Cursor** | `.cursorrules` | No native skills — context loaded automatically |
| **GitHub Copilot** | `.github/copilot-instructions.md` | No native skills — context loaded automatically |

### Kiro skills (`.kiro/skills/`)

| Skill | Trigger phrase |
|---|---|
| `make-api-agent-ready` | "make my API agent-ready" / "add x-capability to this spec" |
| `scan-api-readiness` | "scan this spec" / "check agent-readiness" / "score this API" |
| `generate-mcp-config` | "generate MCP config" / "make this discoverable by agents" |

### Claude Code slash commands (`.claude/commands/`)

| Command | What it does |
|---|---|
| `/make-api-agent-ready` | Annotates a spec with x-capability, fixes errors, runs lint + scan |
| `/scan-api <spec>` | Runs the scanner and explains every failure |
| `/generate-mcp <spec>` | Generates MCP server config from an enriched spec |

---

## License

MIT — fork it, adapt it, ship it.

---

*From the talk: **"The API Product Playbook: Managing the Full Lifecycle for a World-Class DevEx"** — NZ Tech Rally 2026*
*Speaker: Darshit Pandya, Senior Principal Engineer – Platform @ Serko, AWS Community Builder*
