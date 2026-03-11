type LlmConfig = {
  baseURL?: string;
  apiKey?: string;
  model?: string;
};

type ErrorsLlmConfig = {
  enabled?: boolean;
  baseURL?: string;
  apiKey?: string;
  model?: string;
  messageType?: "endUser" | "developer";
  mode?: "sync" | "async";
  timeout?: number;
  channel?: "console" | "log" | "both";
  logFile?: string;
  rateLimit?: number;
  cache?: boolean;
  cacheTTL?: number;
};

type GenerateConfigArgs = {
  port?: number;
  logHttpRequests?: boolean;
  logExceptions?: boolean;
  dirTargets?: string;
  bodyMaxSize?: number;
  docsConfig?: {
    output?: string;
    title?: string;
    version?: string;
    level?: number;
    llm?: LlmConfig;
  };
  errorsConfig?: {
    llm?: ErrorsLlmConfig;
  };
  aiConfig?: { provider?: string; features?: string[] };
};

export async function generateConfig(
  args: GenerateConfigArgs
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const obj: Record<string, unknown> = {};

  if (args.port != null) obj.port = args.port;

  const log: Record<string, boolean> = {};
  if (args.logHttpRequests != null) log.http_requests = args.logHttpRequests;
  if (args.logExceptions != null) log.exceptions = args.logExceptions;
  if (Object.keys(log).length) obj.log = log;

  const dir: Record<string, string> = {};
  if (args.dirTargets != null) dir.targets = args.dirTargets;
  if (Object.keys(dir).length) obj.dir = dir;

  const body: Record<string, number> = {};
  if (args.bodyMaxSize != null) body.max_size = args.bodyMaxSize;
  if (Object.keys(body).length) obj.body = body;

  if (args.docsConfig) obj.docs = args.docsConfig;

  if (args.errorsConfig?.llm) {
    const llm = args.errorsConfig.llm;
    const llmObj: Record<string, unknown> = {};
    if (llm.enabled != null) llmObj.enabled = llm.enabled;
    if (llm.baseURL != null) llmObj.baseURL = llm.baseURL;
    if (llm.apiKey != null) llmObj.apiKey = llm.apiKey;
    if (llm.model != null) llmObj.model = llm.model;
    if (llm.messageType != null) llmObj.messageType = llm.messageType;
    if (llm.mode != null) llmObj.mode = llm.mode;
    if (llm.timeout != null) llmObj.timeout = llm.timeout;
    if (llm.channel != null) llmObj.channel = llm.channel;
    if (llm.logFile != null) llmObj.logFile = llm.logFile;
    if (llm.rateLimit != null) llmObj.rateLimit = llm.rateLimit;
    if (llm.cache != null) llmObj.cache = llm.cache;
    if (llm.cacheTTL != null) llmObj.cacheTTL = llm.cacheTTL;
    if (Object.keys(llmObj).length) obj.errors = { llm: llmObj };
  }

  if (args.aiConfig) obj.ai = args.aiConfig;

  const json = JSON.stringify(obj, null, 2);
  return {
    content: [{ type: "text", text: json }],
  };
}
