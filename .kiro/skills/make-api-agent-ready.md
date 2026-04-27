---
name: make-api-agent-ready
description: Annotate an OpenAPI spec with x-capability metadata to make it discoverable by AI agents. Use when asked to make an API agent-ready, add intent metadata, or prepare a spec for MCP.
---

# Make API Agent-Ready

Annotate an OpenAPI spec with `x-capability` metadata so it works for humans, pipelines, and AI agents.

## Steps

1. **Read the spec** — load the target OpenAPI YAML file
2. **Read the schema** — load `x-capability-schema/capability-schema.json` to understand required fields
3. **Read the example** — load `api-transformation/after.yaml` to see the pattern in practice
4. **Annotate each operation** — add `x-capability` with:
   - `intent`: plain-language description of what this operation accomplishes (not how)
   - `domain`: business domain (e.g. commerce, identity, fulfillment)
   - `safety`: `safe` | `mutating` | `destructive`
   - `side-effects`: required for mutating/destructive operations
   - `composable-with`: operationIds this can chain with in a workflow
   - `idempotency`: `supported` | `not-supported` | `natural`
5. **Fix error responses** — ensure all error responses use `application/problem+json` (RFC 9457)
6. **Add ProblemDetails schema** — add to `components/schemas` if missing
7. **Run the lint** — `cd governance && npm run lint:api -- --spec ../your-spec.yaml`
8. **Run the scanner** — `cd readiness-scanner && node scan.js --spec ../your-spec.yaml`
9. **Report** — show the scan results and any remaining gaps

## Safety rules

- `safe`: GET operations, read-only, no side effects
- `mutating`: POST, PUT, PATCH — creates or modifies state
- `destructive`: DELETE or irreversible operations — always requires explicit confirmation

## Intent writing guide

Write intent as: "Verb + object + context"
- ✅ "Create a commerce order with payment capture and inventory reservation"
- ✅ "Retrieve the current status and details of a specific order"
- ❌ "POST to /orders endpoint" (describes mechanics, not intent)
- ❌ "Creates order" (too vague for agent decision-making)
