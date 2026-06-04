---
name: scan-api-readiness
description: Run the automated agent-readiness scanner on an OpenAPI spec and explain the results. Use when asked to check, assess, or score an API spec for agent-readiness.
---

# Scan API Readiness

Run the automated scanner and explain what needs to be fixed.

## Steps

1. **Identify the spec** — ask the user which spec to scan if not specified
2. **Run the scanner**:
   ```bash
   cd tools && npm install && node scan.js --spec ../path/to/spec.yaml
   ```
3. **Parse the results** — identify all ❌ failures and ⚠️ warnings
4. **Explain each failure** — for each failed check, consult `SCORING.md` to explain:
   - What the check is and why it exists (cite the specific RFC, OWASP rule, or industry standard)
   - Why it matters for DevEx and AX
   - The exact fix needed
5. **Prioritise** — group fixes by effort: quick wins (add missing fields) vs. structural changes (RFC 9457 errors)
6. **Offer to fix** — ask if the user wants you to apply the fixes using the `make-api-agent-ready` skill

## Score interpretation

- 🟢 90–100% — Agent-ready. Minor gaps only.
- 🟡 70–89% — Close. Address warnings before MCP registration.
- 🔴 < 70% — Needs work. Start with [critical] items (C1–C3).
