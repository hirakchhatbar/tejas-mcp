type Endpoint = { path: string; methods?: string[]; description?: string };
type GenerateTargetArgs = {
  name: string;
  basePath: string;
  endpoints: Endpoint[];
  withMiddleware: boolean;
  withFileUpload: boolean;
};

function handlerBody(endpoint: Endpoint): string {
  const methods = endpoint.methods && endpoint.methods.length > 0
    ? endpoint.methods.map((m) => m.toUpperCase())
    : ["GET"];
  const parts = methods.map(
    (m) => `  if (ammo.${m}) return ammo.fire({ message: '${m} ${endpoint.path}' });`
  );
  parts.push("  ammo.notAllowed();");
  return parts.join("\n");
}

export async function generateTarget(
  args: GenerateTargetArgs
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const { name, basePath, endpoints, withMiddleware, withFileUpload } = args;
  const imports: string[] = ["Target"];
  if (withMiddleware || endpoints.some((e) => e.methods?.length)) imports.push("TejError");
  if (withFileUpload) imports.push("TejFileUploader");

  const lines: string[] = [
    `import { ${imports.join(", ")} } from 'te.js';`,
    "",
    `const ${name} = new Target('${basePath}');`,
    "",
  ];

  if (withFileUpload) {
    lines.push(
      "const uploader = new TejFileUploader({",
      "  destination: 'uploads',",
      "  maxFileSize: 5 * 1024 * 1024,",
      "});",
      ""
    );
  }

  if (withMiddleware) {
    lines.push(
      `${name}.midair((ammo, next) => {`,
      "  // TODO: auth or other logic",
      "  next();",
      "});",
      ""
    );
  }

  for (const ep of endpoints) {
    const path = ep.path || "/";
    const routeMiddlewares: string[] = [];
    if (withFileUpload && ep.path?.includes("upload")) {
      routeMiddlewares.push("uploader.file('file')");
    }
    const handlerParams = routeMiddlewares.length
      ? `${routeMiddlewares.join(", ")}, (ammo)`
      : "(ammo)";
    lines.push(
      ...(ep.description ? [`// ${ep.description}`, ""] : []),
      `${name}.register('${path}', ${handlerParams} => {`,
      handlerBody(ep),
      "});",
      ""
    );
  }

  lines.push("export default " + name + ";");

  return {
    content: [{ type: "text", text: lines.join("\n") }],
  };
}
