# Scoring Methodology

**api-lifecycle-devex-ax · v1.0.0**

This document explains every check in the `/100` scanner, the rationale for each weight, and how the model aligns to existing industry standards. It is published so the community can critique, debate, and improve it.

> **This is an opinionated v1 model.** The weights are defensible but not final. Open an issue if you disagree with a weight or think a check is missing. That debate is how standards become credible.

---

## Model Overview

The scanner scores any OpenAPI spec across 4 equal dimensions (25 pts each = 100 total):

| Dimension | What it measures | Points |
|---|---|---|
| **DevEx** | Developer onboarding quality — can a human use this API in 15 minutes? | 25 |
| **AX** | Agent Experience — can an AI agent discover, understand, and safely invoke this API? | 25 |
| **Governance** | Process maturity — is there a system keeping this API honest over time? | 25 |
| **Reliability** | Contract durability — will this API behave consistently and be composable? | 25 |

### Why equal weights?

A 25/25/25/25 split reflects the thesis that all four dimensions are necessary for a production-grade API. An API that scores 25/0/25/25 is not a 75 — it has a critical failure. Future versions may introduce a "must-pass minimum per dimension" threshold.

Alternative weight models considered and rejected:
- DevEx-heavy (40/20/20/20): biases toward human DX, ignores the agent consumer
- AX-heavy (20/40/20/20): biases toward agents, ignores the human developer who has to maintain it
- Equal weights: forces teams to address all four, which is the actual goal

---

## DevEx Dimension (25 pts)

*Rationale: "Time to First Hello World" (TTFHW) is the primary DevEx metric. All five checks are necessary conditions for TTFHW < 15 minutes.*

### D1 — operationId on all operations (5 pts)

**What:** Every HTTP operation must have a unique `operationId`.

**Why 5 pts:** `operationId` is load-bearing. It is used by: SDK generators (Speakeasy, Stainless), MCP tool names, documentation anchors, contract test identifiers. An API without `operationId` cannot be used programmatically without ambiguity. This is as close to a hard requirement as this model has.

