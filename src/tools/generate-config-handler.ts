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
    llm?: { baseURL?: string; apiKey?: string; model?: string };
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
  if (args.aiConfig) obj.ai = args.aiConfig;

  const json = JSON.stringify(obj, null, 2);
  return {
    content: [{ type: "text", text: json }],
  };
}
