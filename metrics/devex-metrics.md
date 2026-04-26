# DevEx Metrics Guide

How to measure Developer Experience (DevEx) for your API program.

**World-class DevEx standard:** TTFHW under 15 minutes. Developer churn tracked. Zero breaking changes reaching production.

---

## The Four DevEx Metrics That Matter

### 1. TTFHW — Time to First Hello World

**Definition:** The time elapsed between a developer discovering your API and making their first successful API call.

**Why it matters:** TTFHW is the single most important DevEx metric. It captures onboarding friction end-to-end — docs quality, auth complexity, SDK availability, sandbox access, error message clarity.

**How to measure:**
- Instrument your developer portal with session tracking
- Record: `first_portal_visit` timestamp and `first_successful_api_call` timestamp
- TTFHW = `first_successful_api_call` - `first_portal_visit`
- Segment by: new vs. returning, consumer type, API product

**Targets:**
| Band | TTFHW | What it means |
|---|---|---|
| World-class | < 15 minutes | Frictionless onboarding |
| Good | 15 min – 2 hours | Minor friction, addressable |
| Needs work | 2 hours – 1 day | Significant friction |
| Critical | > 1 day | Product problem, not a docs problem |

**Before / After benchmark:** Teams that implement intent-enriched specs, sandbox environments, and interactive docs typically move from 3 days → 12 minutes.

---

### 2. Developer Onboarding Drop-Off Rate

**Definition:** The percentage of developers who start an API integration but never complete it (never make a successful call).

**Why it matters:** Drop-off reveals where friction is highest. A developer who starts and stops is a lost consumer — and a signal that something in the onboarding path is broken.

**How to measure:**
```
Drop-off rate = (developers who started / developers who completed) × 100
```

- "Started" = created API key or accessed sandbox
- "Completed" = made first successful API call

**Segment by:** API product, auth method, SDK vs. raw HTTP, time period.

**Target:** < 20% drop-off rate.

---

### 3. Developer Churn

**Definition:** The rate at which active API consumers stop calling your API.

**Why it matters:** Developer churn is the most underused metric in internal API programs. It's the API equivalent of product churn — if nobody's tracking it, nobody owns the consumer relationship.

**How to measure:**
```
Monthly churn = consumers active last month who made 0 calls this month
Churn rate = (churned consumers / total active consumers last month) × 100
```

Query your API gateway logs:
```sql
-- Consumers active in previous period but not current period
SELECT consumer_id, last_call_date, api_product
FROM gateway_calls
WHERE last_call_date BETWEEN (NOW() - INTERVAL 60 DAYS) AND (NOW() - INTERVAL 30 DAYS)
  AND consumer_id NOT IN (
    SELECT DISTINCT consumer_id
    FROM gateway_calls
    WHERE last_call_date >= NOW() - INTERVAL 30 DAYS
  );
```

**Target:** < 5% monthly churn for stable APIs.

**Action:** When a consumer churns, reach out. The reason is almost always: breaking change, undiscoverable replacement, or better alternative found.

---

### 4. Support Ticket Volume per API

**Definition:** Number of developer support tickets or questions per API product per month.

**Why it matters:** Support tickets are friction that escaped to humans. High ticket volume on a specific API signals: unclear docs, confusing error messages, missing examples, or a broken onboarding path.

**How to measure:** Tag support tickets by API product. Track monthly volume and trend.

**Target:** Declining trend month-over-month. Absolute target depends on consumer volume.

---

## DevEx Dashboard — Minimum Viable

Track these four metrics per API product, updated monthly:

| API Product | TTFHW | Drop-off % | Monthly Churn % | Support Tickets |
|---|---|---|---|---|
| Commerce API | | | | |
| Identity API | | | | |
| Inventory API | | | | |

---

## AX Metrics (Agent Experience)

For AI agent consumers, track alongside DevEx metrics:

| Metric | Definition | Target |
|---|---|---|
| Intent resolution rate | % of agent tool selections that match the correct operation | > 90% |
| First-invocation success rate | % of agent calls that succeed on first attempt | > 80% |
| Agent churn | Agents that stop using an API after initial discovery | Track trend |

See `metrics/api-product-metrics.md` for the full operational and business value metrics stack.
