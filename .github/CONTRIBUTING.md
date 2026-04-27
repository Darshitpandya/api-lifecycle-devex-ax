# Contributing

Contributions welcome. The goal is to keep this repo thin, practical, and immediately usable in production.

## What belongs here

- Improvements to existing patterns (spec, governance, MCP mapping, metrics, scorecard)
- Additional domain examples in `examples/` (healthcare, identity, payments, etc.)
- Bug fixes in the Spectral rules
- Corrections to the metrics formulas or scorecard questions

## What doesn't belong here

- CLI tools or npm packages (out of scope for v1)
- Framework-specific integrations
- Vendor-specific tooling
- Anything that requires a runtime to use

## How to contribute

1. Fork the repo
2. Create a branch: `git checkout -b your-change`
3. Make your change
4. Validate any OpenAPI spec changes: `cd governance && npm install && npm run lint:api -- --spec ../api-transformation/after.yaml`
5. Open a pull request with a clear description of what changed and why

## Principles

- **Every file must be immediately usable in production** — no placeholders, no "coming soon"
- **Patterns over frameworks** — copy-paste patterns, not abstractions
- **Cross-platform** — everything must work on Mac, Windows (WSL), and Linux
- **AI tool compatible** — if you add a new file or concept, update `CLAUDE.md`, `.cursorrules`, and `.github/copilot-instructions.md`

## Questions

Open a GitHub Discussion. Happy to help.
