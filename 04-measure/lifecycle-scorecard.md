# API Product Lifecycle Scorecard

Rate your organisation 1–5 on each question. Find the lowest-scoring stage. Start there.

**Scoring:**
- 1 = Not started
- 2 = Ad hoc — inconsistent across teams
- 3 = Defined — documented, partially adopted
- 4 = Measured — consistent with metrics
- 5 = Optimised — automated, governed, continuously improved

---

## Stage 1: DESIGN

| # | Question | Score (1–5) |
|---|---|---|
| 1.1 | Are all APIs designed spec-first (OpenAPI) before implementation? | |
| 1.2 | Do you have org-wide API design standards enforced by linting (e.g. Spectral)? | |
| 1.3 | Is there a mandatory design review for new APIs and breaking changes? | |
| 1.4 | Do API specs include intent metadata (`x-capability`) per operation? | |
| 1.5 | Are side-effects, safety classification, and composability declared per operation? | |

**Stage average: ___ / 5**

---

## Stage 2: BUILD

| # | Question | Score (1–5) |
|---|---|---|
| 2.1 | Are server stubs and SDKs generated from the spec (not hand-written)? | |
| 2.2 | Is auth handled at the gateway with a policy engine (not in application code)? | |
| 2.3 | Do you have distinct auth models for human, pipeline, and agent consumers? | |
| 2.4 | Is OWASP API Security Top 10 enforced in CI? | |
| 2.5 | Is your gateway topology a deliberate architecture decision? | |

**Stage average: ___ / 5**

---

## Stage 3: DISCOVER

| # | Question | Score (1–5) |
|---|---|---|
| 3.1 | Do you measure TTFHW (Time to First Hello World) for your APIs? | |
| 3.2 | Is TTFHW under 15 minutes for your primary APIs? | |
| 3.3 | Do you have a developer portal with interactive examples and sandbox? | |
| 3.4 | Is there a machine-readable API catalog with ownership and lifecycle metadata? | |
| 3.5 | Can your API specs be mapped to MCP tool definitions without manual editing? | |

**Stage average: ___ / 5**

---

## Stage 4: OPERATE

| # | Question | Score (1–5) |
|---|---|---|
| 4.1 | Do you have SLOs (not just SLAs) defined per API product? | |
| 4.2 | Are API metrics segmented by consumer type (human / pipeline / agent)? | |
| 4.3 | Do you track error budget burn rate and use it to gate deployments? | |
| 4.4 | Is distributed tracing (OpenTelemetry) in place with per-request trace IDs? | |
| 4.5 | Do you track developer churn (consumers who stopped calling your API)? | |

**Stage average: ___ / 5**

---

## Stage 5: EVOLVE

| # | Question | Score (1–5) |
|---|---|---|
| 5.1 | Do you have a deliberate versioning strategy chosen at design time? | |
| 5.2 | Is additive evolution the default (breaking changes require explicit decision)? | |
| 5.3 | Do you run consumer-driven contract tests (e.g. Pact) in CI? | |
| 5.4 | Are intent/capability description changes treated as breaking changes? | |
| 5.5 | Do you have a consumer registry (who calls what, with what credentials)? | |

**Stage average: ___ / 5**

---

## Stage 6: SUNSET

| # | Question | Score (1–5) |
|---|---|---|
| 6.1 | Do you have a documented deprecation runway (announce → warn → migrate → sunset)? | |
| 6.2 | Do deprecated APIs return `Sunset`/`Deprecation` HTTP headers (RFC 8594)? | |
| 6.3 | Are deprecation timelines driven by usage telemetry (not arbitrary dates)? | |
| 6.4 | Do you have automated zombie API detection (unowned, zero-traffic)? | |
| 6.5 | When sunsetting, does the capability registry redirect agents to the replacement? | |

**Stage average: ___ / 5**

---

## Summary

| Stage | Average Score |
|---|---|
| 1. Design | ___ / 5 |
| 2. Build | ___ / 5 |
| 3. Discover | ___ / 5 |
| 4. Operate | ___ / 5 |
| 5. Evolve | ___ / 5 |
| 6. Sunset | ___ / 5 |
| **Overall** | **___ / 5** |

---

## Maturity Bands

| Overall Average | Band | What it means |
|---|---|---|
| 1.0 – 1.9 | Reactive | No lifecycle. APIs are project artifacts. |
| 2.0 – 2.9 | Emerging | Some practices exist but inconsistent. |
| 3.0 – 3.9 | Defined | Documented standards, partial adoption. |
| 4.0 – 4.5 | Measured | Consistent practices with metrics. Ready to extend for agents. |
| 4.5 – 5.0 | Optimised | Automated, governed, multi-consumer ready. |

---

## How to Use This

1. Score honestly — this is for your team, not for show.
2. Find your lowest-scoring stage — that's where friction compounds fastest.
3. Pick 2–3 questions in that stage where you scored 1 or 2.
4. Use the corresponding section in this repo for templates and patterns.
5. Re-score quarterly. Track the trend, not the absolute number.
