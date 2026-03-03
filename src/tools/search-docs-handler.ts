import { getAllDocs } from "../data/load-docs.js";

interface Match {
  topic: string;
  heading: string;
  content: string;
}

function splitSections(markdown: string): Array<{ heading: string; content: string }> {
  const sections: Array<{ heading: string; content: string }> = [];
  const lines = markdown.split(/\r?\n/);
  let currentHeading = "";
  let currentLines: string[] = [];

  for (const line of lines) {
    const h2 = line.match(/^##\s+(.+)$/);
    if (h2) {
      if (currentHeading || currentLines.length > 0) {
        sections.push({
          heading: currentHeading || "(intro)",
          content: currentLines.join("\n").trim(),
        });
      }
      currentHeading = h2[1]!.trim();
      currentLines = [];
    } else {
      currentLines.push(line);
    }
  }
  if (currentHeading || currentLines.length > 0) {
    sections.push({
      heading: currentHeading || "(intro)",
      content: currentLines.join("\n").trim(),
    });
  }
  return sections;
}

export async function searchDocs(
  query: string
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const q = query.trim().toLowerCase();
  if (!q) {
    return {
      content: [{ type: "text", text: "Please provide a non-empty search query." }],
    };
  }

  const allDocs = getAllDocs();
  const matches: Match[] = [];

  for (const [topic, markdown] of Object.entries(allDocs)) {
    const sections = splitSections(markdown);
    for (const { heading, content } of sections) {
      const block = `${heading}\n${content}`.toLowerCase();
      if (block.includes(q)) {
        matches.push({ topic, heading, content });
      }
    }
  }

  if (matches.length === 0) {
    return {
      content: [
        {
          type: "text",
          text: `No documentation sections matched "${query}". Try different keywords or use get_documentation to read a full topic.`,
        },
      ],
    };
  }

  const lines: string[] = [
    `Found ${matches.length} matching section(s) for "${query}":`,
    "",
  ];
  for (const { topic, heading, content } of matches) {
    const excerpt = content.slice(0, 500) + (content.length > 500 ? "…" : "");
    lines.push(`### [${topic}] ${heading}`);
    lines.push("");
    lines.push(excerpt);
    lines.push("");
    lines.push("---");
    lines.push("");
  }
  return {
    content: [{ type: "text", text: lines.join("\n").trimEnd() }],
  };
}
