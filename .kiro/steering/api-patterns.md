---
inclusion: fileMatch
fileMatchPattern: "**/*.yaml,**/*.yml"
---

# API Spec Patterns

When working with OpenAPI specs in this repo, follow these patterns.

## x-capability — Required on Every Operation

```yaml
x-capability:
  intent: "Plain-language description of what this accomplishes"  # required
  domain: commerce                                                 # required
  safety: mutating                                                 # required: safe | mutating | destructive
  side-effects: [payment-capture, inventory-reserve]              # required for mutating/destructive
  composable-with: [checkInventory, dispatchFulfillment]          # recommended
  requires: [authenticated-context, payment-method]               # recommended
  idempotency: supported                                           # supported | not-supported | natural
```

## Safety Classification

- `safe` — read-only, no side effects (GET operations)
- `mutating` — creates or modifies state (POST, PUT, PATCH)
- `destructive` — deletes or irreversible (DELETE)

## Error Responses

Always use RFC 9457 Problem Details — never plain text or HTML:

```yaml
responses:
  "400":
    content:
      application/problem+json:
        schema:
          $ref: "#/components/schemas/ProblemDetails"
```

## Validation

After editing any spec: `cd governance && npm run lint:api -- --spec ../your-spec.yaml`

See `01-spec-pattern/after.yaml` for the complete reference implementation.

## Why each check exists

Every scoring rule has a published rationale with standards alignment (RFC 9457, OWASP, Zalando, OpenAPI spec). Before explaining or debating a check, read `SCORING.md` — it documents the exact reasoning, weight justification, and known gaps for all 14 checks across DevEx, AX, Governance, and Reliability dimensions.
