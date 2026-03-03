import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Directory containing bundled markdown docs (relative to this module). */
const DOCS_DIR = join(__dirname, "docs");

/** Topic id to filename. docs-index is the README (table of contents). */
const TOPIC_TO_FILE: Record<string, string> = {
  "docs-index": "README.md",
  "getting-started": "getting-started.md",
  configuration: "configuration.md",
  routing: "routing.md",
  ammo: "ammo.md",
  middleware: "middleware.md",
  "error-handling": "error-handling.md",
  database: "database.md",
  "rate-limiting": "rate-limiting.md",
  "file-uploads": "file-uploads.md",
  cli: "cli.md",
  "auto-docs": "auto-docs.md",
  "api-reference": "api-reference.md",
};

export const DOC_TOPICS = Object.keys(TOPIC_TO_FILE) as string[];

/**
 * Returns the full markdown content for a documentation topic.
 * @param topic - One of: docs-index, getting-started, configuration, routing, ammo, middleware, error-handling, database, rate-limiting, file-uploads, cli, auto-docs, api-reference
 */
export function getDocContent(topic: string): string {
  const filename = TOPIC_TO_FILE[topic];
  if (!filename) {
    throw new Error(`Unknown doc topic: ${topic}. Valid: ${DOC_TOPICS.join(", ")}`);
  }
  const filePath = join(DOCS_DIR, filename);
  if (!existsSync(filePath)) {
    throw new Error(`Doc file not found: ${filePath}`);
  }
  return readFileSync(filePath, "utf-8");
}

/**
 * Returns all doc topics with their content, for search indexing.
 * Keys are topic ids, values are full markdown strings.
 */
export function getAllDocs(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const topic of DOC_TOPICS) {
    try {
      out[topic] = getDocContent(topic);
    } catch {
      // skip missing
    }
  }
  return out;
}
