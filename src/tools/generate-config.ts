import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const docsConfigSchema = z
  .object({
    output: z.string().optional(),
    title: z.string().optional(),
    version: z.string().optional(),
    level: z.number().optional(),
    llm: z
      .object({
        baseURL: z.string().optional(),
        apiKey: z.string().optional(),
        model: z.string().optional(),
      })
      .optional(),
  })
  .optional();

const aiConfigSchema = z
  .object({
    provider: z.string().optional(),
    features: z.array(z.string()).optional(),
  })
  .optional();

export function registerGenerateConfig(server: McpServer): void {
  server.tool(
    "generate_config",
    "Generates a tejas.config.json file with the specified options.",
    {
      port: z.number().optional(),
      logHttpRequests: z.boolean().optional(),
      logExceptions: z.boolean().optional(),
      dirTargets: z.string().optional(),
      bodyMaxSize: z.number().optional(),
      docsConfig: docsConfigSchema,
      aiConfig: aiConfigSchema,
    },
    async (args) => {
      const { generateConfig } = await import("./generate-config-handler.js");
      return generateConfig(args);
    }
  );
}
