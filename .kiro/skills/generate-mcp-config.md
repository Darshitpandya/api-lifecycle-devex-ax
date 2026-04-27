---
name: generate-mcp-config
description: Generate an MCP server configuration from an intent-enriched OpenAPI spec. Use when asked to create MCP tools, make an API discoverable by agents, or bridge OpenAPI to MCP.
---

# Generate MCP Config

Turn an intent-enriched OpenAPI spec into MCP tool definitions.

## Prerequisite

The spec must have `x-capability` on every operation. If not, run the `make-api-agent-ready` skill first.

## Steps

1. **Read the spec** — load the target OpenAPI YAML
2. **Read the mapping guide** — load `openapi-to-mcp/mapping-guide.md`
3. **Generate tool definitions** — for each operation:
   - `name` ← `operationId`
   - `description` ← `x-capability.intent`
   - `inputSchema` ← request body JSON Schema
4. **Generate MCP server config** — produce the JSON config block
5. **Show registration instructions** for the user's MCP host:
   - Claude Desktop: `~/.config/claude/claude_desktop_config.json`
   - Kiro: `.kiro/settings/mcp.json`
   - Other: point at the MCP server URL

## Output format

```json
{
  "mcpServers": {
    "your-api-name": {
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

## Safety metadata

Include a comment block explaining the safety classifications so the agent host can configure confirmation prompts:
- `safe` operations: auto-proceed
- `mutating` operations: proceed with logging
- `destructive` operations: require explicit confirmation
