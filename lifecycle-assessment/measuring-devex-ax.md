# Measuring DevEx, AX, and Pipeline Consumer Experience

Your API has three consumer types. Each needs its own measurement framework.

| Consumer | Experience term | What you're measuring |
|---|---|---|
| 👩‍💻 Human developer | **DevEx** — Developer Experience | How fast and frictionlessly a developer can go from discovery to working integration |
| 🔧 Pipeline / CI | **Reliability** | How predictably and safely automated systems can consume your API |
| 🤖 AI agent | **AX** — Agent Experience | How accurately and successfully an agent can discover, select, and invoke your API |

---

## DevEx — Developer Experience

**Definition:** The quality of an API from a human developer's perspective.

**The standard:** World-class DevEx = TTFHW under 15 minutes.

### Core DevEx Metrics

#### TTFHW — Time to First Hello World
The single most important DevEx metric. Measures the distance between "I found this API" and "I got a successful response."

```
TTFHW = first_successful_call_timestamp - first_portal_visit_timestamp
```

**Targets:**
| Band | TTFHW | Meaning |
|---|---|---|
| World-class | < 15 minutes | Frictionless |
| Good | 15 min – 2 hours | Minor friction |
| Needs work | 2 hours – 1 day | Significant friction |
| Critical | > 1 day | Product problem, not a docs problem |

**How to measure:** Instrument your developer portal. Record `first_portal_visit` and `first_successful_api_call` per developer session. See `devex-metrics.md` for gateway query examples.

#### Developer Onboarding Drop-Off Rate
```
Drop-off rate = (developers who started / developers who completed) × 100
```
- "Started" = created API key or accessed sandbox
- "Completed" = made first successful call
- **Target:** < 20%

#### Developer Churn
The rate at which active API consumers stop calling your API. The most underused metric in internal API programs.

```
Monthly churn = consumers active last month who made 0 calls this month
Churn rate = (churned / total active last month) × 100
```
**Target:** < 5% monthly. See `developer-churn-queries.md` for ready-to-run SQL (AWS API Gateway, Kong, Nginx).

#### Support Ticket Volume per API
High ticket volume = friction that escaped to humans. Track monthly per API product. Target: declining trend.

---

## AX — Agent Experience

**Definition:** The quality of an API from an AI agent's perspective.

**The standard:** AX = intent resolution rate > 90%, first-invocation success > 80%.

### Why AX is different from DevEx

| Dimension | DevEx (Human) | AX (Agent) |
|---|---|---|
| Discovery | Reads portal, browses docs | Queries MCP server, reads capability registry |
| Intent | Infers from context | Needs explicit `x-capability.intent` |
| Docs | Reads and interprets | May skip entirely or take literally |
| Errors | Opens support ticket | Retries from error message — needs structured errors |
| Safety | Understands context | Needs explicit `safety: safe/mutating/destructive` |
| Failure mode | Abandonment | Wrong tool chosen silently |

### Core AX Metrics

#### Intent Resolution Rate
Did the agent select the correct tool for its task?

```
Intent resolution rate = (correct tool selections / total tool selections) × 100
```
**Target:** > 90%

**How to measure:** Log which MCP tool the agent selected alongside the task description. Compare against expected tool. Requires agent-side instrumentation or MCP host logging.

**What improves it:** Better `x-capability.intent` descriptions. More specific `composable-with` declarations. Clearer `domain` and `workflow` tags.

#### First-Invocation Success Rate
Did the agent's first call to your API succeed?

```
First-invocation success = (successful first calls / total first calls) × 100
```
**Target:** > 80%

**How to measure:** Tag gateway metrics with `consumer_type=agent` and `invocation_sequence=first`. Track success rate separately from retry calls.

**What improves it:** Structured error responses (RFC 9457) — agents recover from errors if they understand what went wrong. Idempotency support. Predictable, standards-based naming.

#### Agent Churn
Agents that stop using an API after initial discovery. Same concept as developer churn, applied to agent consumers.

