#!/usr/bin/env node
/**
 * Tejas MCP HTTP server — served by te.js.
 * Run: node dist/serve-tejas.js (or npm run serve)
 *
 * Environment:
 *   MCP_HTTP_PORT  — port (default 3333)
 *   PORT           — overridden by MCP_HTTP_PORT if set
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Tejas, { Target } from "te.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "./server.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.MCP_HTTP_PORT
  ? parseInt(process.env.MCP_HTTP_PORT, 10)
  : 3333;

// Ensure dist/targets exists and point te.js at it (relative to package root so path.join(cwd, DIR_TARGETS) works on all platforms).
const targetsDir = path.join(__dirname, "targets");
fs.mkdirSync(targetsDir, { recursive: true });
process.chdir(path.join(__dirname, ".."));
process.env.DIR_TARGETS = path.relative(process.cwd(), targetsDir);
process.env.PORT = String(PORT);

const mcpTarget = new Target("");

mcpTarget.register("/mcp", async (ammo: {
  GET: boolean;
  POST: boolean;
  req: import("node:http").IncomingMessage;
  res: import("node:http").ServerResponse;
  payload: unknown;
  fire: (status: number, body: unknown) => void;
  notAllowed: () => void;
}) => {
  if (ammo.GET) {
    ammo.fire(405, {
      jsonrpc: "2.0",
      error: {
        code: -32000,
        message: "Method not allowed. Use POST for MCP.",
      },
      id: null,
    });
    return;
  }

  if (!ammo.POST) {
    ammo.notAllowed();
    return;
  }

  try {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless
    });
    const server = createMcpServer();
    await server.connect(transport);
    ammo.res.on("close", () => {
      transport.close().catch(() => {});
    });
    await transport.handleRequest(ammo.req, ammo.res, ammo.payload ?? {});
  } catch (err) {
    console.error("MCP HTTP request error:", err);
    if (!ammo.res.headersSent) {
      ammo.fire(500, {
        jsonrpc: "2.0",
        error: { code: -32603, message: "Internal server error" },
        id: null,
      });
    }
  }
});

// OAuth discovery: clients may probe this; we don't support OAuth, return 404 without throwing (avoids ERROR log).
mcpTarget.register("/.well-known/oauth-authorization-server", (ammo: { GET: boolean; fire: (status: number, body?: unknown) => void }) => {
  if (ammo.GET) ammo.fire(404);
});

const app = new Tejas({
  port: PORT,
  log: { http_requests: false, exceptions: true },
});

app.takeoff();