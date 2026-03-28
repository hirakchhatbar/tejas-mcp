/**
 * Complete, runnable code examples for Tejas (te.js) patterns.
 * Used by get_code_example tool.
 */
export const examples: Record<string, string> = {
  "hello-world": `// Minimal Tejas app - index.js
import Tejas from 'te.js';

const app = new Tejas();
app.takeoff();

// targets/hello.target.js
import { Target } from 'te.js';

const target = new Target('/hello');
target.register('/', (ammo) => {
  ammo.fire({ message: 'Hello, World!' });
});
export default target;
`,

  "basic-routing": `// targets/hello.target.js - Basic routing with Target
import { Target } from 'te.js';

const target = new Target('/hello');

target.register('/', (ammo) => {
  ammo.fire({ message: 'Hello, World!' });
});

target.register('/greet/:name', (ammo) => {
  const { name } = ammo.payload;
  ammo.fire({ message: \`Hello, \${name}!\` });
});

export default target;
`,

  "rest-api": `// targets/api.target.js - REST-style endpoints with method checks
import { Target } from 'te.js';

const api = new Target('/api');

api.register('/items', (ammo) => {
  if (ammo.GET) return ammo.fire([{ id: 1, name: 'Item 1' }]);
  if (ammo.POST) return ammo.fire(201, { id: 2, name: ammo.payload.name });
  ammo.notAllowed();
});

api.register('/items/:id', (ammo) => {
  const { id } = ammo.payload;
  if (ammo.GET) return ammo.fire({ id, name: 'Item ' + id });
  if (ammo.PUT) return ammo.fire({ id, name: ammo.payload.name });
  if (ammo.DELETE) return ammo.fire(204);
  ammo.notAllowed();
});

export default api;
`,

  "crud-api": `// targets/users.target.js - Full CRUD with ammo.GET/POST/PUT/DELETE
import { Target, TejError } from 'te.js';

const users = new Target('/users');

const store = new Map();

users.register('/', (ammo) => {
  if (ammo.GET) return ammo.fire([...store.values()]);
  if (ammo.POST) {
    const { name, email } = ammo.payload;
    if (!name || !email) throw new TejError(400, 'name and email required');
    const id = String(store.size + 1);
    const user = { id, name, email };
    store.set(id, user);
    return ammo.fire(201, user);
  }
  ammo.notAllowed();
});

users.register('/:id', (ammo) => {
  const { id } = ammo.payload;
  const user = store.get(id);
  if (ammo.GET) {
    if (!user) return ammo.notFound();
    return ammo.fire(user);
  }
  if (ammo.PUT) {
    if (!user) return ammo.notFound();
    const updated = { ...user, ...ammo.payload };
    store.set(id, updated);
    return ammo.fire(updated);
  }
  if (ammo.DELETE) {
    if (!store.has(id)) return ammo.notFound();
    store.delete(id);
    return ammo.fire(204);
  }
  ammo.notAllowed();
});

export default users;
`,

  "middleware-usage": `// Target-scoped middleware (midair) and route-level middleware
import { Target, TejError } from 'te.js';

const target = new Target('/api');

// Target-level: auth guard
target.midair((ammo, next) => {
  const key = ammo.headers['x-api-key'];
  if (!key || key !== process.env.API_KEY) {
    return ammo.unauthorized();
  }
  next();
});

target.register('/data', (ammo) => {
  if (ammo.GET) ammo.fire({ data: [] });
  else ammo.notAllowed();
});

export default target;
`,

  "file-upload": `// Single and multiple file upload with TejFileUploader
import { Target, TejFileUploader } from 'te.js';

const target = new Target('/upload');
const uploader = new TejFileUploader({
  destination: 'uploads',
  maxFileSize: 5 * 1024 * 1024, // 5MB
});

// Single file per key
target.register('/image', uploader.file('image'), (ammo) => {
  const { image } = ammo.payload;
  ammo.fire(200, { message: 'Uploaded', file: image });
});

// Multiple files per key
target.register('/documents', uploader.files('documents'), (ammo) => {
  const { documents } = ammo.payload;
  ammo.fire(200, { count: documents?.length ?? 0, files: documents });
});

export default target;
`,

  "rate-limiting": `// Rate limiting (memory store) - index.js
import Tejas from 'te.js';

const app = new Tejas();

app.withRateLimit({
  maxRequests: 60,
  timeWindowSeconds: 60,
  algorithm: 'sliding-window',
  store: 'memory',
});

app.takeoff();
`,

  "error-handling": `// Zero-config: Tejas catches all errors. When errors.llm.enabled, every ammo.throw() is enriched by the LLM.
import Tejas, { Target, TejError } from 'te.js';

// -- LLM errors config (tejas.config.json or .env) --
// Sync mode (default): blocks response until LLM returns
// ERRORS_LLM_MODE=sync
//
// Async mode: responds immediately with 500, dispatches LLM result to channel in background
// ERRORS_LLM_MODE=async
// ERRORS_LLM_CHANNEL=both        # console | log | both
// ERRORS_LLM_LOG_FILE=./errors.llm.log
//
// Usage control:
// ERRORS_LLM_TIMEOUT=10000       # ms, abort LLM fetch after this
// ERRORS_LLM_RATE_LIMIT=10       # max LLM calls per minute (cached results don't count)
// ERRORS_LLM_CACHE=true          # reuse results by throw site + error message
// ERRORS_LLM_CACHE_TTL=3600000   # 1 hour

// Or programmatically:
// app.withLLMErrors({ mode: 'async', channel: 'both', rateLimit: 20, cacheTTL: 86400000 });

const target = new Target('/api');

// Explicit: status and message (always override — LLM not called)
target.register('/fail', (ammo) => {
  throw new TejError(400, 'Bad request');
});
target.register('/notfound', (ammo) => ammo.notFound());
target.register('/server-error', (ammo) => ammo.throw(500, 'Internal error')); // keeps 500, LLM adds devInsight

// No args — LLM infers status code + message + devInsight from code context
target.register('/users/:id', async (ammo) => {
  const user = await findUser(ammo.payload.id);
  if (!user) return ammo.throw();
  ammo.fire(user);
});

// Pass caught error; LLM infers from error + code context. Opt out with { useLlm: false }
target.register('/risky', async (ammo) => {
  try {
    const data = await riskyOp();
    ammo.fire(data);
  } catch (err) {
    return ammo.throw(err);
    // ammo.throw(err, { useLlm: false });
    // ammo.throw(502, 'Known upstream issue', { useLlm: false });
  }
});

export default target;
`,

  "full-app": `// index.js - Production-style app with middleware, rate limit, docs
import Tejas from 'te.js';

const app = new Tejas();

app.midair((ammo, next) => {
  console.log(\`[\${new Date().toISOString()}] \${ammo.method} \${ammo.path}\`);
  next();
});

app.withRateLimit({
  maxRequests: 60,
  timeWindowSeconds: 60,
});

app.serveDocs({ specPath: './openapi.json' });

app.takeoff();
`,

  "express-migration": `// Use Express middleware via midair (3-arg (req, res, next) is auto-detected)
import Tejas from 'te.js';
import cors from 'cors';
import helmet from 'helmet';

const app = new Tejas();

app.midair(cors());
app.midair(helmet());

app.takeoff();
`,

  "auto-docs-setup": `// 1. Generate OpenAPI spec (interactive or CI)
//    npx tejas generate:docs
//    npx tejas generate:docs --ci

// 2. Serve docs in app - index.js
import Tejas from 'te.js';

const app = new Tejas();

app.serveDocs({
  specPath: './openapi.json',
  scalarConfig: { theme: 'purple', layout: 'modern' },
});

// 3. Protect docs in production (optional)
//    Set DOCS_PASSWORD env var, or pass it explicitly:
//    app.serveDocs({ specPath: './openapi.json', password: process.env.DOCS_PASSWORD });

app.takeoff();
`,

  "cli-usage": `# CLI usage examples

# Start server (entry: CLI arg > tejas.config.json entry > package.json main > index.js)
npx tejas fly
npx tejas fly app.js

# Generate OpenAPI docs (interactive)
npx tejas generate:docs

# Generate OpenAPI docs in CI (reads tejas.config.json + env)
npx tejas generate:docs --ci

# Pre-push hook: generate docs when pushing to main (add to package.json)
"husky": { "hooks": { "pre-push": "tejas docs:on-push" } }
`,
};

export const EXAMPLE_PATTERNS = Object.keys(examples) as string[];
