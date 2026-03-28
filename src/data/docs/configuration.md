# Configuration

Tejas provides a flexible configuration system that merges settings from multiple sources.

## Configuration Sources

Settings are loaded from three sources. Later sources override earlier ones:

1. **`tejas.config.json`** — file in your project root (lowest priority)
2. **Environment variables** — from `.env` or system environment
3. **Constructor options** — passed to `new Tejas({...})` (highest priority)

All configuration keys are normalized: nested objects are flattened with underscores and uppercased. For example, `log.http_requests` becomes the environment variable `LOG_HTTP_REQUESTS`.

## Quick Start

The simplest way to configure Tejas is with a `tejas.config.json` file:

```json
{
  "port": 3000,
  "dir": {
    "targets": "targets"
  },
  "log": {
    "http_requests": true,
    "exceptions": true
  }
}
```

Or pass options directly to the constructor:

```javascript
import Tejas from "te.js";

const app = new Tejas({
  port: 3000,
  log: { http_requests: true },
});

app.takeoff();
```

## Complete Configuration Reference

### Core

| Config Key    | Env Variable  | Type   | Default           | Description                                                                                               |
| ------------- | ------------- | ------ | ----------------- | --------------------------------------------------------------------------------------------------------- |
| `entry`       | `ENTRY`       | string | _(auto-resolved)_ | Entry file for `tejas fly`. Falls back to `package.json` `main`, then `index.js` / `app.js` / `server.js` |
| `port`        | `PORT`        | number | `1403`            | Server port                                                                                               |
| `dir.targets` | `DIR_TARGETS` | string | `"targets"`       | Directory containing `.target.js` files for auto-discovery                                                |

### Logging

| Config Key          | Env Variable        | Type    | Default | Description                                             |
| ------------------- | ------------------- | ------- | ------- | ------------------------------------------------------- |
| `log.http_requests` | `LOG_HTTP_REQUESTS` | boolean | `false` | Log incoming HTTP requests (method, path, status, time) |
| `log.exceptions`    | `LOG_EXCEPTIONS`    | boolean | `false` | Log unhandled exceptions and errors                     |

### Response Structure {#response-structure}

