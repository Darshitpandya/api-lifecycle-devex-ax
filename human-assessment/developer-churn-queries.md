# Developer Churn — SQL Queries & Gateway Log Formats

Developer churn = API consumers who were active in a previous period but made zero calls in the current period.

This is the most underused metric in internal API programs. If nobody's tracking it, nobody owns the consumer relationship.

---

## What You Need

- Gateway logs exported to a queryable store (S3 + Athena, BigQuery, PostgreSQL, etc.)
- At minimum: `timestamp`, `consumer_id` (API key or client ID), `endpoint`, `status_code`

---

## AWS API Gateway

### Log format (CloudWatch → S3 → Athena)

Enable access logging in API Gateway with this format:

```json
{
  "requestId": "$context.requestId",
  "ip": "$context.identity.sourceIp",
  "caller": "$context.identity.caller",
  "user": "$context.identity.user",
  "requestTime": "$context.requestTime",
  "httpMethod": "$context.httpMethod",
  "resourcePath": "$context.resourcePath",
  "status": "$context.status",
  "protocol": "$context.protocol",
  "responseLength": "$context.responseLength",
  "apiKeyId": "$context.identity.apiKeyId",
  "stage": "$context.stage"
}
```

### Athena table (create once)

```sql
CREATE EXTERNAL TABLE api_gateway_logs (
  requestId     STRING,
  requestTime   STRING,
  httpMethod    STRING,
  resourcePath  STRING,
  status        INT,
  apiKeyId      STRING,
  stage         STRING
)
ROW FORMAT SERDE 'org.openx.data.jsonserde.JsonSerDe'
LOCATION 's3://your-bucket/api-gateway-logs/';
```

### Developer churn query

```sql
-- Consumers active 30–60 days ago but zero calls in last 30 days
SELECT
  prev.apiKeyId        AS consumer_id,
  prev.call_count      AS calls_prev_period,
  prev.last_seen       AS last_call_date,
  'churned'            AS status
FROM (
  SELECT
    apiKeyId,
    COUNT(*)           AS call_count,
    MAX(requestTime)   AS last_seen
  FROM api_gateway_logs
  WHERE from_iso8601_timestamp(requestTime)
        BETWEEN current_timestamp - INTERVAL '60' DAY
            AND current_timestamp - INTERVAL '30' DAY
    AND apiKeyId IS NOT NULL
  GROUP BY apiKeyId
) prev
WHERE prev.apiKeyId NOT IN (
  SELECT DISTINCT apiKeyId
  FROM api_gateway_logs
  WHERE from_iso8601_timestamp(requestTime) >= current_timestamp - INTERVAL '30' DAY
    AND apiKeyId IS NOT NULL
)
ORDER BY prev.call_count DESC;
```

### Monthly churn rate

```sql
WITH active_prev AS (
  SELECT COUNT(DISTINCT apiKeyId) AS n
  FROM api_gateway_logs
  WHERE from_iso8601_timestamp(requestTime)
        BETWEEN current_timestamp - INTERVAL '60' DAY
            AND current_timestamp - INTERVAL '30' DAY
),
churned AS (
  SELECT COUNT(DISTINCT apiKeyId) AS n
  FROM api_gateway_logs
  WHERE from_iso8601_timestamp(requestTime)
        BETWEEN current_timestamp - INTERVAL '60' DAY
            AND current_timestamp - INTERVAL '30' DAY
    AND apiKeyId NOT IN (
      SELECT DISTINCT apiKeyId
      FROM api_gateway_logs
      WHERE from_iso8601_timestamp(requestTime) >= current_timestamp - INTERVAL '30' DAY
    )
)
SELECT
  churned.n                                          AS churned_consumers,
  active_prev.n                                      AS total_prev_consumers,
  ROUND(churned.n * 100.0 / active_prev.n, 1)       AS churn_rate_pct
FROM churned, active_prev;
```

---

## Kong Gateway

### Log format (Kong → file/HTTP log plugin → PostgreSQL or BigQuery)

Enable the File Log or HTTP Log plugin. Relevant fields:

```json
{
  "consumer": { "id": "...", "username": "..." },
  "request": {
    "method": "POST",
    "uri": "/orders",
    "size": 512
  },
  "response": { "status": 201 },
  "started_at": 1714000000000
}
```

### PostgreSQL table

```sql
CREATE TABLE kong_logs (
  consumer_id   TEXT,
  consumer_name TEXT,
  method        TEXT,
  uri           TEXT,
  status        INT,
  started_at    BIGINT  -- epoch milliseconds
);
```

### Developer churn query

```sql
-- Consumers active 30–60 days ago but zero calls in last 30 days
SELECT
  consumer_id,
  consumer_name,
  COUNT(*)                                    AS calls_prev_period,
  to_timestamp(MAX(started_at) / 1000)        AS last_call_date
FROM kong_logs
WHERE started_at BETWEEN
        EXTRACT(EPOCH FROM NOW() - INTERVAL '60 days') * 1000
    AND EXTRACT(EPOCH FROM NOW() - INTERVAL '30 days') * 1000
  AND consumer_id IS NOT NULL
GROUP BY consumer_id, consumer_name
HAVING consumer_id NOT IN (
  SELECT DISTINCT consumer_id
  FROM kong_logs
  WHERE started_at >= EXTRACT(EPOCH FROM NOW() - INTERVAL '30 days') * 1000
    AND consumer_id IS NOT NULL
)
ORDER BY calls_prev_period DESC;
```

