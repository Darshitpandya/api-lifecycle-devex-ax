# /make-api-agent-ready

Annotate an OpenAPI spec with `x-capability` metadata to make it discoverable by AI agents.

## What I'll do

1. Read the target spec (ask if not specified)
2. Read `x-capability-schema/capability-schema.json` and `api-transformation/after.yaml` for the pattern
3. Add `x-capability` to every operation with: intent, domain, safety, side-effects, composable-with, idempotency
4. Fix error responses to use RFC 9457 Problem Details (`application/problem+json`)
5. Add ProblemDetails schema to `components/schemas` if missing
6. Run `cd governance && npm run lint:api -- --spec ../your-spec.yaml`
7. Run `cd automated-assessment && node scan.js --spec ../your-spec.yaml`
8. Show results and remaining gaps

## Intent writing rule

Write intent as "Verb + object + context" — what the operation accomplishes, not how it works.
- ✅ "Create a commerce order with payment capture and inventory reservation"
- ❌ "POST to /orders" or "Creates order"

## Safety classification

- `safe` — GET, read-only, no side effects
- `mutating` — POST/PUT/PATCH, creates or modifies state
- `destructive` — DELETE or irreversible

Specify the spec path or I'll ask.