By default, Tejas wraps all success responses in `{ data: ... }` and all error responses in `{ error: ... }`. This gives clients a consistent envelope. See [Ammo — fire()](./ammo.md#fire----send-response) for examples. Disable or customize via the options below.

| Config Key                 | Env Variable                | Type    | Default   | Description                                                                              |
| -------------------------- | --------------------------- | ------- | --------- | ---------------------------------------------------------------------------------------- |
| `response.envelopeEnabled` | `RESPONSE_ENVELOPE_ENABLED` | boolean | `true`    | Enable response envelope: wrap success in `{ data: ... }` and errors in `{ error: ... }` |
| `response.successKey`      | `RESPONSE_SUCCESSKEY`       | string  | `"data"`  | Key used to wrap 2xx response bodies                                                     |
| `response.errorKey`        | `RESPONSE_ERRORKEY`         | string  | `"error"` | Key used to wrap 4xx/5xx response bodies                                                 |

### Request Body

| Config Key      | Env Variable    | Type   | Default            | Description                                                                       |
| --------------- | --------------- | ------ | ------------------ | --------------------------------------------------------------------------------- |
| `body.max_size` | `BODY_MAX_SIZE` | number | `10485760` (10 MB) | Maximum request body size in bytes. Requests exceeding this receive a 413 error   |
| `body.timeout`  | `BODY_TIMEOUT`  | number | `30000` (30 s)     | Body parsing timeout in milliseconds. Requests exceeding this receive a 408 error |

### Allowed HTTP methods

| Config Key       | Env Variable     | Type                            | Default                                        | Description                                                                                                                          |
| ---------------- | ---------------- | ------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `allowedMethods` | `ALLOWEDMETHODS` | array or comma-separated string | `GET, POST, PUT, DELETE, PATCH, HEAD, OPTIONS` | HTTP methods allowed at the framework level. Non-standard methods (e.g. TRACE, CONNECT) are rejected with 405 before route matching. |

### Auto-Documentation

These options configure the `tejas generate:docs` CLI command and the auto-documentation system. See [Auto-Documentation](./auto-docs.md) for full details.

| Config Key              | Env Variable             | Type   | Default                       | Description                                                         |
| ----------------------- | ------------------------ | ------ | ----------------------------- | ------------------------------------------------------------------- |
| `docs.dirTargets`       | `DOCS_DIR_TARGETS`       | string | `"targets"`                   | Target directory for doc generation (can differ from `dir.targets`) |
| `docs.output`           | —                        | string | `"./openapi.json"`            | Output path for the generated OpenAPI spec                          |
| `docs.title`            | —                        | string | `"API"`                       | API title in the OpenAPI `info` block                               |
| `docs.version`          | —                        | string | `"1.0.0"`                     | API version in the OpenAPI `info` block                             |
| `docs.description`      | —                        | string | `""`                          | API description                                                     |
| `docs.level`            | —                        | number | `1`                           | LLM enhancement level (1–3). Higher = better docs, more tokens      |
| `docs.llm.baseURL`      | `LLM_BASE_URL`           | string | `"https://api.openai.com/v1"` | LLM provider endpoint                                               |
| `docs.llm.apiKey`       | `LLM_API_KEY`            | string | —                             | LLM provider API key                                                |
| `docs.llm.model`        | `LLM_MODEL`              | string | `"gpt-4o-mini"`               | LLM model name                                                      |
| `docs.overviewPath`     | —                        | string | `"./API_OVERVIEW.md"`         | Path for the generated overview page (level 3 only)                 |
| `docs.productionBranch` | `DOCS_PRODUCTION_BRANCH` | string | `"main"`                      | Git branch that triggers `docs:on-push`                             |

### Error handling (LLM-inferred errors)

When [LLM-inferred errors](./error-handling.md#llm-inferred-errors) are enabled, the **`errors.llm`** block configures the LLM used to enrich every `ammo.throw()` call. Explicit status codes and messages are preserved; the LLM adds a `devInsight` for Tejas Radar. For bare errors the LLM also infers status code and message. Unset values fall back to `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`. You can also enable programmatically with **`app.withLLMErrors(config?)`** before `takeoff()`.

| Config Key               | Env Variable                                    | Type                               | Default              | Description                                                                                                                                                                |
| ------------------------ | ----------------------------------------------- | ---------------------------------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `errors.llm.enabled`     | `ERRORS_LLM_ENABLED`                            | boolean                            | `false`              | Enable LLM error enrichment for every `ammo.throw()` call                                                                                                                  |
| `errors.llm.baseURL`     | `ERRORS_LLM_BASE_URL` or `LLM_BASE_URL`         | string                             | —                    | LLM provider endpoint. Required when enabled.                                                                                                                              |
| `errors.llm.apiKey`      | `ERRORS_LLM_API_KEY` or `LLM_API_KEY`           | string                             | —                    | LLM provider API key. Required when enabled.                                                                                                                               |
| `errors.llm.model`       | `ERRORS_LLM_MODEL` or `LLM_MODEL`               | string                             | —                    | LLM model name. Required when enabled.                                                                                                                                     |
| `errors.llm.messageType` | `ERRORS_LLM_MESSAGE_TYPE` or `LLM_MESSAGE_TYPE` | `"endUser"` \| `"developer"`       | `"endUser"`          | Default tone for LLM-generated message. Overridable per `ammo.throw()` call.                                                                                               |
| `errors.llm.mode`        | `ERRORS_LLM_MODE`                               | `"sync"` \| `"async"`              | `"sync"`             | `sync` blocks the response until LLM returns. `async` responds immediately with the resolved status code and dispatches the LLM devInsight to a channel in the background. |
| `errors.llm.timeout`     | `ERRORS_LLM_TIMEOUT` or `LLM_TIMEOUT`           | number (ms)                        | `10000`              | Fetch timeout for LLM requests.                                                                                                                                            |
| `errors.llm.channel`     | `ERRORS_LLM_CHANNEL` or `LLM_CHANNEL`           | `"console"` \| `"log"` \| `"both"` | `"console"`          | Output channel for async mode results. Only applies when `mode` is `"async"`.                                                                                              |
| `errors.llm.logFile`     | `ERRORS_LLM_LOG_FILE`                           | string (path)                      | `"./errors.llm.log"` | Path to JSONL log file for `log` and `both` channels.                                                                                                                      |
| `errors.llm.rateLimit`   | `ERRORS_LLM_RATE_LIMIT` or `LLM_RATE_LIMIT`     | number                             | `10`                 | Max LLM calls per minute. Cached results do not count against this limit.                                                                                                  |
| `errors.llm.cache`       | `ERRORS_LLM_CACHE`                              | boolean                            | `true`               | Cache LLM results by throw site (file + line) and error message to avoid repeated calls.                                                                                   |
| `errors.llm.cacheTTL`    | `ERRORS_LLM_CACHE_TTL`                          | number (ms)                        | `3600000`            | How long cached results are reused (default 1 hour).                                                                                                                       |

When enabled, the same behaviour applies whether you call `ammo.throw()` or the framework calls it when it catches an error — one mechanism, no separate config.

## Configuration File

Create a `tejas.config.json` in your project root:

```json
{
  "entry": "app.js",
  "port": 3000,
  "dir": {
    "targets": "targets"
  },
  "log": {
    "http_requests": true,
    "exceptions": true
  },
  "response": {
    "envelopeEnabled": true,
    "successKey": "data",
    "errorKey": "error"
  },
  "body": {
    "max_size": 5242880,
    "timeout": 15000
  },
  "docs": {
    "output": "./openapi.json",
    "title": "My API",
    "version": "1.0.0",
    "level": 2,
    "productionBranch": "main"
  },
  "errors": {
    "llm": {
      "enabled": true,
      "baseURL": "https://api.openai.com/v1",
      "model": "gpt-4o-mini",
      "messageType": "endUser",
      "mode": "async",
      "timeout": 10000,
      "channel": "both",
      "logFile": "./errors.llm.log",
      "rateLimit": 10,
      "cache": true,
      "cacheTTL": 3600000
    }
  }
}
```

## Environment Variables

Create a `.env` file in your project root. Tejas uses [tej-env](https://www.npmjs.com/package/tej-env) to load it automatically:

```bash
# Server
PORT=3000

# Logging
LOG_HTTP_REQUESTS=true
LOG_EXCEPTIONS=true

# Response envelope (default: enabled; 2xx → { data }, 4xx/5xx → { error })
# RESPONSE_ENVELOPE_ENABLED=true
# RESPONSE_SUCCESSKEY=data
# RESPONSE_ERRORKEY=error

# Body limits
BODY_MAX_SIZE=5242880
BODY_TIMEOUT=15000

# Target directory
DIR_TARGETS=targets

# LLM (shared: docs + errors.llm when not overridden)
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=sk-...
LLM_MODEL=gpt-4o-mini

# Optional: errors.llm (LLM-inferred errors for ammo.throw())
# ERRORS_LLM_ENABLED=true
# ERRORS_LLM_MESSAGE_TYPE=endUser   # or "developer"
```

## Constructor Options

Pass an object to `new Tejas()` using the same nested structure as `tejas.config.json`:

```javascript
import Tejas from "te.js";

const app = new Tejas({
  port: 3000,
  log: {
    http_requests: true,
    exceptions: true,
  },
  body: {
    max_size: 10 * 1024 * 1024,
    timeout: 30000,
  },
});
```

Constructor options have the highest priority and override both the config file and environment variables.

## CORS

CORS is configured programmatically via **`app.withCORS(config?)`**, not through the config file. Call before `takeoff()`. Options: `origin` (`'*'`, array of origins, or function), `methods`, `allowedHeaders`, `credentials`, `maxAge`. OPTIONS preflight returns 204 with CORS headers.

## How Merging Works

All configuration is flattened into a single-level object with uppercased keys:

```javascript
// tejas.config.json
{ "log": { "http_requests": true } }

// Becomes accessible as:
env('LOG_HTTP_REQUESTS') // true
```

The merge order is: config file values, then env vars override those, then constructor options override everything.

## Accessing Configuration at Runtime

Use the `env()` function from `tej-env` to read any configuration value:

```javascript
import { env } from "tej-env";

target.register("/info", (ammo) => {
  ammo.fire({
    port: env("PORT"),
    maxBodySize: env("BODY_MAX_SIZE"),
  });
});
```

## Auto-Registration

Tejas automatically discovers and imports all files ending in `.target.js` from the configured `dir.targets` directory (recursively, including subdirectories):

```
targets/
├── user.target.js      --> Auto-loaded
├── auth.target.js      --> Auto-loaded
├── utils.js            --> Ignored (wrong suffix)
└── api/
    └── v1.target.js    --> Auto-loaded
```

To change the targets directory:

```json
{
  "dir": {
    "targets": "src/routes"
  }
}
```

## Next Steps

- [Getting Started](./getting-started.md) — Build your first Tejas application
- [Routing](./routing.md) — Define routes and endpoints
- [Auto-Documentation](./auto-docs.md) — Generate OpenAPI docs from your code
- [CLI Reference](./cli.md) — `tejas fly` and doc generation commands
