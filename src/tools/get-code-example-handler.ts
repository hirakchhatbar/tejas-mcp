import { examples, EXAMPLE_PATTERNS } from "../data/examples.js";

export async function getCodeExample(
  pattern: string
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  if (!EXAMPLE_PATTERNS.includes(pattern)) {
    return {
      content: [
        {
          type: "text",
          text: `Unknown pattern: "${pattern}". Valid: ${EXAMPLE_PATTERNS.join(", ")}`,
        },
      ],
    };
  }
  const code = examples[pattern];
  return {
    content: [{ type: "text", text: code }],
  };
}
