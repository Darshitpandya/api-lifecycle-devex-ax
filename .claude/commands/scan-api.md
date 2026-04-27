# /scan-api

Run the automated agent-readiness scanner on an OpenAPI spec and explain the results.

## What I'll do

1. Run: `cd readiness-scanner && npm install && node scan.js --spec $ARGUMENTS`
2. Parse all ❌ failures and ⚠️ warnings
3. Explain each failure in plain language — what it means, why it matters, how to fix it
4. Group fixes by effort: quick wins vs. structural changes
5. Ask if you want me to apply the fixes with `/make-api-agent-ready`

## Usage

```
/scan-api ../api-transformation/before.yaml
/scan-api path/to/your-spec.yaml
/scan-api path/to/your-spec.yaml --format json
```

## Score guide

- 🟢 90–100% — Agent-ready
- 🟡 70–89% — Close, address warnings
- 🔴 < 70% — Start with C1–C3 (critical checks)
