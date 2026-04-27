# 02-governance

Governance-as-code for API agent-readiness. Drop these into your repo and CI pipeline.

## What's here

| File | What it does |
|---|---|
| `.spectral.yml` | 5 lint rules enforcing x-capability metadata — drop into CI today |
| `package.json` | `npm run lint:api` — Mac / Windows / Linux |
| `Makefile` | `make lint-api SPEC=your-spec.yaml` — platform engineers |
| `deprecation-runway.md` | 4-stage deprecation template (Announce → Warn → Migrate → Sunset) |

## Usage

```bash
# npm (Mac / Windows / Linux)
npm install
npm run lint:api -- --spec ../your-spec.yaml

# make (Mac / Linux / WSL)
make lint-api SPEC=../your-spec.yaml

# GitHub Actions — copy to your repo
# See ../.github/workflows/api-lint.yml
```

## What the rules enforce

| Rule | Severity | What it checks |
|---|---|---|
| `operation-must-have-capability` | error | Every operation has `x-capability` |
| `capability-must-have-intent` | error | `intent` field is present |
| `capability-must-have-safety` | error | `safety` is `safe`, `mutating`, or `destructive` |
| `mutating-must-declare-side-effects` | warn | POST/PUT/PATCH/DELETE declare `side-effects` |
| `must-have-domain` | warn | `domain` field is present |

## Security Scanning

This ruleset covers **API design quality and agent-readiness**. For **security vulnerability scanning** (OWASP API Security Top 10, injection, broken auth, etc.), use a dedicated tool alongside this:

| Tool | What it scans | Free tier |
|---|---|---|
| [42Crunch](https://42crunch.com) | OWASP API Top 10, OpenAPI security audit | ✅ |
| [Snyk](https://snyk.io) | Dependencies + API security | ✅ |
| [Aikido](https://aikido.dev) | Full API security posture | ✅ |
| [OWASP ZAP](https://zaproxy.org) | Runtime API security testing | ✅ Open source |

**Recommended CI setup:** Run this Spectral ruleset for design quality, and 42Crunch or Snyk for security — both in the same PR check. They complement, not replace, each other.
