# api-lifecycle-devex-ax

> The production-ready playbook for APIs that deliver world-class **DevEx** and **AX (Agent Experience)** — for humans, pipelines, and AI agents.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![OpenAPI](https://img.shields.io/badge/OpenAPI-3.1-green)](01-spec-pattern/schema/capability-schema.json)
[![Spectral](https://img.shields.io/badge/Linting-Spectral-blue)](02-governance/.spectral.yml)
[![platformpioneer.io](https://img.shields.io/badge/by-platformpioneer.io-0066cc)](https://platformpioneer.io)

> Authored by **[Darshit Pandya](https://platformpioneer.io)** · Senior Principal Engineer – Platform @ Serko · AWS Community Builder
> Open source — fork it, adapt it, contribute back.

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

## Quickstart

**Path 1 — Scan your API spec (2 min)**
```bash
cd tools && npm install
node scan.js --spec your-spec.yaml
```

**Path 2 — Auto-fix missing intent metadata (5 min)**
```bash
node scan.js --spec your-spec.yaml --fix
# → writes your-spec-enriched.yaml with TODO placeholders
# → fill in the intent fields, re-scan
```

**Path 3 — Generate MCP config for agents (10 min)**
```bash
cd 03-agent-bridge && npm install
node generate-mcp.js --spec your-spec-enriched.yaml --base-url https://your-api.com/v1
# → writes mcp-server.json
# → copy to Claude Desktop or Kiro config
```

---

## What's Inside

Follow the numbered folders in order:

| Folder | What it does |
|---|---|
| [`01-spec-pattern/`](01-spec-pattern/) | Before/after specs + x-capability schema. Commerce, identity, payments examples. |
| [`02-governance/`](02-governance/) | Spectral lint rules + CI scripts (npm/make/GitHub Actions) + deprecation runway. |
| [`03-agent-bridge/`](03-agent-bridge/) | MCP config generator + OpenAPI → MCP mapping guide. |
| [`04-measure/`](04-measure/) | DevEx + AX + pipeline metrics. Scorecard, checklist, churn SQL (AWS/Kong/Nginx). |
| [`tools/`](tools/) | Scanner: 14 checks, `--fix` mode, Markdown/JSON report, GitHub Actions CI. |

---

## What It Covers

| Consumer | Experience | Key metric | What the repo gives you |
|---|---|---|---|
| 👩‍💻 Human | **DevEx** | TTFHW < 15 min | Spec pattern, governance rules, `--fix`, churn SQL, AI tool support |
| 🔧 Pipeline | **Reliability** | Contract pass % | CI lint workflow, PR scan, breaking change tracking |
| 🤖 Agent | **AX** | Intent resolution > 90% | x-capability schema, MCP generator, Kiro skills, Claude commands |

Full detail: [`04-measure/measuring-devex-ax.md`](04-measure/measuring-devex-ax.md)

---

## Works With AI Coding Tools

Open this repo in your AI coding tool and say **"make my API agent-ready"** — it works automatically.

| Tool | Context file | Skills / Commands |
|---|---|---|
| **Any AI tool** | `AGENTS.md` | Universal context |
| **Kiro** | `.kiro/steering/` | `make-api-agent-ready` · `scan-api-readiness` · `generate-mcp-config` |
| **Claude Code** | `CLAUDE.md` | `/make-api-agent-ready` · `/scan-api` · `/generate-mcp` |
| **Cursor** | `.cursorrules` | Context loaded automatically |
| **GitHub Copilot** | `.github/copilot-instructions.md` | Context loaded automatically |

---

## Two Ways to Assess

| | Automated | Human |
|---|---|---|
| **Tool** | `tools/scan.js` | `04-measure/lifecycle-scorecard.md` |
| **What** | 14 spec + repo checks | 30-question lifecycle self-assessment |
| **Time** | Instant | Half a day |
| **Covers** | x-capability, RFC 9457, governance, CI | TTFHW, ownership, org maturity, business value |

---

## License

MIT — fork it, adapt it, ship it.

---

**Authored by [Darshit Pandya](https://platformpioneer.io)**
Senior Principal Engineer – Platform @ Serko · AWS Community Builder · Auckland, New Zealand

> *"Great platforms don't start with endpoints. They start with intent."*

Part of the **[platformpioneer.io](https://platformpioneer.io)** open-source playbook series.
Contributions welcome — see [`.github/CONTRIBUTING.md`](.github/CONTRIBUTING.md).

*From the talk: **"The API Product Playbook: Managing the Full Lifecycle for a World-Class DevEx and Agent Experience"** — NZ Tech Rally 2026*
