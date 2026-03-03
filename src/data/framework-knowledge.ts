/**
 * Core framework facts for the tejas-expert prompt.
 * Covers Tejas (te.js) API, conventions, and common mistakes.
 */
export const frameworkKnowledge = `
# Tejas (te.js) — AI-Native Node.js Framework

## Identity
- Tejas is the **AI-native Node.js framework**. It uses AI internally to make the framework smarter (LLM-powered auto-docs, future: intelligent errors, semantic routing, AI alerting/monitoring). It is NOT a wrapper for LLM API calls; the framework itself is AI-powered.
- Shipped AI: LLM-powered auto-documentation (\`tejas generate:docs\`), MCP server for IDE assistants.
- Roadmap AI: intelligent error analysis, semantic routing, natural language config, smart validation, AI-driven alerting/monitoring/analytics, anomaly detection, auto-remediation.
- AI provider: \`app.withAI({ provider, apiKey, features })\` — opt-in, pluggable (OpenAI, Anthropic, Ollama), privacy-safe.

## Core Concepts (aviation-themed)
| Tejas | Express | Description |
|-------|---------|-------------|
| Tejas | express() | Main app |
| Target | Router | Route group |
| Ammo | req + res | Request/response |
| fire() | res.send() | Send response |
| throw() | — | Error response |
| midair() | use() | Middleware |
| takeoff() | listen() | Start server |

## Tejas Class
- \`new Tejas(options)\` — config from tejas.config.json, env, then constructor.
- \`app.midair(fn)\` — global middleware. Tejas signature: \`(ammo, next) => { ...; next(); }\`.
- \`app.takeoff(options)\` — start server; options: \`{ withRedis, withMongo }\`.
- \`app.withRateLimit(options)\` — rate limiting.
- \`app.withRedis(config)\` / \`app.withMongo(config)\` — DB connections.
- \`app.serveDocs(options)\` — Scalar UI at /docs; options: \`specPath\`, \`scalarConfig\`.
- \`app.withAI({ provider, apiKey, features })\` — AI features (opt-in).

## Target Class
- \`new Target(basePath)\` — e.g. \`new Target('/users')\`.
- \`target.midair(fn)\` — target-scoped middleware.
- \`target.register(path, [metadata], ...middlewares, handler)\` — metadata optional (for auto-docs: summary, description, request, response, methods).

## Ammo (request/response)
- Method flags: \`ammo.GET\`, \`ammo.POST\`, \`ammo.PUT\`, \`ammo.DELETE\`, \`ammo.PATCH\`, \`ammo.HEAD\`, \`ammo.OPTIONS\`.
- Request: \`ammo.payload\` (query + body + params), \`ammo.headers\`, \`ammo.method\`, \`ammo.ip\`, \`ammo.path\`, \`ammo.endpoint\`.
- Raw: \`ammo.req\`, \`ammo.res\` (Node.js http).
- Response: \`ammo.fire()\` (204), \`ammo.fire(data)\` (200), \`ammo.fire(status, data)\`, \`ammo.redirect(url)\`, \`ammo.notFound()\`, \`ammo.notAllowed()\`, \`ammo.unauthorized()\`, \`ammo.throw(status?, message?)\`, \`ammo.defaultEntry()\`.
- Handlers can be \`async\`. If no method check, handler accepts ALL methods.

## TejError
- \`new TejError(statusCode, message)\` — throw for HTTP errors. Tejas catches and sends response.

## Middleware
- Order: Global → Target → Route → Handler. Tejas: \`(ammo, next)\`; Express: \`(req, res, next)\` (auto-detected by \`.length\`). Call \`ammo.fire()\` without \`next()\` to stop.

## File uploads
- \`new TejFileUploader({ destination, name, maxFileSize })\`; \`uploader.file('key')\`, \`uploader.files('key')\`.

## Config
- Priority: tejas.config.json < env vars < constructor. Env: nested keys → UPPER_SNAKE (e.g. \`log.http_requests\` → \`LOG_HTTP_REQUESTS\`).

## Project structure
- \`*.target.js\` in \`DIR_TARGETS\` (default "targets"), recursive auto-discovery.

## CLI
- \`tejas fly [file]\` — start server. Entry: CLI arg → config entry → package.json main → index.js.
- \`tejas generate:docs [--ci]\` — OpenAPI; CI reads config + env (e.g. LLM_API_KEY).
- \`tejas docs:on-push\` — pre-push hook for doc generation on production branch.

## Common mistakes
- Wrapping handlers in try-catch (Tejas handles errors).
- Wrong middleware signature (use \`(ammo, next)\` for Tejas middleware).
- Forgetting \`.target.js\` suffix or wrong \`dir.targets\`.
- Using \`res.send\` instead of \`ammo.fire\`.
- Not calling \`next()\` in middleware when continuing the chain.
`;
