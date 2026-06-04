# /scan-api

Run the automated agent-readiness scanner on an OpenAPI spec and explain the results.

## What I'll do

1. Run: `cd tools && npm install && node scan.js --spec $ARGUMENTS`
2. Parse all ❌ failures and ⚠️ warnings
3. For each failure, consult `SCORING.md` to explain: what the check is, why it exists (with the specific RFC/standard it aligns to), and exactly how to fix it
4. Group fixes by effort: quick wins vs. structural changes
5. Ask if you want me to apply the fixes with `/make-api-agent-ready`

## Usage

```
/scan-api ../01-spec-pattern/before.yaml
/scan-api path/to/your-spec.yaml
/scan-api path/to/your-spec.yaml --format json
```

## Score guide

- 🟢 90–100% — Agent-ready
- 🟡 70–89% — Close, address warnings
- 🔴 < 70% — Start with C1–C3 (critical checks)
