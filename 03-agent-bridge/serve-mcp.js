#!/usr/bin/env node
/**
 * serve-mcp — MCP Server for any intent-enriched OpenAPI spec
 *
 * Reads your enriched spec, exposes every operation as an MCP tool,
 * and executes the real HTTP call when an agent invokes a tool.
 *
 * Usage:
 *   node serve-mcp.js --spec path/to/enriched-spec.yaml --base-url https://api.example.com/v1
 *   API_KEY=sk-... node serve-mcp.js --spec path/to/enriched-spec.yaml --base-url https://api.example.com/v1
 *
 * Auth (via env vars, never hardcoded):
 *   API_KEY        → sent as Authorization: Bearer <key>
 *   API_KEY_HEADER → custom header name (default: Authorization)
 *   API_KEY_PREFIX → prefix (default: Bearer)
 *
 * Register with Claude Desktop — add to claude_desktop_config.json:
 *   {
 *     "mcpServers": {
 *       "my-api": {
 *         "command": "node",
 *         "args": ["/path/to/serve-mcp.js", "--spec", "/path/to/spec.yaml", "--base-url", "https://api.example.com/v1"],
 *         "env": { "API_KEY": "your-key-here" }
 *       }
 *     }
 *   }
 */

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { McpServer } = require("@modelcontextprotocol/sdk/server/mcp.js");
const { StdioServerTransport } = require("@modelcontextprotocol/sdk/server/stdio.js");
const { z } = require("zod");

// ─── CLI args ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const specPath = get("--spec");
const baseUrl = (get("--base-url") || "").replace(/\/$/, "");

if (!specPath || !baseUrl) {
  process.stderr.write("Usage: node serve-mcp.js --spec <enriched-spec.yaml> --base-url <https://api.example.com/v1>\n");
  process.exit(1);
}

// ─── Auth from env (never from CLI args — security) ──────────────────────────

const API_KEY = process.env.API_KEY;
const API_KEY_HEADER = process.env.API_KEY_HEADER || "Authorization";
const API_KEY_PREFIX = process.env.API_KEY_PREFIX || "Bearer";

// ─── Load spec ────────────────────────────────────────────────────────────────

let spec;
try {
  spec = yaml.load(fs.readFileSync(path.resolve(specPath), "utf8"));
} catch (e) {
  process.stderr.write(`Failed to load spec: ${e.message}\n`);
  process.exit(1);
}

// ─── Build auth headers ───────────────────────────────────────────────────────

function authHeaders() {
  if (!API_KEY) return {};
  return { [API_KEY_HEADER]: `${API_KEY_PREFIX} ${API_KEY}`.trim() };
}

// ─── Extract operations ───────────────────────────────────────────────────────

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"];

function buildZodSchema(inputSchema) {
  if (!inputSchema?.properties) return {};
  const shape = {};
  const required = new Set(inputSchema.required || []);
  for (const [name, prop] of Object.entries(inputSchema.properties)) {
    let fieldSchema;
    switch (prop.type) {
      case "integer":
      case "number":  fieldSchema = z.number(); break;
      case "boolean": fieldSchema = z.boolean(); break;
      case "array":   fieldSchema = z.array(z.unknown()); break;
      case "object":  fieldSchema = z.record(z.unknown()); break;
      default:        fieldSchema = z.string();
    }
    if (prop.description) fieldSchema = fieldSchema.describe(prop.description);
    shape[name] = required.has(name) ? fieldSchema : fieldSchema.optional();
  }
  return shape;
}

function interpolatePath(pathTemplate, params) {
  return pathTemplate.replace(/\{([^}]+)\}/g, (_, key) => {
    const val = params[key];
    if (val === undefined) throw new Error(`Missing required path param: ${key}`);
    return encodeURIComponent(String(val));
  });
}

// ─── Register MCP tools ───────────────────────────────────────────────────────

const server = new McpServer({
  name: spec.info?.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "api",
  version: spec.info?.version || "1.0.0",
});

let toolCount = 0;

for (const [pathKey, pathItem] of Object.entries(spec.paths || {})) {
  for (const method of HTTP_METHODS) {
    if (!pathItem[method]) continue;
    const op = pathItem[method];
    if (!op.operationId) continue;

    const cap = op["x-capability"];
    const description = (cap?.intent && !cap.intent.includes("TODO") && !cap.intent.includes("AI-SUGGESTED:"))
      ? cap.intent
      : op.summary || op.description || `${method.toUpperCase()} ${pathKey}`;

    // Collect path + query params
    const allParams = (pathItem.parameters || []).concat(op.parameters || []);
    const pathParamNames = new Set(allParams.filter(p => p.in === "path").map(p => p.name));
    const queryParamNames = new Set(allParams.filter(p => p.in === "query").map(p => p.name));

    // Build combined input schema
    const bodySchema = op.requestBody?.content?.["application/json"]?.schema || {};
    const paramProps = {};
    const paramRequired = [];
    for (const param of allParams) {
      if (param.in !== "path" && param.in !== "query") continue;
      paramProps[param.name] = { ...(param.schema || { type: "string" }), description: param.description };
      if (param.required) paramRequired.push(param.name);
    }

    const combinedSchema = {
      type: "object",
      properties: { ...paramProps, ...(bodySchema.properties || {}) },
      required: [...new Set([...paramRequired, ...(bodySchema.required || [])])],
    };

    const zodShape = buildZodSchema(combinedSchema);

    server.tool(op.operationId, description, zodShape, async (params) => {
      try {
        // Separate path, query, and body params
        const bodyParams = {};
        const queryParams = {};
        for (const [key, val] of Object.entries(params)) {
          if (pathParamNames.has(key)) continue; // used in URL interpolation
          if (queryParamNames.has(key)) queryParams[key] = val;
          else bodyParams[key] = val;
        }

        const resolvedPath = interpolatePath(pathKey, params);
        const queryString = Object.keys(queryParams).length
          ? "?" + new URLSearchParams(Object.entries(queryParams).map(([k, v]) => [k, String(v)])).toString()
          : "";
        const url = `${baseUrl}${resolvedPath}${queryString}`;

        const isBodyMethod = ["post", "put", "patch"].includes(method);
        const fetchOpts = {
          method: method.toUpperCase(),
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...authHeaders(),
          },
          ...(isBodyMethod && Object.keys(bodyParams).length ? { body: JSON.stringify(bodyParams) } : {}),
        };

        const res = await fetch(url, fetchOpts);
        const text = await res.text();
        let data;
        try { data = JSON.parse(text); } catch { data = text; }

        if (!res.ok) {
          return {
            content: [{ type: "text", text: `HTTP ${res.status}: ${JSON.stringify(data)}` }],
            isError: true,
          };
        }

        return {
          content: [{ type: "text", text: typeof data === "string" ? data : JSON.stringify(data, null, 2) }],
        };
      } catch (e) {
        return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
      }
    });

    toolCount++;
  }
}

// ─── Start server ─────────────────────────────────────────────────────────────

process.stderr.write(`🔌 MCP server starting — ${toolCount} tool(s) from ${path.basename(specPath)}\n`);
if (!API_KEY) process.stderr.write(`⚠️  No API_KEY set — requests will be unauthenticated\n`);

const transport = new StdioServerTransport();
server.connect(transport).catch(e => {
  process.stderr.write(`Fatal: ${e.message}\n`);
  process.exit(1);
});
