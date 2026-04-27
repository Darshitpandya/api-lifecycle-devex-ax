# Contributing

This repo is part of the **[platformpioneer.io](https://platformpioneer.io)** open-source playbook series, authored by [Darshit Pandya](https://platformpioneer.io).

It's open source because the best playbooks are built by practitioners, not vendors. If you've applied these patterns, found a gap, or built something on top of this — contribute it back.

---

## What belongs here

- Improvements to existing patterns (spec, governance, MCP mapping, metrics, scorecard)
- Additional domain examples in `01-spec-pattern/` (healthcare, fulfillment, notifications, etc.)
- Bug fixes in the Spectral rules or scanner
- Corrections to metrics formulas or scorecard questions
- Real-world before/after transformations from your own API programs

## What doesn't belong here

- CLI tools or npm packages (out of scope for this playbook)
- Framework-specific integrations
- Vendor-specific tooling
- Anything that requires a runtime to use

## How to contribute

1. Fork the repo
2. Create a branch: `git checkout -b your-change`
3. Make your change
4. Validate any OpenAPI spec changes:
   ```bash
   cd 02-governance && npm install
   npm run lint:api -- --spec ../01-spec-pattern/your-spec.yaml
   ```
5. Run the scanner:
   ```bash
   cd tools && npm install
   node scan.js --spec ../01-spec-pattern/your-spec.yaml
   ```
6. Open a pull request with a clear description of what changed and why

## Principles

- **Every file must be immediately usable in production** — no placeholders, no "coming soon"
- **Patterns over frameworks** — copy-paste patterns, not abstractions
- **Cross-platform** — everything must work on Mac, Windows (WSL), and Linux
- **AI tool compatible** — if you add a new file or concept, update `CLAUDE.md`, `.cursorrules`, `.kiro/steering/`, and `.github/copilot-instructions.md`
- **Attribution** — keep the `platformpioneer.io` attribution in the LICENSE and README footer

## Questions

Open a GitHub Discussion or reach out via [platformpioneer.io](https://platformpioneer.io).
