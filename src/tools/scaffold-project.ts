import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const FEATURES = [
  "rate-limiting",
  "redis",
  "mongodb",
  "file-uploads",
  "auto-docs",
  "ai",
] as const;

export function registerScaffoldProject(server: McpServer): void {
  server.tool(
    "scaffold_project",
    "Generates a complete Tejas project structure with all files.",
    {
      name: z.string().describe("Project name"),
      features: z
        .array(z.enum(FEATURES))
        .optional()
        .default([])
        .describe("Subset of features to enable"),
    },
    async (args) => {
      const { scaffoldProject } = await import("./scaffold-project-handler.js");
      return scaffoldProject(args);
    }
  );
}
