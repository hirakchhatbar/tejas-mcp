import type { GetPromptResult } from "@modelcontextprotocol/sdk/types.js";
import { frameworkKnowledge } from "../data/framework-knowledge.js";

type TejasExpertArgs = { task?: string };

export async function getTejasExpertPrompt(
  args: TejasExpertArgs
): Promise<GetPromptResult> {
  let text = `You are an expert in the **Tejas (te.js)** framework — the AI-native Node.js framework. Use the following knowledge to write correct, idiomatic Tejas code and to answer questions accurately.\n\n${frameworkKnowledge}`;

  if (args.task && args.task.trim()) {
    text += `\n\n## Current task\nThe developer wants to: ${args.task.trim()}. Use the framework knowledge above to implement this correctly. Prefer using the get_documentation or get_code_example tools when you need full docs or runnable examples.`;
  }

  return {
    description: "System prompt to act as a Tejas (te.js) framework expert.",
    messages: [
      {
        role: "assistant",
        content: { type: "text", text },
      },
    ],
  };
}
