# GitHub Copilot Instructions

This is the api-lifecycle-devex-ax repo — a production-ready playbook for APIs that deliver world-class DevEx and AX (Agent Experience) for humans, pipelines, and AI agents.

## Purpose
Make existing APIs discoverable and consumable by AI agents using intent-enriched OpenAPI specs with `x-capability` metadata, without rewriting anything.

## Key references
- `spec/capability-schema.json` — defines the `x-capability` extension schema
- `examples/after.yaml` — reference implementation of an intent-enriched API spec
- `governance/.spectral.yml` — enforces agent-readiness rules
- `mcp/mapping-guide.md` — maps OpenAPI operations to MCP tools

## When writing or modifying OpenAPI specs
- Add `x-capability` to every operation with `intent`, `domain`, and `safety` fields
- Declare `side-effects` on all mutating operations (POST, PUT, PATCH, DELETE)
- Use RFC 9457 Problem Details for error responses (`application/problem+json`)
- Document `idempotency` support on all operations
- Include `composable-with` declarations where applicable

## x-capability required fields
```yaml
x-capability:
  intent: "Plain-language description of what this accomplishes"
  domain: commerce  # business domain
  safety: mutating  # safe | mutating | destructive
```

## When generating MCP tool definitions
- Map `operationId` to tool `name`
- Map `x-capability.intent` to tool `description`
- Map request body schema to `inputSchema`
