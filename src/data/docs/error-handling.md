# Error Handling

Tejas keeps your application from crashing on unhandled errors. You don't log the error and send the response separately — **`ammo.throw()` is the single mechanism**: it sends the appropriate HTTP response (logging is optional via `log.exceptions`). Whether you call `ammo.throw()` or the framework calls it when it catches an error, the same behaviour applies. When LLM-inferred errors are enabled, call `ammo.throw()` with no arguments and an LLM infers status and message from code context; explicit code and message always override.

## Zero-Config Error Handling

**One of Tejas's most powerful features is that you don't need to write any error handling code** — the framework catches all errors automatically at multiple levels.

### How It Works

Tejas wraps all middleware and route handlers with built-in error catching. Any error thrown in your code is automatically:

1. **Caught** by the framework's error handler
2. **Logged** (if exception logging is enabled)
3. **Converted** to an appropriate HTTP error response

This means your application **never crashes** from unhandled exceptions, and clients always receive proper error responses.

### Write Clean Code Without Try-Catch

```javascript
// ✅ No try-catch needed — Tejas handles errors automatically
target.register('/users/:id', async (ammo) => {
  const user = await database.findUser(ammo.payload.id);  // If this throws, Tejas catches it
  const posts = await database.getUserPosts(user.id);      // Same here
  ammo.fire({ user, posts });
});
```

Compare this to traditional frameworks where you'd need:

```javascript
// ❌ Traditional approach requires manual error handling
app.get('/users/:id', async (req, res) => {
  try {
    const user = await database.findUser(req.params.id);
    const posts = await database.getUserPosts(user.id);
    res.json({ user, posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
```

### Automatic Error Responses

