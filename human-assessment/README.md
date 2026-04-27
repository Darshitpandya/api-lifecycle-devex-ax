# Human Assessment

Tools for assessing API readiness that require human judgment, gateway telemetry, or organisational context — things no scanner can verify automatically.

## When to use this

Use these **alongside** the automated scanner (`automated-assessment/`), not instead of it.

Run the scanner first to catch everything objectively verifiable. Then use these tools to assess the dimensions the scanner can't see.

---

## What's here

| File | What it covers | Time needed |
|---|---|---|
| [`checklist.md`](checklist.md) | 12-item yes/no: is this specific API agent-ready? | 5 minutes |
| [`lifecycle-scorecard.md`](lifecycle-scorecard.md) | 30-question self-assessment across all 6 lifecycle stages | Half a day (team) |
| [`devex-metrics.md`](devex-metrics.md) | How to measure TTFHW, developer churn, onboarding drop-off | Setup: 1–2 days |
| [`api-product-metrics.md`](api-product-metrics.md) | Operational + business value metrics stack | Setup: 1–2 days |

---

## What the scanner can't assess (use these instead)

| Dimension | Why it needs humans | Tool |
|---|---|---|
| TTFHW (Time to First Hello World) | Requires gateway telemetry + real developer sessions | `devex-metrics.md` |
| Developer churn | Requires gateway telemetry over time | `devex-metrics.md` |
| "Is this intent description actually meaningful?" | Requires domain judgment | `checklist.md` |
| Product ownership exists | Organisational, not technical | `lifecycle-scorecard.md` |
| Lifecycle roadmap exists | Organisational, not technical | `lifecycle-scorecard.md` |
| Org maturity across all 6 stages | Requires team discussion | `lifecycle-scorecard.md` |
| Business value metrics | Requires revenue/cost data | `api-product-metrics.md` |
