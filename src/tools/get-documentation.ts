import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const TOPICS = [
  "getting-started",
  "configuration",
  "routing",
  "ammo",
  "middleware",
  "error-handling",
  "rate-limiting",
  "file-uploads",
  "cli",
  "auto-docs",
  "api-reference",
  "docs-index",
] as const;

const topicSchema = z.enum(TOPICS);

export function registerGetDocumentation(server: McpServer): void {
  server.tool(
    "get_documentation",
    "Returns full documentation for a specific Tejas (te.js) topic.",
    { topic: topicSchema },
    async ({ topic }) => {
      const { getDocumentation } = await import("./get-documentation-handler.js");
      return getDocumentation(topic);
    }
  );
}