When an unhandled error occurs, Tejas automatically sends a `500 Internal Server Error` response. For intentional errors using `TejError` or `ammo.throw()` with explicit code/message, the appropriate status code is used. When [LLM-inferred errors](#llm-inferred-errors) are enabled and you call `ammo.throw()` with no args, the LLM infers from code context.

### Enable Error Logging

To see caught exceptions in your logs, enable exception logging:

```javascript
const app = new Tejas({
  log: {
    exceptions: true  // Log all caught exceptions
  }
});
```

Or via environment variable:
```bash
LOG_EXCEPTIONS=true
```

---

## LLM-Inferred Errors

When **`errors.llm.enabled`** is true and you call `ammo.throw()` without an explicit status code or message, Tejas uses an LLM to infer status and message from **code context** — the source code surrounding the call (with line numbers) and all upstream (callers) and downstream (code that would run next) context. You do not pass an error object; the LLM infers from control flow and intent.

- **No error object required:** Call `ammo.throw()` with no arguments (or only options). The framework captures the code around the call site and upstream stack and sends it to the LLM.
- **Opt-in:** Enable via config: `errors.llm.enabled: true` and configure `errors.llm` (baseURL, apiKey, model), or call **`app.withLLMErrors()`** / **`app.withLLMErrors({ baseURL, apiKey, model, messageType })`** before `takeoff()`. See [Configuration](./configuration.md).
- **Framework-caught errors:** When the framework catches an unhandled error, it uses the same `ammo.throw(err)` — so the same `errors.llm` config applies. No separate "log then send response"; one mechanism handles everything.
- **Message type:** Set `errors.llm.messageType` to `"endUser"` (default) or `"developer"` for end-user-friendly vs developer-friendly messages. Override per call (see Per-call overrides below).
- **Override:** Whenever you pass a status code or message (e.g. `ammo.throw(404, 'User not found')`), that value is used; the LLM is not called.
- **Non-production:** In non-production, the LLM can also provide developer insight (e.g. bug vs environment, suggested fix), attached to the response as `_dev` or in logs only — never in production.

### Per-call overrides

For any LLM-eligible `ammo.throw()` call, pass an options object as the last argument:

- **`useLlm`** (boolean): Set to `false` to skip the LLM for this call (default 500). Set to `true` to use the LLM (default when eligible).
- **`messageType`** (`"endUser"` | `"developer"`): Override the configured default for this call only.

```javascript
ammo.throw({ useLlm: false });
ammo.throw({ messageType: 'developer' });
ammo.throw(caughtErr, { useLlm: false });
```

### Async mode

By default (`errors.llm.mode: 'sync'`), `ammo.throw()` blocks the HTTP response until the LLM returns. Set `mode` to `'async'` to respond immediately with a generic `500` and run the LLM in the background, dispatching the result to the configured channel.

```bash
ERRORS_LLM_MODE=async
ERRORS_LLM_CHANNEL=both   # console | log | both
```

In async mode, `devInsight` is always included in channel output (even in production) since it never reaches the HTTP response.

### Output channels (async mode)

| Channel | Output |
|---------|--------|
| `"console"` (default) | Pretty-printed colored block in the terminal with timestamp, method+path, inferred status, message, dev insight. Shows `[CACHED]` / `[RATE LIMITED]` flags. |
| `"log"` | JSONL file (one JSON object per line). Path from `errors.llm.logFile` (default `./errors.llm.log`). All fields: timestamp, method, path, statusCode, message, devInsight, error, codeContext, cached, rateLimited. |
| `"both"` | Both console and log file. |

### Rate limiting

Set `errors.llm.rateLimit` (default `10`) to cap LLM calls per minute across all requests.

- **Sync mode**: responds `500` when limit is exceeded.
- **Async mode**: channel still receives a dispatch with `rateLimited: true` so the occurrence is recorded.
- Cached results do **not** count against the rate limit.

```bash
ERRORS_LLM_RATE_LIMIT=20
```

### Error caching

By default (`errors.llm.cache: true`), results are cached by throw site (file + line) and error message. Repeated errors reuse the cached result without calling the LLM again.

```bash
ERRORS_LLM_CACHE=true
ERRORS_LLM_CACHE_TTL=3600000   # 1 hour (default)
```

To only enhance new (unique) errors, keep caching enabled with a long TTL.

---

## TejError Class

Use `TejError` for throwing HTTP errors with status codes:

```javascript
import { TejError } from 'te.js';

// Throw a 404 error
throw new TejError(404, 'User not found');

// Throw a 400 error
throw new TejError(400, 'Invalid email format');

// Throw a 500 error
throw new TejError(500, 'Database connection failed');
```

## Error Response

When an error is thrown, Tejas automatically sends the appropriate HTTP response:

```javascript
throw new TejError(404, 'Resource not found');
```

**Response:**
```
HTTP/1.1 404 Not Found
Content-Type: text/plain

Resource not found
```

## Convenience Methods

`Ammo` provides shortcut methods for common errors:

```javascript
// 404 Not Found
ammo.notFound();

// 405 Method Not Allowed
ammo.notAllowed();

// 401 Unauthorized
ammo.unauthorized();
```

## Using ammo.throw()

For more control, use `ammo.throw()`. When **errors.llm.enabled**, call with **no arguments** and the LLM infers from code context (surrounding + upstream/downstream); you do not pass an error object. Explicit code/message always override.

```javascript
// When errors.llm.enabled: no args — LLM infers from code context
ammo.throw();

// Optional: pass caught error; LLM uses error stack for code context
ammo.throw(caughtErr);

// Explicit: status code and/or message (always override)
ammo.throw(404);
ammo.throw(404, 'User not found');
ammo.throw(new TejError(400, 'Bad request'));

// Per-call options
ammo.throw({ useLlm: false });
ammo.throw({ messageType: 'developer' });
```

## Error Handling in Routes

### Basic Pattern

```javascript
target.register('/users/:id', async (ammo) => {
  const { id } = ammo.payload;
  
  const user = await findUser(id);
  
  if (!user) {
    throw new TejError(404, 'User not found');
  }
  
  ammo.fire(user);
});
```

### Try-Catch Pattern

```javascript
target.register('/data', async (ammo) => {
  try {
    const data = await riskyOperation();
    ammo.fire(data);
  } catch (error) {
    if (error.code === 'TIMEOUT') {
      throw new TejError(504, 'Gateway timeout');
    }
    throw new TejError(500, 'Internal server error');
  }
});
```

## Global Error Handling

Errors are automatically caught by Tejas's handler. Enable logging:

```javascript
const app = new Tejas({
  log: {
    exceptions: true // Log all exceptions
  }
});
```

## Custom Error Middleware

Create middleware to customize error handling:

```javascript
// middleware/error-handler.js
export const errorHandler = (ammo, next) => {
  const originalThrow = ammo.throw.bind(ammo);
  
  ammo.throw = (...args) => {
    // Log errors
    console.error('Error:', args);
    
    // Send to error tracking service
    errorTracker.capture(args[0]);
    
    // Call original throw
    originalThrow(...args);
  };
  
  next();
};

// Apply globally
app.midair(errorHandler);
```

## Structured Error Responses

For APIs, return structured error objects:

```javascript
// middleware/api-errors.js
export const apiErrorHandler = (ammo, next) => {
  const originalThrow = ammo.throw.bind(ammo);
  
  ammo.throw = (statusOrError, message) => {
    let status = 500;
    let errorMessage = 'Internal Server Error';
    let errorCode = 'INTERNAL_ERROR';
    
    if (typeof statusOrError === 'number') {
      status = statusOrError;
      errorMessage = message || getDefaultMessage(status);
      errorCode = getErrorCode(status);
    } else if (statusOrError instanceof TejError) {
      status = statusOrError.code;
      errorMessage = statusOrError.message;
      errorCode = getErrorCode(status);
    }
    
    ammo.fire(status, {
      error: {
        code: errorCode,
        message: errorMessage,
        status
      }
    });
  };
  
  next();
};

function getDefaultMessage(status) {
  const messages = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    405: 'Method Not Allowed',
    429: 'Too Many Requests',
    500: 'Internal Server Error'
  };
  return messages[status] || 'Unknown Error';
}

function getErrorCode(status) {
  const codes = {
    400: 'BAD_REQUEST',
    401: 'UNAUTHORIZED',
    403: 'FORBIDDEN',
    404: 'NOT_FOUND',
    405: 'METHOD_NOT_ALLOWED',
    429: 'RATE_LIMITED',
    500: 'INTERNAL_ERROR'
  };
  return codes[status] || 'UNKNOWN_ERROR';
}
```

**Response:**
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "User not found",
    "status": 404
  }
}
```

## Validation Errors

For input validation, return detailed errors:

```javascript
target.register('/users', (ammo) => {
  if (!ammo.POST) return ammo.notAllowed();
  
  const { name, email, age } = ammo.payload;
  const errors = [];
  
  if (!name) errors.push({ field: 'name', message: 'Name is required' });
  if (!email) errors.push({ field: 'email', message: 'Email is required' });
  if (email && !isValidEmail(email)) {
    errors.push({ field: 'email', message: 'Invalid email format' });
  }
  if (age && (isNaN(age) || age < 0)) {
    errors.push({ field: 'age', message: 'Age must be a positive number' });
  }
  
  if (errors.length > 0) {
    return ammo.fire(400, {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors
      }
    });
  }
  
  // Process valid data...
});
```

## Async Error Handling

Tejas automatically catches errors in **both sync and async handlers** — including Promise rejections:

```javascript
// ✅ No try-catch needed — errors are caught automatically
target.register('/async', async (ammo) => {
  const data = await fetchData(); // If this throws, Tejas catches it
  ammo.fire(data);
});

