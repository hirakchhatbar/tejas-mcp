# Tejas MCP Server

MCP server for **[Tejas (te.js)](https://github.com/hirakchhatbar/te.js)** — the AI-native Node.js framework. It exposes framework documentation, code examples, and code-generation tools so that AI assistants in IDEs can write correct te.js code with full framework knowledge.

## Features

- **Tools**: `get_documentation`, `search_docs`, `get_code_example`, `generate_target`, `generate_app_entry`, `generate_config`, `scaffold_project`
- **Resources**: 12 documentation topics at `tejas://docs/{topic}` (e.g. `tejas://docs/routing`, `tejas://docs/ammo`)
- **Prompts**: `tejas-expert` — system prompt to make an LLM a Tejas expert (optional `task` argument to tailor the prompt)

## Installation

From your project or globally:

```bash
npm install -g tejas-mcp
# or
npx tejas-mcp
```

For Cursor (or any MCP client), use the local or global server. If you run `npx tejas-mcp` in a terminal, it will start and wait for a client (e.g. Cursor) to connect over stdio — that’s expected; press Ctrl+C to stop.

## Configuration

### Cursor

Add the Tejas MCP server to your Cursor MCP settings (e.g. `.cursor/mcp.json` or Cursor Settings → MCP):

```json
{
  "mcpServers": {
    "tejas": {
      "command": "npx",
      "args": ["-y", "tejas-mcp"]
    }
  }
}
```

If you installed globally:

```json
{
  "mcpServers": {
    "tejas": {
      "command": "tejas-mcp"
    }
  }
}
```

### Other IDEs

Use the same stdio transport: run `npx tejas-mcp` or `tejas-mcp` as the MCP server command with no arguments. The server communicates via stdin/stdout using the Model Context Protocol.

### HTTP transport (Streamable HTTP)

The HTTP server runs on **te.js** (same framework the MCP documents). Run it with:

```bash
npx tejas-mcp --http
# or after install: npm run serve
```

By default it listens on `http://0.0.0.0:3333/mcp`. Configure with:

- `MCP_HTTP_PORT` — port (default: `3333`)

For Cursor or other MCP clients that support URL-based servers, use:

- **URL:** `http://localhost:3333/mcp` (or your host/port)

The HTTP endpoint is stateless: each request gets a new session. Use POST for JSON-RPC; GET returns 405.

## Development

```bash
git clone <repo>
cd tejas-mcp
npm install
npm run build
node dist/index.js
```

The server runs over stdio; an MCP client (e.g. Cursor) will start it as a subprocess and exchange JSON-RPC messages.

To develop against a local clone of **te.js** (e.g. in a sibling directory), use npm link:

```bash
cd /path/to/te.js && npm link
cd /path/to/tejas-mcp && npm link te.js
npm run build
```

## Documentation topics

| Topic           | URI                       |
|----------------|---------------------------|
| Docs index     | `tejas://docs/docs-index` |
| Getting started| `tejas://docs/getting-started` |
| Configuration  | `tejas://docs/configuration` |
| Routing        | `tejas://docs/routing` |
| Ammo           | `tejas://docs/ammo` |
| Middleware     | `tejas://docs/middleware` |
| Error handling | `tejas://docs/error-handling` |
| Rate limiting  | `tejas://docs/rate-limiting` |
| File uploads   | `tejas://docs/file-uploads` |
| CLI            | `tejas://docs/cli` |
| Auto-docs      | `tejas://docs/auto-docs` |
| API reference  | `tejas://docs/api-reference` |

## License

ISC
