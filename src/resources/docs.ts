import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const DOC_TOPICS = [
  "docs-index",
  "getting-started",
  "configuration",
  "routing",
  "ammo",
  "middleware",
  "error-handling",
  "database",
  "rate-limiting",
  "file-uploads",
  "cli",
  "auto-docs",
  "api-reference",
] as const;

export function registerDocsResources(server: McpServer): void {
  for (const topic of DOC_TOPICS) {
    const uri = `tejas://docs/${topic}`;
    server.resource(
      `tejas-docs-${topic}`,
      uri,
      async (url) => {
        const { readDocResource } = await import("./docs-handler.js");
        return readDocResource(url);
      }
    );
  }
}
