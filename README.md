# api-lifecycle-devex-ax

> **Your API works. But can a developer onboard in 15 minutes? Can an AI agent use it without reading your docs?**
>
> Most APIs answer one of those questions. This playbook answers both.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![platformpioneer.io](https://img.shields.io/badge/by-platformpioneer.io-0066cc)](https://platformpioneer.io)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.1-green)](01-spec-pattern/schema/capability-schema.json)
[![Spectral](https://img.shields.io/badge/Linting-Spectral-blue)](02-governance/.spectral.yml)

---

## See the gap in 30 seconds

```bash
cd tools && npm install
node scan.js --spec your-spec.yaml
```

```
╔══════════════════════════════════════════════════════════════╗
║  API Lifecycle Readiness Report · your-spec.yaml             ║
╠══════════════════════════════════════════════════════════════╣
║  Overall Score: 20/100   ● Needs work                        ║
╠══════════════════════════════════════════════════════════════╣
║  DevEx        10/25   █████░░░░░░░░░░░░░░░░░                 ║
║  AX            0/25   ░░░░░░░░░░░░░░░░░░░░░░                 ║
║  Governance   10/25   █████░░░░░░░░░░░░░░░░░                 ║
║  Reliability   0/25   ░░░░░░░░░░░░░░░░░░░░░░                 ║
╚══════════════════════════════════════════════════════════════╝

  ❌  A1  x-capability missing on all operations
  ❌  A2  intent not declared — agents can't discover purpose
  ❌  A3  safety classification missing — agents can't decide safely
  💡  Run: node scan.js --spec your-spec.yaml --fix
```

**That's any real API today.** Including yours. Including Stripe's.

Now fix it:

```bash
node scan.js --spec your-spec.yaml --fix
# → writes your-spec-enriched.yaml with x-capability skeleton
# → fill in the intent fields (5 min)
# → re-scan: 80/100
```

---

## What just happened

Your API now has **intent metadata** — the thing that makes it work for humans *and* AI agents simultaneously.

```yaml
# Before — describes operations
POST /orders

# After — describes intent
POST /orders:
  x-capability:
    intent: "Create a commerce order with payment capture"
    safety: mutating
    side-effects: [payment-capture, inventory-reserve]
    composable-with: [checkInventory, dispatchFulfillment]
```

A human reads `intent` and understands the API.
An AI agent reads `intent` to decide whether this tool solves its current task.
**One spec. Two audiences. 15 lines of YAML.**

---

## The Blueprint

```
╔════════════════════════════════════════════════════════════════════════════════╗
║      THE API PRODUCT LIFECYCLE — REDESIGNED FOR THE AGENTIC ERA               ║
╠════════════════════════════════════════════════════════════════════════════════╣
║                                                                                ║
║  LIFECYCLE STAGES                                                              ║
║  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        ║
║  │  DESIGN  │→ │  BUILD   │→ │ DISCOVER │→ │ OPERATE  │→ │  EVOLVE  │→ SUNSET ║
║  │Contract  │  │Gateway   │  │Portal    │  │SLOs per  │  │Schema +  │ Runway  ║
║  │+ Intent  │  │+3 Trust  │  │+ MCP     │  │consumer  │  │Intent +  │ + Cap.  ║
║  │First     │  │Models    │  │+ Catalog │  │type      │  │Arazzo    │ Redir.  ║
║  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘        ║
║                                                                                ║
╠════════════════════════════════════════════════════════════════════════════════╣
║  CONSUMER PLANE                                                                ║
║  Consumer    │ Discovery            │ Auth                │ Key Metric         ║
║  ────────────┼──────────────────────┼─────────────────────┼──────────────────  ║
║  Human       │ Portal + Docs        │ OAuth 2.0 + PKCE    │ TTFHW < 15 min    ║
║  Pipeline    │ SDK + CLI            │ Scoped API Keys     │ Contract pass %    ║
║  Agent       │ MCP + Cap. Registry  │ Short-lived scoped  │ Intent resolution  ║
╠════════════════════════════════════════════════════════════════════════════════╣
║  PLATFORM ENGINEERING PLANE                                                    ║
║  API Gateway · Policy Engine (OPA/Cedar) · Capability Registry                ║
║  OpenTelemetry · Spectral Governance-as-Code · Arazzo Workflows               ║
╠════════════════════════════════════════════════════════════════════════════════╣
║  PRODUCT DISCIPLINE PLANE                                                      ║
║  API Product Owner · Lifecycle Roadmap · DevEx + AX Metrics · Sunset Plan     ║
╠════════════════════════════════════════════════════════════════════════════════╣
║  THROUGHLINE: "What can I accomplish?" — not just "What can I call?"           ║
╚════════════════════════════════════════════════════════════════════════════════╝
```

---

## What's in the box

### 🔬 Scanner — scores your API /100 across 4 dimensions

```bash
cd tools && node scan.js --spec your-spec.yaml
```

| Dimension | What it measures | Max |
|---|---|---|
| **DevEx** | operationId, descriptions, servers, contact, RFC 9457 errors | 25 |
| **AX** | x-capability, intent, safety, side-effects, idempotency | 25 |
| **Governance** | Spectral ruleset, GitHub Actions, deprecation runway | 25 |
| **Reliability** | ProblemDetails schema, composability, MCP config | 25 |

`--fix` mode rewrites your spec with x-capability skeleton automatically.

---

### 📐 Spec Pattern — the before/after that explains everything

[`01-spec-pattern/before.yaml`](01-spec-pattern/before.yaml) — what every API looks like today.
[`01-spec-pattern/after.yaml`](01-spec-pattern/after.yaml) — the same API, agent-ready.

Three real domain examples: commerce, identity, payments.

---

### ⚙️ Governance-as-Code — drop into CI today

```bash
# npm (Mac / Windows / Linux)
cd 02-governance && npm install
npm run lint:api -- --spec your-spec.yaml

# GitHub Actions — copy to your repo, zero config
cp .github/workflows/api-lint.yml your-repo/.github/workflows/
```

5 Spectral rules. Blocks merge if intent metadata is missing.

---

### 🤖 Agent Bridge — connect your API to any AI agent

```bash
cd 03-agent-bridge && npm install
node generate-mcp.js --spec your-spec-enriched.yaml --base-url https://your-api.com/v1
```

Generates a valid MCP server config. Register with Claude Desktop or Kiro. Your API is now discoverable by agents.

---

### 📊 Lifecycle Scorecard — rate your entire API program

[`04-measure/lifecycle-scorecard.md`](04-measure/lifecycle-scorecard.md) — 30 questions across all 6 lifecycle stages. Score 1–5. Find the weakest stage. Start there.

| Stage | Questions |
|---|---|
| Design | Spec-first? Intent metadata? Design review? |
| Build | Auth at gateway? Multi-consumer auth models? |
| Discover | TTFHW measured? MCP-mappable? |
| Operate | SLOs per consumer type? Developer churn tracked? |
| Evolve | Intent contracts in CI? Consumer registry? |
| Sunset | Deprecation runway? Zombie API detection? |

Also includes: developer churn SQL for AWS API Gateway, Kong, and Nginx.

---

### 🧠 Works with your AI coding tool

Open this repo in your AI coding tool and say **"make my API agent-ready"** — it works automatically.

| Tool | What happens |
|---|---|
| **Kiro** | Loads 3 steering files + 3 skills: annotate spec, scan, generate MCP config |
| **Claude Code** | `/make-api-agent-ready` · `/scan-api` · `/generate-mcp` slash commands |
| **Cursor** | `.cursorrules` loaded — understands x-capability pattern |
| **GitHub Copilot** | `.github/copilot-instructions.md` loaded |
| **Any AI agent** | `AGENTS.md` — universal context |

---

## The 30-minute path from any API to agent-ready

```
1. Fork this repo
2. node scan.js --spec your-spec.yaml          → see the score
3. node scan.js --spec your-spec.yaml --fix    → skeleton generated
4. Fill in intent fields                        → 5 min
5. node scan.js --spec your-spec-enriched.yaml → verify score
6. node generate-mcp.js --spec ...             → MCP config ready
7. Register with Claude Desktop or Kiro        → agents can use your API
```

---

## License

MIT — fork it, adapt it, ship it.

---

**Authored by [Darshit Pandya](https://platformpioneer.io)**
Senior Principal Engineer – Platform @ Serko · AWS Community Builder · Auckland, New Zealand

> *"Great API platforms don't start with endpoints. They start with intent."*
> *"The lifecycle is the product. The intent is the interface."*

Part of the **[platformpioneer.io](https://platformpioneer.io)** open-source playbook series.

*From the talk: **"The API Product Playbook: Managing the Full Lifecycle for a World-Class DevEx and Agent Experience"** — NZ Tech Rally 2026*
