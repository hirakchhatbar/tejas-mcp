#!/usr/bin/env node

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { runServer } from "./server.js";

const useHttp = process.argv.includes("--http");

async function main() {
  if (useHttp) {
    await import("./serve-http.js");
    return;
  }
  const transport = new StdioServerTransport();
  await runServer(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