// ✅ Multiple await calls? Still no try-catch needed
target.register('/complex', async (ammo) => {
  const user = await getUser(ammo.payload.id);
  const profile = await getProfile(user.profileId);
  const settings = await getSettings(user.id);
  ammo.fire({ user, profile, settings });
});

// 🔧 Use try-catch ONLY when you need custom error handling
target.register('/async-custom', async (ammo) => {
  try {
    const data = await fetchData();
    ammo.fire(data);
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      throw new TejError(503, 'Service temporarily unavailable');
    }
    throw error; // Re-throw unknown errors (Tejas will still catch it)
  }
});
```

### When You Still Might Want Try-Catch

While Tejas catches all errors automatically, you may want try-catch for:

1. **Custom error mapping** — Convert database errors to user-friendly messages
2. **Retry logic** — Attempt an operation multiple times before failing
3. **Cleanup operations** — Release resources even on failure
4. **Partial success** — Continue processing after non-critical failures

## BodyParserError

`BodyParserError` is a subclass of `TejError` thrown automatically during request body parsing. You do not need to handle these yourself — they are caught by the framework and converted to appropriate HTTP responses.

| Status | Condition |
|--------|-----------|
| **400** | Malformed JSON, invalid URL-encoded data, or corrupted multipart form data |
| **408** | Body parsing timed out (exceeds `body.timeout`, default 30 seconds) |
| **413** | Request body exceeds `body.max_size` (default 10 MB) |
| **415** | Unsupported content type (not JSON, URL-encoded, or multipart) |

These limits are configured via [Configuration](./configuration.md) (`body.max_size`, `body.timeout`).

Supported content types:
- `application/json`
- `application/x-www-form-urlencoded`
- `multipart/form-data`

## Error Flow

When any error occurs in your handler or middleware, this is what happens internally:

1. The framework's `executeChain()` catches the error
2. If `LOG_EXCEPTIONS` is enabled, the error is logged
3. The error is passed to `ammo.throw()`:
   - **TejError** — uses the error's `code` and `message` directly
   - **When errors.llm.enabled** and no explicit code/message — LLM infers from code context (surrounding + upstream/downstream); optional error passed as secondary signal
   - **Standard Error** (no LLM) — returns 500 with the error message
   - **Anything else** — returns 500 with a string representation
4. `ammo.throw()` calls `ammo.fire(statusCode, message)` to send the HTTP response

Once a response has been sent (`res.headersSent` is true), no further middleware or handlers execute.

## Error Codes Reference

| Status | Name | When to Use |
|--------|------|-------------|
| 400 | Bad Request | Invalid input, malformed request |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource doesn't exist |
| 405 | Method Not Allowed | HTTP method not supported |
| 409 | Conflict | Resource conflict (duplicate) |
| 413 | Payload Too Large | Request body too large |
| 422 | Unprocessable Entity | Valid syntax but semantic errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server errors |
| 502 | Bad Gateway | Upstream server error |
| 503 | Service Unavailable | Server temporarily unavailable |
| 504 | Gateway Timeout | Upstream server timeout |

## Best Practices

1. **Use appropriate status codes** — Don't return 500 for client errors
2. **Provide useful messages** — Help developers debug issues
3. **Don't expose internals** — Hide stack traces in production
4. **Log errors** — Enable exception logging for debugging
5. **Be consistent** — Use the same error format throughout your API
6. **Validate early** — Check input before processing
7. **Use TejError** — For HTTP-specific errors with status codes

