# Model Context Protocol (MCP) Code Inspector Server

An official Model Context Protocol (MCP) server integration designed for deep static code inspection, AST structural analysis, complexity metrics calculation, and real-time syntax linting.

## Overview

The `mcp-code-inspector` package enables AI models and MCP-compatible clients (e.g. AI Studio, Claude Desktop, Cursor, Custom Agents) to inspect, evaluate, and analyze source code files or snippets with high accuracy.

## Available MCP Tools

| Tool Name | Description | Parameters |
| :--- | :--- | :--- |
| `inspect_code` | Performs static AST inspection, extracting lines of code, functions, imports, nesting depth, and anti-pattern warnings. | `code` (string), `filename` (optional string), `language` (optional string) |
| `lint_snippet` | Checks bracket balancing, unclosed tokens, and common static syntax errors. | `code` (string), `language` (optional string) |
| `explain_code` | Generates structured architectural overview, component breakdowns, and execution flow. | `code` (string), `targetAudience` ("developer" \| "beginner" \| "architect") |
| `get_complexity_metrics` | Computes cyclomatic complexity estimations, LOC, and maximum nesting depth. | `code` (string) |

## Starting the Server

To start the MCP Code Inspector server over standard input/output (stdio transport):

```bash
npx tsx mcp-code-inspector/index.ts
```

Or run via npm script:

```bash
npm --prefix mcp-code-inspector start
```

## Client Configuration Example

Add `mcp-code-inspector` to your client configuration (e.g., `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "code-inspector": {
      "command": "npx",
      "args": ["-y", "tsx", "mcp-code-inspector/index.ts"]
    }
  }
}
```

## Architecture & Exports

- Built on top of `@modelcontextprotocol/sdk`
- Implements `StdioServerTransport` for standard IPC
- Exportable `analyzeCode` helper for direct programmatic inspection within Node / Express backends.
