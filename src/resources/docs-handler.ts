import type { ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import { getDocContent, DOC_TOPICS } from "../data/load-docs.js";

/** Extract topic from tejas://docs/{topic} */
function topicFromUri(uri: URL): string | null {
  if (uri.protocol !== "tejas:") return null;
  const path = uri.pathname.replace(/^\/+/, "");
  if (!path.startsWith("docs/")) return null;
  const topic = path.slice("docs/".length).replace(/\/.*$/, "") || "docs-index";
  return DOC_TOPICS.includes(topic) ? topic : null;
}

export async function readDocResource(uri: URL): Promise<ReadResourceResult> {
  const topic = topicFromUri(uri);
  if (!topic) {
    return {
      contents: [
        {
          uri: uri.toString(),
          mimeType: "text/plain",
          text: `Unknown resource: ${uri.toString()}. Valid: tejas://docs/{${DOC_TOPICS.join("|")}}`,
        },
      ],
    };
  }
  const text = getDocContent(topic);
  return {
    contents: [
      {
        uri: uri.toString(),
        mimeType: "text/markdown",
        text,
      },
    ],
  };
}
