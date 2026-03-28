import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const PATTERNS = [
  "hello-world",
  "basic-routing",
  "rest-api",
  "crud-api",
  "middleware-usage",
  "file-upload",
  "rate-limiting",
  "error-handling",
  "full-app",
  "express-migration",
  "auto-docs-setup",
  "cli-usage",
] as const;

const patternSchema = z.enum(PATTERNS);

export function registerGetCodeExample(server: McpServer): void {
  server.tool(
    "get_code_example",
    "Returns a complete, runnable code example for a Tejas (te.js) pattern.",
    { pattern: patternSchema },
    async ({ pattern }) => {
      const { getCodeExample } = await import("./get-code-example-handler.js");
      return getCodeExample(pattern);
    }
  );
}
