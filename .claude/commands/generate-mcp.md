# /generate-mcp

Generate an MCP server configuration from an intent-enriched OpenAPI spec.

## What I'll do

1. Read the target spec (ask if not specified)
2. Read `mcp/mapping-guide.md` for the mapping pattern
3. Generate MCP tool definitions: operationId → name, x-capability.intent → description, request body → inputSchema
4. Output the MCP server config JSON
5. Show registration instructions for Claude Desktop, Kiro, or your agent framework

## Prerequisite

The spec must have `x-capability` on every operation. If not, run `/make-api-agent-ready` first.

## Usage

```
/generate-mcp path/to/your-spec.yaml
```
