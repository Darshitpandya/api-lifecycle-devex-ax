# api-lifecycle-devex-ax

> The production-ready playbook for APIs that deliver world-class **DevEx** and **AX (Agent Experience)** — for humans, pipelines, and AI agents.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.1-green)](01-spec-pattern/schema/capability-schema.json)
[![Spectral](https://img.shields.io/badge/Linting-Spectral-blue)](02-governance/.spectral.yml)
[![platformpioneer.io](https://img.shields.io/badge/by-platformpioneer.io-0066cc)](https://platformpioneer.io)

> Authored by **[Darshit Pandya](https://platformpioneer.io)** · Senior Principal Engineer – Platform @ Serko · AWS Community Builder
> Open source — fork it, adapt it, contribute back.

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

## What This Repo Covers for Each Consumer

### 👩‍💻 DevEx — Developer Experience

*"How fast can a developer go from zero to a working integration?"*

| What | How | Where |
|---|---|---|
| See the transformation | Open both files side by side — the diff is the concept | `01-spec-pattern/before.yaml` → `after.yaml` |
| Enforce consistency in CI | Copy `.spectral.yml` to your repo, add `npm run lint:api` to your pipeline | `02-governance/.spectral.yml` |
| Auto-fix any spec | `node scan.js --spec your-spec.yaml --fix` → fills skeleton, you fill intent | `tools/scan.js --fix` |
| Measure TTFHW | Instrument your portal: `first_successful_call - first_portal_visit` | `04-measure/devex-metrics.md` |
| Track developer churn | Run the SQL against your gateway logs (AWS, Kong, or Nginx) | `04-measure/developer-churn-queries.md` |
| Plan deprecations | Fill in the template when you start a deprecation runway | `02-governance/deprecation-runway.md` |
| Use with AI coding tools | Open your spec in Kiro/Cursor/Claude Code, say "make this agent-ready" | `CLAUDE.md`, `.cursorrules`, `.kiro/` |

**World-class DevEx standard:** TTFHW < 15 minutes.

---

### 🔧 Reliability — Pipeline Consumer Experience

*"Can automated systems depend on this API without breaking?"*

| What | How | Where |
|---|---|---|
| Lint every PR | Copy `api-lint.yml` to your `.github/workflows/` — zero config | `.github/workflows/api-lint.yml` |
| Scan every PR + post report as comment | Copy `api-scan.yml` to your `.github/workflows/` | `.github/workflows/api-scan.yml` |
| Enforce locally (Mac/Linux) | `cd 02-governance && make lint-api SPEC=your-spec.yaml` | `02-governance/Makefile` |
| Enforce locally (all platforms) | `cd 02-governance && npm run lint:api -- --spec your-spec.yaml` | `02-governance/package.json` |
| Track breaking change escape rate | Query CI results: `breaking_changes_in_prod / total_breaking_changes` | `04-measure/api-product-metrics.md` |

**World-class Reliability standard:** > 95% of breaking changes caught in CI before production.

---

### 🤖 AX — Agent Experience

*"Can an AI agent discover, select, and invoke the right tool without human help?"*

| What | How | Where |
|---|---|---|
| Understand the x-capability schema | Read the JSON Schema — required fields are `intent`, `domain`, `safety` | `01-spec-pattern/schema/capability-schema.json` |
| See it applied to real APIs | Open any of the three domain examples and read the x-capability blocks | `01-spec-pattern/after.yaml`, `identity-api.yaml`, `payments-api.yaml` |
| Generate MCP config from your spec | `cd 03-agent-bridge && npm install && node generate-mcp.js --spec your-spec.yaml --base-url https://your-api.com` | `03-agent-bridge/generate-mcp.js` |
| Register with Claude Desktop | Copy generated `mcp-server.json` to `~/.config/claude/claude_desktop_config.json` | `03-agent-bridge/mapping-guide.md` |
| Register with Kiro | Copy generated config to `.kiro/settings/mcp.json` in your project | `03-agent-bridge/mapping-guide.md` |
| Use Kiro skills | Open spec in Kiro, say "make my API agent-ready" — skill runs automatically | `.kiro/skills/make-api-agent-ready.md` |
| Use Claude Code commands | Type `/make-api-agent-ready` in Claude Code | `.claude/commands/` |
| Measure AX | Add `consumer_type=agent` label to gateway metrics, track intent resolution rate | `04-measure/measuring-devex-ax.md` |

**World-class AX standard:** Intent resolution rate > 90%, first-invocation success > 80%.

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

See the full transformation: [`01-spec-pattern/before.yaml`](01-spec-pattern/before.yaml) → [`01-spec-pattern/after.yaml`](01-spec-pattern/after.yaml)

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
**For:** Checking whether a spec has been enriched with the `x-capability` intent metadata pattern. Works on any spec, any machine, any org.

> **Important:** Any real-world public API will score low — because no production APIs use `x-capability` yet. That's the gap this playbook closes. Run it against a real spec to see the problem statement, then use `01-spec-pattern/after.yaml` to see what the solution looks like.

```bash
cd tools && npm install

# See the problem (any real API, or the included before.yaml)
node scan.js --spec ../01-spec-pattern/before.yaml

# See the solution (after applying the x-capability pattern)
node scan.js --spec ../01-spec-pattern/after.yaml
```

Runs 14 checks (10 spec + 4 repo structure). Outputs a Markdown or JSON report. Exit code 1 on hard failures — integrates with any CI gate.
Also available as a GitHub Actions workflow that posts the report as a PR comment: `.github/workflows/api-scan.yml`

→ **[`tools/`](tools/)** — full docs, CI setup, check list

---

### 👤 Human Assessment
**For:** Things no scanner can verify — TTFHW, developer churn, product ownership, org maturity.

| Tool | What it covers | Time |
|---|---|---|
| [`checklist.md`](04-measure/checklist.md) | 12-item yes/no for a specific API | 5 min |
| [`lifecycle-scorecard.md`](04-measure/lifecycle-scorecard.md) | 30-question self-assessment, 6 lifecycle stages | Half a day |
| [`devex-metrics.md`](04-measure/devex-metrics.md) | How to measure TTFHW and developer churn | Setup: 1–2 days |
| [`api-product-metrics.md`](04-measure/api-product-metrics.md) | Operational + business value metrics | Setup: 1–2 days |

→ **[`04-measure/`](04-measure/)** — full docs, what the scanner can't cover

---

**Recommended workflow:** Run the automated scanner first. Then use the lifecycle scorecard to assess the stages the scanner can't see.

---

## Quickstart

**Option 1 — Make one API agent-ready (30 min):**
```bash
# 1. Fork this repo
# 2. Open 01-spec-pattern/after.yaml — see the pattern
# 3. Add x-capability to your own spec (schema: 01-spec-pattern/schema/capability-schema.json)
# 4. Lint — validates metadata is complete and correct
cd governance && npm install && npm run lint:api -- --spec ../your-spec.yaml
# 5. Generate MCP server config from your enriched spec
#    Follow 03-agent-bridge/mapping-guide.md to produce a config like:
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
cp 02-governance/package.json your-repo/ && npm install
npm run lint:api -- --spec your-spec.yaml

# GitHub Actions — zero local setup, runs on every PR
cp .github/workflows/api-lint.yml your-repo/.github/workflows/

# make — platform engineers
make lint-api SPEC=your-spec.yaml
```

**Option 3 — Assess your API program (half day):**
Open [`04-measure/lifecycle-scorecard.md`](04-measure/lifecycle-scorecard.md) — 30 questions, 6 stages, score 1–5. Find the weakest stage. Start there.

---

## What's Inside

The repo is structured as a numbered journey — follow the folders in order:

| Folder | What it is | Start here if... |
|---|---|---|
| [`01-spec-pattern/`](01-spec-pattern/) | Before/after specs + x-capability schema. Commerce, identity, and payments examples. | You want to see the transformation |
| [`02-governance/`](02-governance/) | Spectral lint rules, CI scripts (npm/make/GitHub Actions), deprecation runway, security scanning pointer | You want to enforce this in your team |
| [`03-agent-bridge/`](03-agent-bridge/) | OpenAPI → MCP tool mapping guide + worked example | You want agents to discover your API |
| [`04-measure/`](04-measure/) | DevEx, AX, and pipeline metrics. Scorecard, checklist, churn SQL queries (AWS/Kong/Nginx). | You want to measure and assess |
| [`tools/`](tools/) | Automated readiness scanner — 14 checks, Markdown/JSON report, GitHub Actions CI | You want to scan any spec instantly |

---

## Measuring DevEx, AX, and Pipeline Experience

This playbook covers all three consumer types. Each has its own measurement framework:

| Consumer | Term | Key metric | Target | Guide |
|---|---|---|---|---|
| 👩‍💻 Human | **DevEx** | TTFHW (Time to First Hello World) | < 15 minutes | [`measuring-devex-ax.md`](04-measure/measuring-devex-ax.md) |
| 🔧 Pipeline | **Reliability** | Contract pass rate | 100% | [`measuring-devex-ax.md`](04-measure/measuring-devex-ax.md) |
| 🤖 Agent | **AX** | Intent resolution rate | > 90% | [`measuring-devex-ax.md`](04-measure/measuring-devex-ax.md) |

**World-class DevEx** = TTFHW under 15 minutes. **World-class AX** = agents select the right tool > 90% of the time and succeed on first invocation > 80% of the time.

The scanner (`tools/`) checks the spec foundations. Runtime measurement requires gateway telemetry — see [`04-measure/measuring-devex-ax.md`](04-measure/measuring-devex-ax.md) for queries and formulas.

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

---

## License

MIT — fork it, adapt it, ship it.

---

**Authored by [Darshit Pandya](https://platformpioneer.io)**
Senior Principal Engineer – Platform @ Serko · AWS Community Builder · Auckland, New Zealand

> *"The lifecycle is the product. The intent is the interface."*

Part of the **[platformpioneer.io](https://platformpioneer.io)** open-source playbook series.
Contributions welcome — see [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md).

*From the talk: **"The API Product Playbook: Managing the Full Lifecycle for a World-Class DevEx and Agent Experience"** — NZ Tech Rally 2026*