### Monthly churn rate

```sql
WITH prev AS (
  SELECT COUNT(DISTINCT consumer_id) AS n
  FROM kong_logs
  WHERE started_at BETWEEN
          EXTRACT(EPOCH FROM NOW() - INTERVAL '60 days') * 1000
      AND EXTRACT(EPOCH FROM NOW() - INTERVAL '30 days') * 1000
),
churned AS (
  SELECT COUNT(DISTINCT consumer_id) AS n
  FROM kong_logs
  WHERE started_at BETWEEN
          EXTRACT(EPOCH FROM NOW() - INTERVAL '60 days') * 1000
      AND EXTRACT(EPOCH FROM NOW() - INTERVAL '30 days') * 1000
    AND consumer_id NOT IN (
      SELECT DISTINCT consumer_id FROM kong_logs
      WHERE started_at >= EXTRACT(EPOCH FROM NOW() - INTERVAL '30 days') * 1000
    )
)
SELECT
  churned.n                                     AS churned_consumers,
  prev.n                                        AS total_prev_consumers,
  ROUND(churned.n * 100.0 / prev.n, 1)          AS churn_rate_pct
FROM churned, prev;
```

---

## Nginx (access log → PostgreSQL or BigQuery)

### Log format (`nginx.conf`)

```nginx
log_format api_json escape=json
  '{'
    '"time":"$time_iso8601",'
    '"method":"$request_method",'
    '"uri":"$request_uri",'
    '"status":$status,'
    '"consumer":"$http_x_consumer_id",'
    '"api_key":"$http_x_api_key"'
  '}';

access_log /var/log/nginx/api_access.log api_json;
```

> Use `$http_x_consumer_id` or `$http_x_api_key` — whichever your auth layer sets.

### PostgreSQL table

```sql
CREATE TABLE nginx_logs (
  time        TIMESTAMPTZ,
  method      TEXT,
  uri         TEXT,
  status      INT,
  consumer_id TEXT   -- from X-Consumer-Id or X-Api-Key header
);
```

### Developer churn query

```sql
SELECT
  consumer_id,
  COUNT(*)        AS calls_prev_period,
  MAX(time)       AS last_call_date
FROM nginx_logs
WHERE time BETWEEN NOW() - INTERVAL '60 days' AND NOW() - INTERVAL '30 days'
  AND consumer_id IS NOT NULL AND consumer_id != ''
GROUP BY consumer_id
HAVING consumer_id NOT IN (
  SELECT DISTINCT consumer_id
  FROM nginx_logs
  WHERE time >= NOW() - INTERVAL '30 days'
    AND consumer_id IS NOT NULL AND consumer_id != ''
)
ORDER BY calls_prev_period DESC;
```

### Monthly churn rate

```sql
WITH prev AS (
  SELECT COUNT(DISTINCT consumer_id) AS n
  FROM nginx_logs
  WHERE time BETWEEN NOW() - INTERVAL '60 days' AND NOW() - INTERVAL '30 days'
    AND consumer_id IS NOT NULL AND consumer_id != ''
),
churned AS (
  SELECT COUNT(DISTINCT consumer_id) AS n
  FROM nginx_logs
  WHERE time BETWEEN NOW() - INTERVAL '60 days' AND NOW() - INTERVAL '30 days'
    AND consumer_id IS NOT NULL AND consumer_id != ''
    AND consumer_id NOT IN (
      SELECT DISTINCT consumer_id FROM nginx_logs
      WHERE time >= NOW() - INTERVAL '30 days'
        AND consumer_id IS NOT NULL AND consumer_id != ''
    )
)
SELECT
  churned.n                                     AS churned_consumers,
  prev.n                                        AS total_prev_consumers,
  ROUND(churned.n * 100.0 / prev.n, 1)          AS churn_rate_pct
FROM churned, prev;
```

---

## Interpreting Results

| Churn Rate | What it means | Action |
|---|---|---|
| < 5% / month | Healthy | Monitor quarterly |
| 5–15% / month | Elevated | Investigate top churned consumers — reach out |
| > 15% / month | Critical | Breaking change, undiscoverable replacement, or better alternative found |

When a consumer churns, reach out. The reason is almost always:
1. A breaking change they didn't know about
2. An undiscoverable replacement API
3. A better alternative they found elsewhere

All three are fixable with the lifecycle practices in this playbook.

---

## Zombie API Detection

While you have the logs open, run this to find zombie APIs (zero traffic, infra cost with no return):

```sql
-- AWS Athena
SELECT
  resourcePath   AS endpoint,
  COUNT(*)       AS total_calls,
  MAX(requestTime) AS last_called
FROM api_gateway_logs
GROUP BY resourcePath
HAVING COUNT(*) = 0
    OR MAX(from_iso8601_timestamp(requestTime)) < current_timestamp - INTERVAL '90' DAY
ORDER BY last_called ASC;

-- PostgreSQL (Kong / Nginx)
SELECT
  uri            AS endpoint,
  COUNT(*)       AS total_calls,
  MAX(time)      AS last_called
FROM kong_logs   -- or nginx_logs
GROUP BY uri
HAVING MAX(time) < NOW() - INTERVAL '90 days'
ORDER BY last_called ASC;
```

Any endpoint with zero calls in 90 days and no known owner is a zombie. Kill it with data, not courage.
