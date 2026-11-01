import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * Model Context Protocol (MCP) Server instance
 */
const server = new Server(
  {
    name: "mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Register list of available MCP tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "ping",
        description: "Returns a simple pong health response from the MCP server.",
        inputSchema: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Optional ping message parameter",
            },
          },
        },
      },
      {
        name: "inspect_note",
        description: "Analyzes note content and returns structure statistics.",
        inputSchema: {
          type: "object",
          properties: {
            content: {
              type: "string",
              description: "Note content to inspect",
            },
          },
          required: ["content"],
        },
      },
    ],
  };
});

// Handle incoming tool execution calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "ping") {
    const msg = args?.message ? String(args.message) : "pong";
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ status: "ok", reply: msg, timestamp: new Date().toISOString() }),
        },
      ],
    };
  }

  if (name === "inspect_note") {
    const content = String(args?.content || "");
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const charCount = content.length;
    const lineCount = content.split("\n").length;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              metrics: {
                characterCount: charCount,
                wordCount,
                lineCount,
              },
            },
            null,
            2
          ),
        },
      ],
    };
  }

  throw new Error(`Tool non-existent: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server initialized and listening on stdio");
}

main().catch((err) => {
  console.error("Fatal error starting MCP Server:", err);
  process.exit(1);
});
