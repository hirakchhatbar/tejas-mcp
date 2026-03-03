import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerTejasExpertPrompt(server: McpServer): void {
  server.prompt(
    "tejas-expert",
    "Comprehensive system prompt to make an LLM a Tejas (te.js) framework expert. Optionally tailor by task.",
    { task: z.string().optional().describe("What the developer wants to build") },
    async (args) => {
      const { getTejasExpertPrompt } = await import("./tejas-expert-handler.js");
      return getTejasExpertPrompt(args);
    }
  );
}