```sql
-- Same query as developer churn, filtered to agent consumer type
SELECT consumer_id, last_call_date
FROM gateway_calls
WHERE consumer_type = 'agent'
  AND last_call_date BETWEEN NOW() - INTERVAL '60 days' AND NOW() - INTERVAL '30 days'
  AND consumer_id NOT IN (
    SELECT DISTINCT consumer_id FROM gateway_calls
    WHERE consumer_type = 'agent'
      AND last_call_date >= NOW() - INTERVAL '30 days'
  );
```

#### Chained-Call Completion Rate
For multi-step agent workflows, did the full chain complete?

```
Chain completion = (workflows completed / workflows started) × 100
```
**Target:** > 70% (chains are complex; some abandonment is expected)

**How to measure:** Correlate calls by session/trace ID. A chain starts when an agent calls the first operation in a `composable-with` sequence and completes when the final operation succeeds.

---

## Pipeline / Reliability Metrics

**Definition:** The quality of an API from an automated pipeline's perspective.

### Core Pipeline Metrics

#### Contract Pass Rate
Are pipeline consumers' contract tests passing?

```
Contract pass rate = (passing contract tests / total contract tests) × 100
```
**Target:** 100% — any failure is a breaking change that escaped.

**How to achieve:** Consumer-driven contract tests with Pact. Every pipeline consumer registers its expectations. Your build breaks if you violate them.

#### Breaking Change Escape Rate
What percentage of breaking changes are caught in CI vs. discovered in production?

```
Escape rate = (breaking changes found in production / total breaking changes) × 100
```
**Target:** < 5% escape rate (> 95% caught in CI)

**Before / After benchmark:** Without contract tests: ~80% escape rate. With contract tests: ~5%.

#### Retry Rate per API
High retry rates signal unreliable responses or unclear error messages.

```
Retry rate = (retried calls / total calls) × 100
```
**Target:** < 2% for stable APIs. Spikes indicate a reliability event.

#### P99 Latency per Consumer Type
Segment latency by consumer type — pipeline traffic patterns differ from human and agent traffic.

```
Add consumer_type label to every gateway metric:
  consumer_type = human | pipeline | agent
```

---

## The Three-Consumer Dashboard

Track these metrics monthly, per API product:

| API | TTFHW | Dev churn % | Intent resolution % | First-invoke success % | Contract pass % | P99 (human) | P99 (agent) |
|---|---|---|---|---|---|---|---|
| Commerce API | | | | | | | |
| Identity API | | | | | | | |

**How to add `consumer_type` to your gateway metrics:**

Most API gateways support custom labels/tags on metrics. Add `consumer_type` based on the auth method or a request header:

```yaml
# Kong plugin example
plugins:
  - name: prometheus
    config:
      custom_metrics:
        - name: consumer_type
          value: "$consumer_type_header"  # set by your auth layer

# AWS API Gateway — use usage plans to segment
# Label by API key prefix: human-*, pipeline-*, agent-*
```

---

## What the Scanner Checks (Automated)

The `readiness-scanner/` checks the spec for the foundations that enable good DevEx and AX:

| Check | DevEx impact | AX impact |
|---|---|---|
| C1–C2: x-capability + intent | Improves docs quality | Enables intent resolution |
| C3: safety classification | — | Enables agent decision-making |
| C4: side-effects | Improves docs | Prevents agent surprises |
| C7: RFC 9457 errors | Reduces support tickets | Enables agent error recovery |
| C9: operationId | Enables SDK generation | Required for MCP tool name |
| R1: Spectral ruleset | Enforces consistency | Enforces agent-readiness |
| R3: MCP server config | — | Enables agent discovery |

## What Requires Human Measurement

The scanner can't measure runtime behaviour. These require gateway telemetry:

- TTFHW → `devex-metrics.md`
- Developer churn → `developer-churn-queries.md`
- Intent resolution rate → agent-side logging
- First-invocation success → gateway metrics with `consumer_type` label
- Contract pass rate → CI pipeline results
- P99 latency per consumer type → gateway metrics with `consumer_type` label
