import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerSearchDocs(server: McpServer): void {
  server.tool(
    "search_docs",
    "Search across all Tejas documentation for a keyword or concept.",
    { query: z.string().describe("Search query") },
    async ({ query }) => {
      const { searchDocs } = await import("./search-docs-handler.js");
      return searchDocs(query);
    }
  );
}