**Standards alignment:**
- [OpenAPI 3.x spec](https://spec.openapis.org/oas/v3.1.0#operation-object): "This string MUST be unique among all operations described in the API."
- [Zalando API Guidelines §151](https://opensource.zalando.com/restful-api-guidelines/#151): "MUST use operationId"
- [Microsoft API Guidelines](https://github.com/microsoft/api-guidelines): Required for SDK generation

---

### D2 — summary or description on all operations (5 pts)

**What:** Every operation must have at least a `summary` or `description`.

**Why 5 pts:** Without human-readable documentation, TTFHW is impossible. This is the minimum documentation bar.

**Standards alignment:**
- [Adidas API Guidelines](https://adidas.gitbook.io/api-guidelines): Requires description on all operations
- [Google API Design Guide](https://cloud.google.com/apis/design): "All descriptions should be clear, concise, and correct"

---

### D3 — servers block defined (5 pts)

**What:** The spec must have at least one entry in the `servers` array.

**Why 5 pts:** Without a server URL, a developer cannot make a single API call from the spec alone. This is a basic discoverability failure.

**Standards alignment:**
- [OpenAPI 3.x spec](https://spec.openapis.org/oas/v3.1.0#server-object): "If the servers property is not provided, the default value would be a Server Object with a url value of /"
- Default of `/` is insufficient for any real API. We require an explicit entry.

---

### D4 — contact info in info block (5 pts)

**What:** The spec must have `info.contact.email` or `info.contact.url`.

**Why 5 pts:** An API without a contact point has no owner. Developer support is a fundamental DevEx requirement. This check operationalises the "API Product Owner" concept from the lifecycle blueprint.

**Standards alignment:**
- [OpenAPI 3.x spec](https://spec.openapis.org/oas/v3.1.0#info-object): `contact` is optional but recommended
- [Zalando §218](https://opensource.zalando.com/restful-api-guidelines/#218): "MUST provide API audience"
- We go further: contact info is required, not just audience classification

---

### D5 — error responses use RFC 9457 Problem Details (5 pts)

**What:** Any operation that declares a 4xx or 5xx response must use `application/problem+json` as the content type.

**Why 5 pts:** Inconsistent error formats are the #1 cause of developer frustration in API integrations. RFC 9457 (successor to RFC 7807) is the IETF standard for machine-readable HTTP error responses. Adoption is accelerating: used by Stripe, Cloudflare, Azure, AWS API Gateway.

**Standards alignment:**
- [RFC 9457](https://www.rfc-editor.org/rfc/rfc9457) — IETF standard (2023)
- [OWASP API Security Top 10 — API3:2023](https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/): Improper error handling exposes internals
- [Microsoft REST API Guidelines §7.10](https://github.com/microsoft/api-guidelines): Problem Details recommended

---

## AX Dimension (25 pts)

*Rationale: AI agents make decisions about which tools to invoke based on metadata in the spec. Without intent metadata, agents cannot reliably select the right operation — they either fail, hallucinate, or invoke the wrong tool. All five checks address this.*

### A1 — x-capability on all operations (5 pts)

**What:** Every operation must have an `x-capability` object.

**Why 5 pts:** The presence check. No x-capability = no AX score is possible. This is the entry condition for the entire AX dimension.

**x-capability schema:** See [`01-spec-pattern/schema/capability-schema.json`](../01-spec-pattern/schema/capability-schema.json) — versioned JSON Schema, validated against JSON Schema Draft-07.

**Standards alignment:**
- OpenAPI allows `x-` extensions on any object — this is a conformant extension
- MCP (Model Context Protocol) tool definitions require a `description` field — `x-capability.intent` maps directly to that field
- Jentic's JAIRF framework (April 2026) identifies "tool discoverability" as a primary AI-readiness signal

---

### A2 — intent declared on all operations (5 pts)

**What:** Every `x-capability.intent` must be present and must not contain TODO placeholder text.

**Why 5 pts:** Intent is the single most important field for agent discoverability. It answers "what can I accomplish?" — the question an agent asks before selecting a tool. An unfilled TODO is worse than no intent because it may be treated as a valid description.

**The TODO check matters:** After running `--fix`, the spec has x-capability blocks but with TODO values. The score should not improve until the intent is actually authored. This check enforces that.

---

### A3 — safety classification on all operations (5 pts)

**What:** Every `x-capability.safety` must be one of: `safe`, `mutating`, `destructive`.

**Why 5 pts:** Safety classification is how agents implement the principle of least privilege at the tool-selection layer. An agent that doesn't know whether an operation is safe cannot make a responsible decision about whether to invoke it autonomously.

**The three-tier model:**
- `safe`: read-only, no side effects — agent can invoke freely
- `mutating`: creates or modifies state — agent should confirm intent before invoking
- `destructive`: deletes or irreversible — agent must have explicit authorisation

**Standards alignment:**
- [HTTP semantics — RFC 9110 §9.2](https://www.rfc-editor.org/rfc/rfc9110#section-9.2): Defines "safe" and "idempotent" for HTTP methods — we extend this concept to the operation level
- OWASP API Security API8:2023: Insufficient security controls — safety classification operationalises this at the spec level

---

### A4 — side-effects declared on mutating operations (5 pts)

**What:** All POST/PUT/PATCH/DELETE operations must declare `x-capability.side-effects` with at least one non-TODO entry.

**Why 5 pts:** Side effects are the things an agent cannot undo. An agent that calls `POST /orders` needs to know it will trigger payment capture and inventory reservation — not just that it creates an order. Without this, agents build incorrect mental models of workflow consequences.

**Why only mutating operations:** GET operations by definition have no side effects. Requiring side-effects on safe operations would produce noise.

---

### A5 — idempotency documented on all operations (5 pts)

**What:** Every `x-capability.idempotency` must be one of: `supported`, `not-supported`, `natural`.

**Why 5 pts:** Idempotency determines whether an agent can safely retry a failed call. Without it, a network error during a payment operation leaves the agent unable to determine whether to retry (risking a duplicate charge) or abandon (risking a missed transaction).

**The three-tier model:**
- `natural`: inherently idempotent (GET, HEAD, PUT by definition) — safe to retry
- `supported`: idempotent via `Idempotency-Key` header — agent must send the same key to retry
- `not-supported`: retries may cause duplicates — agent must handle failure without retry

**Standards alignment:**
- [IETF draft-ietf-httpapi-idempotency-key-header](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/): Formalises Idempotency-Key pattern
- Stripe, Adyen, PayPal all use Idempotency-Key for payment operations

---

## Governance Dimension (25 pts)

*Rationale: An API that is not governed will degrade. Governance checks verify that a system exists to keep the API honest over time — not just at point of authoring.*

**Important note on scoring context:** G1 and G2 look for governance files relative to the *spec file's location*, walking up the directory tree. If you run the scanner on a spec that lives inside a repo that already has `.spectral.yml` and CI workflows (including this repo's own specs), those files will be found and points awarded. This is intentional — it rewards teams that have set up governance for their API repository. If your spec is not inside a governed repo, you will score 0 on G1 and G2, which is the correct signal.

### G1 — Spectral ruleset exists (.spectral.yml) (10 pts)

**What:** A `.spectral.yml` file must exist in the spec's directory tree.

**Why 10 pts (highest single check weight):** Governance-as-code is the only mechanism that enforces standards consistently across a team. A single author's good intentions don't scale. Spectral running in CI does. The 10-point weight reflects that governance is the highest-leverage single investment an API team can make.

**Why Spectral specifically:** Spectral is the de facto standard for OpenAPI linting (Stoplight, SmartBear, 42Crunch all use it). It is language-agnostic, extensible, and runs in GitHub Actions, GitLab CI, and Azure Pipelines without configuration.

**Standards alignment:**
- Stoplight's own governance recommendations (pre-SmartBear acquisition)
- [OpenAPI Initiative's linting guidance](https://www.openapis.org/blog/2021/10/04/the-openapi-specification-and-linting)

---

### G2 — GitHub Actions CI workflow exists (10 pts)

**What:** A `.github/workflows/*.yml` or `*.yaml` file must exist in the spec's directory tree.

**Why 10 pts:** CI integration turns governance from a recommendation into an enforcement mechanism. An API with a Spectral ruleset but no CI is still relying on developer discipline. CI makes it structural.

**Limitation acknowledged:** This check detects *any* GitHub Actions workflow, not specifically an API linting workflow. A repo with only a build workflow would pass. Version 2 of this check should verify the workflow runs spectral or a linting tool. This is a known gap — open to community input.

---

### G3 — Deprecation runway template exists (5 pts)

**What:** A `deprecation-runway.md` file must exist with actual dates filled in (not just the template placeholder `[YYYY-MM-DD]`).

**Why 5 pts:** Deprecation is the lifecycle stage most teams skip. Zombie APIs — APIs with no owner, no traffic, and no retirement plan — are a documented operational risk. This check rewards teams that have thought about sunset before it becomes an emergency.

**Why only 5 pts (not 10):** Deprecation runway is relevant only when a deprecation is in progress. For a new API, no deprecation plan is correct. The lower weight reflects this conditionality.

---

## Reliability Dimension (25 pts)

*Rationale: An API that cannot be composed into workflows, doesn't define its error contracts, and has no agent configuration is not reliable for either humans or agents.*

### R1 — ProblemDetails schema in components (10 pts)

**What:** `components/schemas` must contain at least one schema with "problem" or "error" in its name.

**Why 10 pts:** A reusable ProblemDetails schema is the structural guarantee that the D5 check's error response contract is actually consistent. Without it, teams may declare `application/problem+json` responses but with inconsistent shapes per operation. The schema in components enforces a single contract.

**Why 10 pts (highest alongside G1/G2):** Error contract consistency is a high-impact reliability signal. Teams that define a shared error schema are demonstrably more likely to maintain consistent error handling across all operations.

**Standards alignment:**
- [RFC 9457 §3](https://www.rfc-editor.org/rfc/rfc9457#section-3): Defines the Problem Details object members: `type`, `title`, `status`, `detail`, `instance`

---

### R2 — composable-with declared (10 pts)

**What:** Every `x-capability.composable-with` must be present with at least one non-TODO entry.

**Why 10 pts:** Composability is what separates a collection of endpoints from an API product. An agent planning a multi-step workflow needs to know which operations can be chained. Without composability metadata, agents must infer relationships through trial and error — which leads to hallucinated workflows.

**Why the highest Reliability weight:** Composability is the key differentiator between this framework and structural validators. Any linter can check if a schema is valid. Only this check asks whether the API was designed to be used in sequence with other operations.

---

### R3 — MCP server config exists (5 pts)

**What:** An `mcp-server.json` or equivalent MCP configuration file must exist in the spec's directory tree.

**Why 5 pts (info, not hard fail):** MCP config is the final step in the agent-ready journey — it means someone has actually wired this API to an agent host. It is scored as an informational check (not a hard failure) because it is a deployment artifact, not a design artifact. An API can be fully agent-ready in design without yet being registered with an MCP host.

**Standards alignment:**
- [Model Context Protocol specification](https://spec.modelcontextprotocol.io/) — MCP is the emerging standard for agent-to-tool connectivity

---

## Known Gaps and Open Questions

The following are acknowledged limitations of v1. Open an issue to contribute to these discussions:

1. **G2 detects any CI workflow, not specifically an API linting workflow.** Should we parse the workflow YAML to verify spectral/linting is present? [Discuss →](https://github.com/Darshitpandya/api-lifecycle-devex-ax/issues)

2. **D5 checks declared error responses only.** An operation that declares no error responses scores a pass. Should missing error responses be penalised? [Discuss →](https://github.com/Darshitpandya/api-lifecycle-devex-ax/issues)

3. **The 25/25/25/25 equal split.** Should dimensions be weighted differently based on API maturity stage? A new API might prioritise DevEx; a production API with agents consuming it might prioritise AX. [Discuss →](https://github.com/Darshitpandya/api-lifecycle-devex-ax/issues)

4. **No partial credit within checks.** An operation with 9/10 `operationId`s scores 0, same as 0/10. Should partial scoring be introduced? [Discuss →](https://github.com/Darshitpandya/api-lifecycle-devex-ax/issues)

5. **x-capability is an unregistered OpenAPI extension.** We plan to submit a proposal to the OpenAPI Initiative for formal extension registration. [Track progress →](https://github.com/Darshitpandya/api-lifecycle-devex-ax/issues)

---

## Standards Referenced

| Standard | Relevance |
|---|---|
| [OpenAPI 3.1 Specification](https://spec.openapis.org/oas/v3.1.0) | D1, D2, D3, D4, A1 |
| [RFC 9457 — Problem Details for HTTP APIs](https://www.rfc-editor.org/rfc/rfc9457) | D5, R1 |
| [RFC 9110 — HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110) | A3 |
| [OWASP API Security Top 10 (2023)](https://owasp.org/API-Security/) | D5, A3 |
| [Zalando RESTful API Guidelines](https://opensource.zalando.com/restful-api-guidelines/) | D1, D4 |
| [Microsoft REST API Guidelines](https://github.com/microsoft/api-guidelines) | D1, D5 |
| [Google API Design Guide](https://cloud.google.com/apis/design) | D2 |
| [Model Context Protocol Spec](https://spec.modelcontextprotocol.io/) | A1, A2, R3 |
| [IETF Idempotency-Key draft](https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/) | A5 |
| [Jentic JAIRF](https://github.com/jentic/api-ai-readiness-framework) | AX dimension — independent parallel work |

---

## Version History

| Version | Date | Changes |
|---|---|---|
| 1.0.0 | 2026-06-04 | Initial published methodology |

---

*Maintained by [Darshit Pandya](https://platformpioneer.io) · Contributions welcome via GitHub Issues and Pull Requests*
