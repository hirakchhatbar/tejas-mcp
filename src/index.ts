#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { runServer } from "./server.js";

const useHttp = process.argv.includes("--http");

async function main() {
  if (useHttp) {
    await import("./serve-tejas.js");
    return;
  }
  // Stderr only — stdout is used for MCP JSON-RPC
  process.stderr.write(
    "Tejas MCP server running (stdio). Connect your IDE MCP client (e.g. Cursor). Press Ctrl+C to exit.\n"
  );
  const transport = new StdioServerTransport();
  await runServer(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
