# API Product Metrics

The three-layer metrics stack for measuring and demonstrating the business value of your API program.

---

## Layer 1 — DevEx Metrics
*Are developers succeeding?*

See [`devex-metrics.md`](devex-metrics.md) for full definitions and measurement guides.

| Metric | Target |
|---|---|
| TTFHW (Time to First Hello World) | < 15 minutes |
| Developer onboarding drop-off rate | < 20% |
| Developer churn (monthly) | < 5% |
| Support tickets per API per month | Declining trend |

---

## Layer 2 — Operational Metrics
*Is the platform healthy?*

### P99 Latency per Consumer Type

Segment latency by consumer type — human, pipeline, agent traffic have different patterns.

```
consumer_type label values: human | pipeline | agent
```

Add `consumer_type` to every gateway metric. It costs almost nothing and changes what you can see.

| Consumer | P99 Latency Target | Notes |
|---|---|---|
| 👩‍💻 Human | < 500ms | Interactive — humans feel latency |
| 🔧 Pipeline | < 2s | Batch — tolerates more latency |
| 🤖 Agent | < 1s | Chained calls — latency compounds |

### Error Budget Burn Rate

Track error budget consumption per API product. Alert when burn rate exceeds 2× the sustainable rate.

```
Error budget = 1 - SLO target
Burn rate = error rate / (1 - SLO target)
Alert threshold: burn rate > 2 over 1 hour, or > 1 over 6 hours
```

### Breaking Change Escape Rate

**Definition:** Percentage of breaking changes caught in CI vs. discovered in production.

**Target:** > 95% caught in CI.

**How to achieve:** Consumer-driven contract tests (Pact) in CI. Every consumer registers their expectations. Build breaks if you violate them.

**Before / After benchmark:** Without contract tests: ~20% caught in CI. With contract tests: ~95%.

### Deprecation Migration Rate

**Definition:** Percentage of consumers who have migrated off a deprecated endpoint before sunset.

**Target:** > 95% migrated before sunset date.

**How to measure:** Gateway telemetry — track calls to deprecated endpoints over time.

---

## Layer 3 — Business Value Metrics
*Does the platform pay off?*

### Zombie API Cost

**Definition:** Infrastructure spend on APIs with zero traffic in the last 90 days.

**How to calculate:**
```sql
SELECT
  api_name,
  monthly_infra_cost,
  last_called_at,
  owner
FROM api_catalog
WHERE calls_last_90_days = 0
ORDER BY monthly_infra_cost DESC;
```

Sum `monthly_infra_cost` — that's your zombie API cost. This is your business case for a deprecation program.

### Platform Adoption Velocity

**Definition:** Number of new API consumers onboarded per quarter.

**Target:** Increasing quarter-over-quarter.

**Segment by:** Internal teams, external partners, AI agents (track separately).

### API-Driven Revenue Attribution

**Definition:** Revenue from products or workflows that depend on your API platform.

**How to measure:** Tag transactions with the API products involved. Sum revenue per API product per quarter.

### Agent Invocation Success Rate

**Definition:** Percentage of AI agent API calls that succeed on first attempt.

**Target:** > 80% first-invocation success.

**Why it matters:** Low agent success rates signal intent metadata gaps, poor error messages, or auth issues specific to agent traffic patterns.

---

## The Business Case Formula

Use this to quantify the value of DevEx improvements to leadership:

```
Annual DevEx drag = TTFHW (hours) × new consumers per year × avg developer hourly cost

Example:
  TTFHW = 3 days = 24 hours
  New consumers per year = 50
  Avg developer cost = $150/hour

  Annual drag = 24 × 50 × $150 = $180,000/year

After improvement (TTFHW = 12 min = 0.2 hours):
  Annual drag = 0.2 × 50 × $150 = $1,500/year

  Annual saving = $178,500
```

This is boardroom-ready. Quantifiable. Defensible.

---

## Minimum Viable Metrics Dashboard

Track monthly, per API product:

| API Product | TTFHW | Churn % | P99 (human) | P99 (agent) | Breaking Δ escape % | Zombie cost |
|---|---|---|---|---|---|---|
| Commerce API | | | | | | |
| Identity API | | | | | | |
| Inventory API | | | | | | |
