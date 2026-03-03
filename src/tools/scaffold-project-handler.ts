type ScaffoldProjectArgs = { name: string; features: string[] };

export async function scaffoldProject(
  args: ScaffoldProjectArgs
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const { name, features } = args;
  const hasRateLimit = features.includes("rate-limiting");
  const hasRedis = features.includes("redis");
  const hasMongo = features.includes("mongodb");
  const hasFileUploads = features.includes("file-uploads");
  const hasAutoDocs = features.includes("auto-docs");
  const hasAI = features.includes("ai");

  const lines: string[] = [
    `# Project: ${name}`,
    "",
    "## Structure",
    "",
    "```",
    `${name}/`,
    "├── index.js          # App entry",
    "├── tejas.config.json",
    "├── package.json",
    "└── targets/",
    "    └── hello.target.js",
    "```",
    "",
    "## package.json",
    "",
    "```json",
    JSON.stringify(
      {
        name,
        type: "module",
        main: "index.js",
        scripts: { start: "node index.js", dev: "npx tejas fly" },
        dependencies: { "te.js": "latest" },
      },
      null,
      2
    ),
    "```",
    "",
    "## index.js",
    "",
    "```javascript",
    "import Tejas from 'te.js';",
    "",
    "const app = new Tejas();",
  ];

  if (hasRateLimit) lines.push("app.withRateLimit({ maxRequests: 60, timeWindowSeconds: 60 });");
  if (hasRedis) lines.push("app.withRedis({ url: process.env.REDIS_URL });");
  if (hasMongo) lines.push("app.withMongo({ uri: process.env.MONGO_URI });");
  if (hasAutoDocs) lines.push("app.serveDocs({ specPath: './openapi.json' });");
  if (hasAI) lines.push("app.withAI({ provider: 'openai', apiKey: process.env.OPENAI_API_KEY, features: [] });");

  lines.push(
    "",
    `app.takeoff(${
      hasRedis || hasMongo
        ? `{ ${[hasRedis && "withRedis: { url: process.env.REDIS_URL }", hasMongo && "withMongo: { uri: process.env.MONGO_URI }"].filter(Boolean).join(", ")} }`
        : "{}"
    });`
  );
  lines.push("```", "", "## targets/hello.target.js", "", "```javascript", "import { Target } from 'te.js';", "", "const target = new Target('/hello');", "target.register('/', (ammo) => ammo.fire({ message: 'Hello!' }));", "export default target;", "```");

  if (hasAutoDocs) {
    lines.push("", "Generate OpenAPI: `npx tejas generate:docs`");
  }

  return {
    content: [{ type: "text", text: lines.join("\n") }],
  };
}
