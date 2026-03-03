import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerGenerateAppEntry(server: McpServer): void {
  server.tool(
    "generate_app_entry",
    "Generates the main application entry file with configurable features.",
    {
      port: z.number().optional(),
      withRateLimit: z.boolean().optional().default(false),
      withRedis: z.boolean().optional().default(false),
      withMongo: z.boolean().optional().default(false),
      withDocs: z.boolean().optional().default(false),
      withAI: z.boolean().optional().default(false),
      globalMiddleware: z.array(z.string()).optional().default([]),
    },
    async (args) => {
      const { generateAppEntry } = await import("./generate-app-handler.js");
      return generateAppEntry(args);
    }
  );
}
