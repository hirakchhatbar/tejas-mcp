import { getDocContent, DOC_TOPICS } from "../data/load-docs.js";

export async function getDocumentation(
  topic: string
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  if (!DOC_TOPICS.includes(topic)) {
    return {
      content: [
        {
          type: "text",
          text: `Unknown topic: "${topic}". Valid topics: ${DOC_TOPICS.join(", ")}`,
        },
      ],
    };
  }
  const markdown = getDocContent(topic);
  return {
    content: [{ type: "text", text: markdown }],
  };
}
