---
inclusion: fileMatch
fileMatchPattern: "mcp/**"
---

# MCP Mapping Patterns

When working with MCP tool definitions in this repo.

## OpenAPI → MCP Mapping

| OpenAPI Field | MCP Tool Field |
|---|---|
| `operationId` | `name` |
| `x-capability.intent` | `description` |
| Request body JSON Schema | `inputSchema` |

## Example

```json
{
  "name": "createOrder",
  "description": "Create a commerce order with payment capture and inventory reservation",
  "inputSchema": {
    "type": "object",
    "required": ["items", "payment_method_id"],
    "properties": {
      "items": { "type": "array" },
      "payment_method_id": { "type": "string" }
    }
  }
}
```

The `description` comes directly from `x-capability.intent` — this is what the agent reads to decide whether to use this tool.

See `03-agent-bridge/mapping-guide.md` for the full guide and worked example.
