# Tejas MCP Server

MCP server for **[Tejas (te.js)](https://github.com/hirakchhatbar/te.js)** — the AI-native Node.js framework. It exposes framework documentation, code examples, and code-generation tools so that AI assistants in IDEs can write correct te.js code with full framework knowledge.

## Features

- **Tools**: `get_documentation`, `search_docs`, `get_code_example`, `generate_target`, `generate_app_entry`, `generate_config`, `scaffold_project`
- **Resources**: 13 documentation topics at `tejas://docs/{topic}` (e.g. `tejas://docs/routing`, `tejas://docs/ammo`)
- **Prompts**: `tejas-expert` — system prompt to make an LLM a Tejas expert (optional `task` argument to tailor the prompt)

## Installation

From your project or globally:

```bash
npm install -g tejas-mcp
# or
npx tejas-mcp
```

For Cursor (or any MCP client), use the local or global server.

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

## Development

```bash
git clone <repo>
cd tejas-mcp
npm install
npm run build
node dist/index.js
```

The server runs over stdio; an MCP client (e.g. Cursor) will start it as a subprocess and exchange JSON-RPC messages.

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
| Database       | `tejas://docs/database` |
| Rate limiting  | `tejas://docs/rate-limiting` |
| File uploads   | `tejas://docs/file-uploads` |
| CLI            | `tejas://docs/cli` |
| Auto-docs      | `tejas://docs/auto-docs` |
| API reference  | `tejas://docs/api-reference` |

## License

ISC
