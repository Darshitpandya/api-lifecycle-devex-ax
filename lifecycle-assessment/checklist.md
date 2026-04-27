# Agent-Readiness Checklist

Is your API ready to be consumed by AI agents?

**Score:** count your "yes" answers.
- 10–12 = agent-ready ✅
- 7–9 = close — address the gaps ⚠️
- < 7 = start with the `[critical]` items 🔴

---

## The Checklist

- [ ] `[critical]` Every operation has a plain-language **intent** description (not just a technical summary)
- [ ] `[critical]` **Safety classification** (`safe` / `mutating` / `destructive`) on every operation
- [ ] `[critical]` Error responses use **RFC 9457 Problem Details** format — not HTML or unstructured strings
- [ ] `[critical]` OpenAPI spec is the **source of truth** — not generated from code after the fact
- [ ] **Side effects** explicitly declared for all mutating operations
- [ ] **Idempotency** support documented (with `Idempotency-Key` header mechanism if supported)
- [ ] **Destructive operations** require explicit confirmation (token or parameter)
- [ ] **Auth scopes** are granular enough for least-privilege agent sessions
- [ ] **Rate limiting** accounts for machine traffic patterns (burst, retry storms)
- [ ] **Composability** declared — what other capabilities does this operation work with?
- [ ] **Domain and workflow** tags present for discovery and grouping
- [ ] Spec can be **mapped to MCP tool definitions** without manual editing

---

## Next Steps

- Add `x-capability` to your spec: see [`x-capability-schema/capability-schema.json`](x-capability-schema/capability-schema.json)
- See the transformation: [`api-transformation/before.yaml`](api-transformation/before.yaml) → [`api-transformation/after.yaml`](api-transformation/after.yaml)
- Lint your spec: [`governance-as-code/.spectral.yml`](governance-as-code/.spectral.yml)
- Map to MCP: [`openapi-to-mcp/mapping-guide.md`](openapi-to-mcp/mapping-guide.md)
- Rate your full API program: [`scorecard/lifecycle-scorecard.md`](scorecard/lifecycle-scorecard.md)
