import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import type { Transport } from "@modelcontextprotocol/sdk/shared/transport.js";
import { registerGetDocumentation } from "./tools/get-documentation.js";
import { registerSearchDocs } from "./tools/search-docs.js";
import { registerGetCodeExample } from "./tools/get-code-example.js";
import { registerGenerateTarget } from "./tools/generate-target.js";
import { registerGenerateAppEntry } from "./tools/generate-app.js";
import { registerGenerateConfig } from "./tools/generate-config.js";
import { registerScaffoldProject } from "./tools/scaffold-project.js";
import { registerDocsResources } from "./resources/docs.js";
import { registerTejasExpertPrompt } from "./prompts/tejas-expert.js";

export async function runServer(transport: Transport): Promise<void> {
  const server = new McpServer({
    name: "tejas-mcp",
    version: "1.0.0",
  });

  registerGetDocumentation(server);
  registerSearchDocs(server);
  registerGetCodeExample(server);
  registerGenerateTarget(server);
  registerGenerateAppEntry(server);
  registerGenerateConfig(server);
  registerScaffoldProject(server);
  registerDocsResources(server);
  registerTejasExpertPrompt(server);

  await server.connect(transport);
}
