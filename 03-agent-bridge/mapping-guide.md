# OpenAPI → MCP Tool Mapping Guide

How to turn your intent-enriched OpenAPI spec into MCP tool definitions that AI agents can discover and invoke.

---

## Quick start — run a real MCP server

```bash
cd 03-agent-bridge && npm install

# Enrich your spec first (if not already done)
cd ../tools && node scan.js --spec my-api.yaml --fix --fill-ai

# Generate the MCP registration config
cd ../03-agent-bridge && node generate-mcp.js --spec my-api-enriched.yaml --base-url https://my-api.com/v1

# Serve it — agents can now call your real API
API_KEY=sk-... node server.js --spec my-api-enriched.yaml --base-url https://my-api.com/v1
```

Register the generated `mcp-server.json` with Claude Desktop or Kiro. The MCP host launches `server.js` automatically.

**Auth env vars (never put keys in CLI args or config files):**
- `API_KEY` → sent as `Authorization: Bearer <key>`
- `API_KEY_HEADER` → override header name (default: `Authorization`)
- `API_KEY_PREFIX` → override prefix (default: `Bearer`)

---

---

## The Mapping

| OpenAPI Field | MCP Tool Field | Purpose |
|---|---|---|
| `operationId` | `name` | Tool identifier — must be unique |
| `x-capability.intent` | `description` | What the agent reads to decide whether to use this tool |
| Request body JSON Schema | `inputSchema` | Typed parameters the agent must provide |
| `x-capability.safety` | *(agent metadata)* | `safe` = proceed automatically. `mutating` = proceed with care. `destructive` = request confirmation. |
| `x-capability.requires` | *(agent metadata)* | Agent checks prerequisites before invocation |
| `x-capability.composable-with` | *(agent metadata)* | Agent uses for workflow planning — what to call next |

---

## Worked Example

**OpenAPI operation (from `01-spec-pattern/after.yaml`):**

```yaml
/orders:
  post:
    operationId: createOrder
    x-capability:
      intent: "Create a commerce order with payment capture and inventory reservation"
      domain: commerce
      safety: mutating
      side-effects: [payment-capture, inventory-reserve]
      composable-with: [checkInventory, dispatchFulfillment]
    requestBody:
      content:
        application/json:
          schema:
            type: object
            required: [items, payment_method_id]
            properties:
              items:
                type: array
                items:
                  type: object
                  properties:
                    sku: { type: string }
                    quantity: { type: integer }
              payment_method_id:
                type: string
```

**Becomes this MCP tool definition:**

```json
{
  "name": "createOrder",
  "description": "Create a commerce order with payment capture and inventory reservation",
  "inputSchema": {
    "type": "object",
    "required": ["items", "payment_method_id"],
    "properties": {
      "items": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "sku": { "type": "string" },
            "quantity": { "type": "integer" }
          }
        }
      },
      "payment_method_id": { "type": "string" }
    }
  }
}
```

---

## Full MCP Server Config (all 4 operations)

```json
{
  "mcpServers": {
    "commerce-api": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-openapi"],
      "env": {
        "OPENAPI_SPEC_URL": "https://your-api.example.com/openapi.yaml",
        "API_BASE_URL": "https://your-api.example.com"
      }
    }
  }
}
```

Save as `~/.config/claude/claude_desktop_config.json` (Claude Desktop) or equivalent for your MCP host.

---

## What the Agent Sees

When an agent receives the tool list, it reads the `description` (from `x-capability.intent`) and decides whether this tool solves its current task.

The `safety` classification tells the agent:
- `safe` → proceed automatically, no confirmation needed
- `mutating` → proceed, but log the action
- `destructive` → request explicit confirmation before invoking

The `composable-with` field tells the agent what to call next. For example, after `checkInventory` confirms stock is available, the agent knows to call `createOrder`.

---

## Workflow Example

An agent given the task "order 2 units of SKU-123 for customer X" would:

1. Discover tools via MCP
2. Read `checkInventory` description → "Check available inventory level for a product SKU before placing an order" → matches task prerequisite
3. Call `checkInventory` with `sku: "SKU-123"` → confirms 10 units available
4. Read `createOrder` description → "Create a commerce order with payment capture" → matches task
5. Check `safety: mutating` → proceed with care, log action
6. Call `createOrder` with items and payment_method_id
7. Read `composable-with: [dispatchFulfillment]` → knows to call fulfillment next

This workflow is only possible because the spec declares intent, composability, and safety explicitly.

---

## Tools for Generating MCP Servers from OpenAPI

- [`@modelcontextprotocol/server-openapi`](https://www.npmjs.com/package/@modelcontextprotocol/server-openapi) — auto-generates MCP server from any OpenAPI spec
- [Zuplo](https://zuplo.com) — API gateway with MCP server generation

## generate-mcp.js — Included in this repo

Generate an MCP server config directly from your enriched spec:

```bash
cd 03-agent-bridge && npm install
node generate-mcp.js --spec ../01-spec-pattern/after.yaml
# → writes mcp-server.json with all tools extracted

# With your real API URL
node generate-mcp.js --spec your-enriched-spec.yaml --base-url https://api.yourcompany.com/v1

# Custom server name
node generate-mcp.js --spec your-enriched-spec.yaml --name my-commerce-api
```

The generator extracts every operation with an `operationId` and maps:
- `operationId` → MCP tool `name`
- `x-capability.intent` → MCP tool `description`
- Request body + path params → `inputSchema`
- `x-capability.safety` → metadata for agent decision-making
