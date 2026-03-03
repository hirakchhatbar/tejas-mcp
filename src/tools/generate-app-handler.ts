type GenerateAppEntryArgs = {
  port?: number;
  withRateLimit: boolean;
  withRedis: boolean;
  withMongo: boolean;
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

  if (args.withRedis) {
    lines.push(
      "app.withRedis({ url: process.env.REDIS_URL || 'redis://localhost:6379' });",
      ""
    );
  }

  if (args.withMongo) {
    lines.push(
      "app.withMongo({ uri: process.env.MONGO_URI || 'mongodb://localhost:27017/app' });",
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

  const takeoffOpts: string[] = [];
  if (args.withRedis) takeoffOpts.push("withRedis: { url: process.env.REDIS_URL }");
  if (args.withMongo) takeoffOpts.push("withMongo: { uri: process.env.MONGO_URI }");
  const takeoffArg =
    takeoffOpts.length > 0 ? `{ ${takeoffOpts.join(", ")} }` : "{}";

  lines.push(`app.takeoff(${takeoffArg});`);

  return {
    content: [{ type: "text", text: lines.join("\n") }],
  };
}
