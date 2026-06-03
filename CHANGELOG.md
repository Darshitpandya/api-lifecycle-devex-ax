# Changelog

All notable changes to this project will be documented in this file.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] — 2026-06-03

First stable release. Presented at NZ Tech Rally 2026 (15 May 2026).

### Added
- `tools/scan.js` — API Lifecycle Readiness Scanner, scoring any OpenAPI spec /100 across DevEx, AX, Governance, and Reliability (25 pts each)
- `--fix` mode — rewrites spec with `x-capability` skeleton, with proportional time estimate based on operation count (~2 min/op)
- `--fill-ai` flag — pre-populates `intent` from existing `summary`/`description` and infers `domain` from OpenAPI tags, reducing manual effort on specs with existing documentation
- `03-agent-bridge/generate-mcp.js` — MCP server config generator; now includes both path and query parameters in tool input schemas
- `02-governance/.spectral.yml` — 5 Spectral rules that block CI if intent metadata is missing
- `02-governance/Makefile` + `.github/workflows/api-lint.yml` — CI integration, copy-paste ready
- `01-spec-pattern/` — before/after OpenAPI examples with `x-capability` pattern; commerce, identity, and payments domain examples
- `04-measure/` — lifecycle scorecard (30 questions, 6 stages), DevEx/AX metrics definitions, developer churn SQL for API Gateway / Kong / Nginx
- `.kiro/` — 3 steering files + 3 skills for Kiro integration
- `.claude/commands/` — `/scan-api`, `/make-api-agent-ready`, `/generate-mcp` slash commands for Claude Code
- `AGENTS.md`, `.cursorrules`, `.github/copilot-instructions.md` — universal AI coding tool context
- `tools/tests/` — 13-test suite with fixture specs (bare, enriched, post-fix TODOs) covering scanner scoring, TODO detection, --fix mode, --fill-ai, and MCP generator

### Fixed
- `generate-mcp.js`: query parameters (`?page`, `?limit`, etc.) now correctly included in MCP tool `inputSchema` alongside path parameters
- `scan.js`: A2/A4 checks now correctly fail when `intent` or `side-effects` contain TODO placeholders (post `--fix`, pre-fill state)
- `scan.js`: `--fix` output message now proportional to spec size (`~2 min × N operations`) instead of a flat "5 min" estimate

---

## [0.1.0] — 2026-04-27

Initial commit. Repository scaffolded as companion to the NZ Tech Rally 2026 talk.
