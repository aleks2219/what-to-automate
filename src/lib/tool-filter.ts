// Shared tool filtering logic — used by both extract and match-deck routes.
// Pre-filters the 256-tool catalog to ~40 most relevant based on query keywords.
// This keeps Groq API requests under the 12K tokens-per-minute free-tier limit.

import { TOOLS, Tool } from '@/lib/tools-db';

export function filterToolsForQuery(
  query: string,
  industry?: string,
  currentTools?: string
): Tool[] {
  const queryLower = query.toLowerCase();
  const industryLower = industry?.toLowerCase() || '';
  const currentToolsLower = currentTools?.toLowerCase() || '';

  const allSearchText = `${queryLower} ${industryLower} ${currentToolsLower}`;

  const queryWords = allSearchText
    .split(/[\s,.;:!?'"/()-]+/)
    .filter((w) => w.length > 3)
    .map((w) => w.trim());

  const scored = TOOLS.map((tool) => {
    const haystack = [
      tool.name,
      tool.tagline,
      tool.bestFor,
      tool.whatYouDo,
      tool.category,
      ...tool.capabilities,
      ...tool.industryFit,
      ...(tool.aliases || []),
    ]
      .join(' ')
      .toLowerCase();

    let score = 0;
    for (const word of queryWords) {
      if (haystack.includes(word)) {
        score += 1;
      }
    }

    if (industryLower && tool.industryFit.some((i) => i.toLowerCase().includes(industryLower))) {
      score += 2;
    }

    if (currentToolsLower) {
      const toolNames = currentToolsLower.split(/[\s,]+/).filter(Boolean);
      if (
        toolNames.some(
          (name) =>
            tool.name.toLowerCase().includes(name) ||
            name.includes(tool.name.toLowerCase())
        )
      ) {
        score -= 5;
      }
    }

    return { tool, score };
  });

  const top = scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 40)
    .map((s) => s.tool);

  if (top.length < 20) {
    const seenCategories = new Set(top.map((t) => t.category));
    for (const tool of TOOLS) {
      if (top.length >= 40) break;
      if (!top.includes(tool) && !seenCategories.has(tool.category)) {
        top.push(tool);
        seenCategories.add(tool.category);
      }
    }
  }

  return top;
}

export function buildFilteredCatalog(tools: Tool[]): string {
  return tools
    .map(
      (t) =>
        `- id: "${t.id}" | ${t.name} | category: ${t.category} | type: ${t.toolType} | effort: ${t.userEffort} | capabilities: ${t.capabilities.join(', ')} | best for: ${t.bestFor} | pricing: ${t.startingPrice}`
    )
    .join('\n');
}
