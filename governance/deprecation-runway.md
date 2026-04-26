# Deprecation Runway Template

A 4-stage process for retiring APIs safely — for human consumers and AI agents.

Copy this template for each API you deprecate. Fill in the dates and details.

---

## API Being Deprecated

| Field | Value |
|---|---|
| API name | `[e.g. Commerce API v1]` |
| Endpoint(s) | `[e.g. POST /v1/orders, GET /v1/orders/{id}]` |
| Replacement | `[e.g. Commerce API v2 — POST /v2/orders]` |
| Owner | `[team or person]` |
| Announce date | `[YYYY-MM-DD]` |
| Sunset date | `[YYYY-MM-DD — minimum 6 months from announce]` |

---

## Stage 1 — ANNOUNCE

**When:** Day 0
**Actions:**
- [ ] Publish sunset timeline in API catalog / developer portal
- [ ] Add `x-deprecated: true` and `x-sunset-date` to spec
- [ ] Update capability registry with sunset date
- [ ] Email / notify known consumers directly
- [ ] Create migration guide (link below)

**Migration guide:** `[link]`

---

## Stage 2 — WARN

**When:** Day 0 through sunset date
**Actions:**
- [ ] Add `Deprecation` header to every response (RFC 8594):
  ```
  Deprecation: true
  ```
- [ ] Add `Sunset` header to every response (RFC 8594):
  ```
  Sunset: [RFC 7231 date, e.g. Sat, 01 Nov 2026 00:00:00 GMT]
  ```
- [ ] Add `Link` header pointing to migration guide:
  ```
  Link: <https://docs.example.com/migration/v1-to-v2>; rel="deprecation"
  ```
- [ ] Set up automated alerts for consumers still calling deprecated endpoints (30 days before sunset)

**Example response headers:**
```http
HTTP/1.1 200 OK
Deprecation: true
Sunset: Sat, 01 Nov 2026 00:00:00 GMT
Link: <https://docs.example.com/migration/v1-to-v2>; rel="deprecation"
```

---

## Stage 3 — MIGRATE

**When:** 60 days before sunset
**Actions:**
- [ ] Reach out directly to consumers still on deprecated endpoint (from gateway telemetry)
- [ ] Provide codemods or SDK migration scripts where possible
- [ ] **Capability Redirect for agents:** Update capability registry to map old intent → new API
  ```json
  {
    "deprecated_operation": "createOrder_v1",
    "redirect_to": "createOrder_v2",
    "intent": "Create a commerce order with payment capture",
    "sunset_date": "2026-11-01"
  }
  ```
  Agents that discover the deprecated capability will be redirected to the replacement automatically.
- [ ] Verify migration rate via gateway telemetry — target 95%+ migrated before sunset

**Migration rate tracking:**
| Date | Consumers on v1 | Consumers on v2 | Migration % |
|---|---|---|---|
| | | | |

---

## Stage 4 — SUNSET

**When:** Sunset date
**Actions:**
- [ ] Return `410 Gone` for all deprecated endpoints:
  ```http
  HTTP/1.1 410 Gone
  Content-Type: application/problem+json

  {
    "type": "https://docs.example.com/errors/gone",
    "title": "API Deprecated",
    "status": 410,
    "detail": "This endpoint was sunset on 2026-11-01. Use POST /v2/orders instead.",
    "instance": "/v1/orders"
  }
  ```
- [ ] Remove from capability registry
- [ ] Remove from developer portal
- [ ] Decommission infrastructure (after 30-day grace period)
- [ ] Archive spec in version control — never delete

---

## Zombie API Detection

Run this query against your gateway telemetry monthly to find candidates for deprecation:

```sql
SELECT
  endpoint,
  owner,
  last_called_at,
  calls_last_90_days,
  monthly_infra_cost
FROM api_catalog
WHERE calls_last_90_days = 0
  AND owner IS NULL
ORDER BY monthly_infra_cost DESC;
```

Any API with zero traffic and no owner is a zombie. Kill it with data, not courage.
