#!/usr/bin/env node
/**
 * generate-mcp — MCP Server Config Generator
 *
 * Converts an intent-enriched OpenAPI spec into an MCP server configuration
 * that can be registered with Claude Desktop, Kiro, or any MCP-compatible agent.
 *
 * Usage:
 *   node generate-mcp.js --spec path/to/enriched-spec.yaml
 *   node generate-mcp.js --spec path/to/enriched-spec.yaml --output mcp-config.json
 *   node generate-mcp.js --spec path/to/enriched-spec.yaml --base-url https://api.example.com/v1
 *   node generate-mcp.js --spec path/to/enriched-spec.yaml --name my-api
 */

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

// ─── CLI args ─────────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const get = (flag) => { const i = args.indexOf(flag); return i !== -1 ? args[i + 1] : null; };

const specPath = get("--spec");
const outputPath = get("--output");
const baseUrl = get("--base-url") || "https://your-api-base-url.example.com";
const serverName = get("--name");

if (!specPath) {
  console.error("Usage: node generate-mcp.js --spec <enriched-spec.yaml> [--output mcp-config.json] [--base-url https://...] [--name my-api]");
  process.exit(1);
}

// ─── Load spec ────────────────────────────────────────────────────────────────

let spec;
try {
  const raw = fs.readFileSync(path.resolve(specPath), "utf8");
  spec = yaml.load(raw);
} catch (e) {
  console.error(`Failed to load spec: ${e.message}`);
  process.exit(1);
}

// ─── Extract tools from operations ───────────────────────────────────────────

const HTTP_METHODS = ["get", "post", "put", "patch", "delete"];
const tools = [];
const warnings = [];

for (const [pathKey, pathItem] of Object.entries(spec.paths || {})) {
  for (const method of HTTP_METHODS) {
    if (!pathItem[method]) continue;
    const op = pathItem[method];

    if (!op.operationId) {
      warnings.push(`⚠️  ${method.toUpperCase()} ${pathKey} — missing operationId, skipped`);
      continue;
    }

    const cap = op["x-capability"];
    const description = cap?.intent || op.summary || op.description || `${method.toUpperCase()} ${pathKey}`;

    if (!cap?.intent) {
      warnings.push(`⚠️  ${op.operationId} — no x-capability.intent, using summary as description`);
    }

    // Build inputSchema from request body
    let inputSchema = { type: "object", properties: {}, required: [] };
    const body = op.requestBody?.content?.["application/json"]?.schema;
    if (body) {
      inputSchema = body;
    }

    // Add path and query parameters
    const allParams = (pathItem.parameters || []).concat(op.parameters || [])
      .filter(p => p.in === "path" || p.in === "query");
    if (allParams.length > 0) {
      inputSchema.properties = inputSchema.properties || {};
      inputSchema.required = inputSchema.required || [];
      for (const param of allParams) {
        inputSchema.properties[param.name] = {
          ...(param.schema || { type: "string" }),
          ...(param.description ? { description: param.description } : {}),
        };
        if (param.required) inputSchema.required.push(param.name);
      }
    }

    tools.push({
      name: op.operationId,
      description,
      inputSchema,
      // Metadata for agent decision-making (not part of MCP spec but useful context)
      _metadata: {
        safety: cap?.safety || "unknown",
        "composable-with": cap?.["composable-with"] || [],
        "side-effects": cap?.["side-effects"] || [],
      }
    });
  }
}

// ─── Derive server name ───────────────────────────────────────────────────────

const apiName = serverName ||
  spec.info?.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") ||
  "my-api";

// ─── Generate MCP server config ───────────────────────────────────────────────

const specAbsPath = path.resolve(specPath);

const mcpConfig = {
  mcpServers: {
    [apiName]: {
      command: "node",
      args: [path.resolve(__dirname, "server.js"), "--spec", specAbsPath, "--base-url", baseUrl],
      env: {
        API_KEY: "YOUR_API_KEY_HERE",
      }
    }
  }
};

// ─── Generate tool summary ────────────────────────────────────────────────────

const toolSummary = tools.map(t => ({
  name: t.name,
  description: t.description,
  safety: t._metadata.safety,
  "composable-with": t._metadata["composable-with"],
}));

// ─── Output ───────────────────────────────────────────────────────────────────

const output = JSON.stringify(mcpConfig, null, 2);

if (outputPath) {
  fs.writeFileSync(outputPath, output);
} else {
  // Default: write to 03-agent-bridge/mcp-server.json
  const defaultOut = path.join(__dirname, "mcp-server.json");
  fs.writeFileSync(defaultOut, output);
  console.log(`📄 Written to: ${defaultOut}`);
}

console.log(`\n✅ MCP config generated for "${apiName}"`);
console.log(`   ${tools.length} tool(s) extracted from spec`);

if (warnings.length > 0) {
  console.log(`\nWarnings:`);
  warnings.forEach(w => console.log(`  ${w}`));
}

console.log(`\n📋 Tools generated:`);
toolSummary.forEach(t => {
  console.log(`  • ${t.name} [${t.safety}]`);
  console.log(`    "${t.description}"`);
  if (t["composable-with"]?.length > 0) {
    console.log(`    chains with: ${t["composable-with"].join(", ")}`);
  }
});

console.log(`\n🔌 Register with your MCP host:`);
console.log(`\n  1. Set your API key in the config env block:`);
console.log(`     Replace "YOUR_API_KEY_HERE" with your actual key`);
console.log(`\n  2. Claude Desktop:`);
console.log(`     Merge config into: ~/Library/Application\\ Support/Claude/claude_desktop_config.json`);
console.log(`\n  3. Kiro:`);
console.log(`     Copy config to: .kiro/settings/mcp.json in your project`);
console.log(`\n  ⚠️  Never commit API keys — use env vars or a secrets manager in production`);

if (baseUrl.includes("example.com")) {
  console.log(`\n  💡 To use with a real API:`);
  console.log(`     node generate-mcp.js --spec ${specPath} --base-url https://your-real-api.com/v1`);
}
