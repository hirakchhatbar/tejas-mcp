type GenerateAppEntryArgs = {
  port?: number;
  withRateLimit: boolean;
  withDocs: boolean;
  withAI: boolean;
  globalMiddleware: string[];
};

export async function generateAppEntry(
  args: GenerateAppEntryArgs
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const lines: string[] = ["import Tejas from 'te.js';", "", "const app = new Tejas();", ""];

  if (args.globalMiddleware.length > 0) {
    for (const m of args.globalMiddleware) {
      lines.push(`app.midair(/* ${m} */ (ammo, next) => { next(); });`);
    }
    lines.push("");
  }

  if (args.withRateLimit) {
    lines.push(
      "app.withRateLimit({",
      "  maxRequests: 60,",
      "  timeWindowSeconds: 60,",
      "});",
      ""
    );
  }

  if (args.withDocs) {
    lines.push("app.serveDocs({ specPath: './openapi.json' });", "");
  }

  if (args.withAI) {
    lines.push(
      "app.withAI({",
      "  provider: process.env.AI_PROVIDER || 'openai',",
      "  apiKey: process.env.OPENAI_API_KEY,",
      "  features: [],",
      "});",
      ""
    );
  }

  lines.push("app.takeoff();");

  return {
    content: [{ type: "text", text: lines.join("\n") }],
  };
}
