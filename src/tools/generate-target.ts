import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const endpointSchema = z.object({
  path: z.string(),
  methods: z.array(z.string()).optional(),
  description: z.string().optional(),
});

export function registerGenerateTarget(server: McpServer): void {
  server.tool(
    "generate_target",
    "Generates a .target.js file based on name, basePath, endpoints, and options.",
    {
      name: z.string().describe("Target name, e.g. 'users'"),
      basePath: z.string().describe("Base route path, e.g. '/users'"),
      endpoints: z.array(endpointSchema).describe("List of endpoints"),
      withMiddleware: z.boolean().optional().default(false),
      withFileUpload: z.boolean().optional().default(false),
    },
    async (args) => {
      const { generateTarget } = await import("./generate-target-handler.js");
      return generateTarget(args);
    }
  );
}
