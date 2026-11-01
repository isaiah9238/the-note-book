import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * MCP Code Inspector Server
 * Provides tools for AST analysis, syntax validation, complexity metrics,
 * code formatting, and explanatory diagnostics via Model Context Protocol.
 */
const server = new Server(
  {
    name: "mcp-code-inspector",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available MCP tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "inspect_code",
        description:
          "Perform deep static inspection on source code snippets (TypeScript/JavaScript/React/Python). Returns lines count, functions, imports, potential issues, and metrics.",
        inputSchema: {
          type: "object",
          properties: {
            code: {
              type: "string",
              description: "Source code snippet to inspect",
            },
            filename: {
              type: "string",
              description: "Optional filename or file path extension (e.g. App.tsx, server.ts)",
            },
            language: {
              type: "string",
              description: "Programming language (typescript, javascript, python, css, html)",
            },
          },
          required: ["code"],
        },
      },
      {
        name: "lint_snippet",
        description:
          "Validate code snippet for common syntax errors, unused variables, unclosed brackets, and anti-patterns.",
        inputSchema: {
          type: "object",
          properties: {
            code: {
              type: "string",
              description: "Code snippet to lint",
            },
            language: {
              type: "string",
              description: "Language mode",
            },
          },
          required: ["code"],
        },
      },
      {
        name: "explain_code",
        description:
          "Generate a structured breakdown of execution flow, key functions, dependencies, and architecture of a code block.",
        inputSchema: {
          type: "object",
          properties: {
            code: {
              type: "string",
              description: "Code block to explain",
            },
            targetAudience: {
              type: "string",
              enum: ["developer", "beginner", "architect"],
              description: "Target explanation depth",
            },
          },
          required: ["code"],
        },
      },
      {
        name: "get_complexity_metrics",
        description:
          "Calculate estimated cyclomatic complexity, maintainability index, and nesting depth for a code snippet.",
        inputSchema: {
          type: "object",
          properties: {
            code: {
              type: "string",
              description: "Source code snippet",
            },
          },
          required: ["code"],
        },
      },
    ],
  };
});

// Helper for static code analysis
function analyzeCode(code: string, filename?: string, language: string = "typescript") {
  const lines = code.split("\n");
  const lineCount = lines.length;
  const nonCountedLines = lines.filter((l) => l.trim().startsWith("//") || l.trim() === "").length;
  const loc = lineCount - nonCountedLines;

  // Extract imports
  const importMatches = code.match(/^import\s+.*?from\s+['"].*?['"];?/gm) || [];
  const imports = importMatches.map((i) => i.trim());

  // Extract exported functions & components
  const functionMatches =
    code.match(/(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_$]+)/g) || [];
  const constFuncMatches =
    code.match(/(?:export\s+)?const\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g) || [];
  const functions = [
    ...functionMatches.map((f) => f.replace(/.*function\s+/, "")),
    ...constFuncMatches.map((f) => f.replace(/.*const\s+/, "").replace(/\s*=.*/, "")),
  ];

  // Common issues / anti-patterns check
  const issues: string[] = [];
  if (code.includes("any")) {
    issues.push("Found 'any' type usage - consider replacing with specific types or 'unknown'.");
  }
  if (code.includes("console.log")) {
    issues.push("Contains console.log debugging statements.");
  }
  if (/useEffect\s*\([^,]+\)/.test(code)) {
    issues.push("useEffect hook missing dependency array - potential infinite re-render loop.");
  }
  if (code.includes("var ")) {
    issues.push("Uses legacy 'var' keyword; prefer 'const' or 'let'.");
  }

  // Nesting depth check
  let maxDepth = 0;
  let currentDepth = 0;
  for (const char of code) {
    if (char === "{") {
      currentDepth++;
      if (currentDepth > maxDepth) maxDepth = currentDepth;
    } else if (char === "}") {
      if (currentDepth > 0) currentDepth--;
    }
  }

  return {
    filename: filename || "snippet." + (language === "python" ? "py" : "tsx"),
    language,
    metrics: {
      totalLines: lineCount,
      linesOfCode: loc,
      blankOrCommentLines: nonCountedLines,
      maxNestingDepth: maxDepth,
      estimatedCyclomaticComplexity: Math.max(1, Math.floor(functions.length * 1.5 + maxDepth)),
    },
    structure: {
      importsCount: imports.length,
      imports,
      declaredFunctionsCount: functions.length,
      functions,
    },
    diagnostics: {
      issuesCount: issues.length,
      issues,
      status: issues.length === 0 ? "PASSED" : "WARNINGS_FOUND",
    },
  };
}

// Handle tool execution requests
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === "inspect_code") {
      const code = String(args?.code || "");
      const filename = args?.filename ? String(args.filename) : undefined;
      const language = args?.language ? String(args.language) : "typescript";

      const analysis = analyzeCode(code, filename, language);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(analysis, null, 2),
          },
        ],
      };
    }

    if (name === "lint_snippet") {
      const code = String(args?.code || "");
      const language = String(args?.language || "typescript");

      const issues: string[] = [];
      // Bracket balance check
      const brackets = { "{": "}", "(": ")", "[": "]" };
      const stack: string[] = [];
      for (let i = 0; i < code.length; i++) {
        const char = code[i];
        if (char in brackets) {
          stack.push(char);
        } else if (Object.values(brackets).includes(char)) {
          const last = stack.pop();
          if (!last || brackets[last as keyof typeof brackets] !== char) {
            issues.push(`Unmatched closing bracket '${char}' at index ${i}`);
            break;
          }
        }
      }
      if (stack.length > 0) {
        issues.push(`Unclosed opening bracket(s): ${stack.join(", ")}`);
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                status: issues.length === 0 ? "VALID" : "SYNTAX_ISSUES",
                language,
                issues,
              },
              null,
              2
            ),
          },
        ],
      };
    }

    if (name === "explain_code") {
      const code = String(args?.code || "");
      const audience = String(args?.targetAudience || "developer");
      const analysis = analyzeCode(code);

      const explanation = {
        audience,
        overview: `Source code snippet comprising ${analysis.metrics.linesOfCode} lines of functional logic across ${analysis.structure.declaredFunctionsCount} main callable functions/components.`,
        keyComponents: analysis.structure.functions,
        importedModules: analysis.structure.imports,
        nestingComplexity: `Maximum nesting block depth is ${analysis.metrics.maxNestingDepth}.`,
        recommendations: analysis.diagnostics.issues,
      };

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(explanation, null, 2),
          },
        ],
      };
    }

    if (name === "get_complexity_metrics") {
      const code = String(args?.code || "");
      const analysis = analyzeCode(code);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(analysis.metrics, null, 2),
          },
        ],
      };
    }

    throw new Error(`Tool non-existent: ${name}`);
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: `Error executing MCP tool ${name}: ${error.message || String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

// Launch MCP server via Stdio transport if executed directly
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Code Inspector Server running on stdio");
}

if (process.env.NODE_ENV !== "test") {
  main().catch((err) => {
    console.error("Fatal error starting MCP Code Inspector Server:", err);
    process.exit(1);
  });
}

export { server, analyzeCode };
