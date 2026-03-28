/**
 * Core framework facts for the tejas-expert prompt.
 * Covers Tejas (te.js) API, conventions, and common mistakes.
 */
export const frameworkKnowledge = `
# Tejas (te.js) — AI-Native Node.js Framework

## Identity
- Tejas is the **AI-native Node.js framework**. It uses AI internally to make the framework smarter (LLM-powered auto-docs, future: intelligent errors, semantic routing, AI alerting/monitoring). It is NOT a wrapper for LLM API calls; the framework itself is AI-powered.
- Shipped AI: LLM-powered auto-documentation (\`tejas generate:docs\`), MCP server for IDE assistants.
- Shipped AI: LLM-inferred errors — every \`ammo.throw()\` call is enriched by the LLM when enabled. Explicit status codes and messages are preserved; the LLM adds a \`devInsight\` for Tejas Radar. For bare errors and no-arg throws the LLM also infers status code and message from code context (surrounding + upstream/downstream). Enable via config \`errors.llm.enabled\` or \`app.withLLMErrors(config?)\` before takeoff. Key config: \`messageType\` (\`"endUser"\` | \`"developer"\`); \`mode\` (\`"sync"\` blocks response, \`"async"\` fires with resolved code immediately and dispatches LLM result to a channel); \`channel\` (\`"console"\` | \`"log"\` | \`"both"\`, async mode only); \`logFile\` (path for JSONL log, default \`"./errors.llm.log"\`); \`timeout\` (ms, default 10000); \`rateLimit\` (max LLM calls/min, default 10); \`cache\` (bool, default true — dedup by file+line+errorMessage); \`cacheTTL\` (ms, default 3600000). Cached results bypass rate limit. Per-call opt-out: \`{ useLlm: false }\` works on every signature including \`ammo.throw(502, 'msg', { useLlm: false })\`.
- Roadmap AI: semantic routing, natural language config, smart validation, AI-driven alerting/monitoring/analytics, anomaly detection, auto-remediation.
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
- \`app.takeoff()\` — start server.
- \`app.withRateLimit(options)\` — rate limiting. \`store\`: \`'memory'\` (default, single-instance) or \`{ type: 'redis', url: '...' }\` for distributed deployments. Redis package auto-installs on first use.
- \`app.withLLMErrors(config?)\` — enable LLM-inferred errors; optional \`{ baseURL, apiKey, model, messageType, mode, timeout, channel, logFile, rateLimit, cache, cacheTTL }\`. Call before takeoff.
- \`app.serveDocs(options)\` — Scalar UI at /docs; options: \`specPath\`, \`scalarConfig\`, \`password\` (or \`DOCS_PASSWORD\` env var — protects docs behind a login form; cookie-based session, 7-day TTL). In production (or when NODE_ENV is unset), docs are **disabled** unless a password is configured; in development, docs are open by default.
- \`app.withAI({ provider, apiKey, features })\` — AI features (opt-in).

## Target Class
- \`new Target(basePath)\` — e.g. \`new Target('/users')\`.
- \`target.midair(fn)\` — target-scoped middleware.
- \`target.register(path, [metadata], ...middlewares, handler)\` — metadata optional (for auto-docs: summary, description, request, response, methods).

## Ammo (request/response)
- Method flags: \`ammo.GET\`, \`ammo.POST\`, \`ammo.PUT\`, \`ammo.DELETE\`, \`ammo.PATCH\`, \`ammo.HEAD\`, \`ammo.OPTIONS\`.
- Request: \`ammo.payload\` (query + body + params), \`ammo.headers\`, \`ammo.method\`, \`ammo.ip\`, \`ammo.path\`, \`ammo.endpoint\`.
- Raw: \`ammo.req\`, \`ammo.res\` (Node.js http).
- Response: \`ammo.fire()\` (204), \`ammo.fire(data)\` (200), \`ammo.fire(status, data)\`, \`ammo.redirect(url)\`, \`ammo.notFound()\`, \`ammo.notAllowed()\`, \`ammo.unauthorized()\`, \`ammo.throw(...)\`, \`ammo.defaultEntry()\`. \`ammo.throw()\` is the **single mechanism** for error responses — you don't log and send separately; when the framework catches an error it uses the same \`ammo.throw(err)\`. When \`errors.llm.enabled\`, every throw is enriched by the LLM: explicit codes/messages are preserved, LLM adds devInsight; for bare errors/no-arg throws the LLM also infers status code and message. Opt out per call with \`{ useLlm: false }\` on any signature.
- Handlers can be \`async\`. If no method check, handler accepts ALL methods.

## TejError
- \`new TejError(statusCode, message)\` — throw for HTTP errors. Tejas catches and sends response.

## Middleware
- Order: Global → Target → Route → Handler. Tejas: \`(ammo, next)\`; Express: \`(req, res, next)\` (auto-detected by \`.length\`). Call \`ammo.fire()\` without \`next()\` to stop.

## File uploads
- \`new TejFileUploader({ destination, name, maxFileSize })\`; \`uploader.file('key')\`, \`uploader.files('key')\`.

## Config
- Priority: tejas.config.json < env vars < constructor. Env: nested keys → UPPER_SNAKE (e.g. \`log.http_requests\` → \`LOG_HTTP_REQUESTS\`). \`errors.llm\`: enabled, baseURL, apiKey, model, messageType, mode, timeout, channel, logFile, rateLimit, cache, cacheTTL; env \`ERRORS_LLM_*\` with fallback to \`LLM_*\` for shared keys. Enable via config or \`app.withLLMErrors(config?)\` before takeoff. When enabled, every ammo.throw() is enriched (explicit codes preserved, LLM adds devInsight) — same mechanism for developer throws and framework-caught errors.

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
