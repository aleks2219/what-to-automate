import { NextRequest, NextResponse } from 'next/server';
import { groqChatCompletion } from '@/lib/llm';
import { TOOLS, Tool, Capability } from '@/lib/tools-db';

// Match deck endpoint — generates a personalized Tinder-style deck of tools.
// Takes: industry, whatToAutomate (one sentence), currentTools (optional).
// Returns: 5-8 tools with match scores (0-100%) + personalized rationale.

interface MatchDeckRequest {
  industry?: string;
  whatToAutomate: string;
  currentTools?: string;
}

export interface ToolMatch {
  toolId: string;
  matchScore: number; // 0-100
  whyItMatches: string; // 1-2 sentences personalized to user
  highlight: string; // short tagline for the card front (e.g., "Best for invoice automation")
}

export interface MatchDeckResponse {
  matches: ToolMatch[];
  totalToolsConsidered: number;
  deckSummary: string; // 1 sentence summary of the deck
}

// Build catalog for AI — include capabilities so AI can match by capability
const TOOL_CATALOG = TOOLS.map(
  (t) =>
    `- id: "${t.id}" | ${t.name} | category: ${t.category} | type: ${t.toolType} | effort: ${t.userEffort} | capabilities: ${t.capabilities.join(', ')} | best for: ${t.bestFor} | pricing: ${t.startingPrice}`
).join('\n');

const SYSTEM_PROMPT = `You are an expert AI tool discovery engine. Your job is to help users discover the AI tools that best fit their workflow — like a smart friend who knows every AI product on the market.

Given a user's industry, what they want to do, and their current tools, pick the 5-8 BEST matching AI tools from the catalog and rank them by match score.

Your output MUST be valid JSON with this exact schema:

{
  "matches": [
    {
      "toolId": "string — must be an ID from the catalog below",
      "matchScore": "number 0-100 — how well this AI tool fits the user's needs. 90+ = perfect fit, 70-89 = strong fit, 50-69 = decent fit, <50 = don't include",
      "whyItMatches": "string — 1-2 sentences personalized to the user. Reference their specific use case, industry, or current tools. e.g., 'Since you're in finance and want to automate invoice processing, Lido handles this with AI out of the box — no setup required.'",
      "highlight": "string — 6-10 word tagline for the card front. e.g., 'Best AI for invoice automation', 'Cheapest at your volume', 'Easiest to set up today'"
    }
  ],
  "totalToolsConsidered": "number — total tools in catalog (always ${TOOLS.length})",
  "deckSummary": "string — 1 sentence summarizing the deck, e.g., '5 AI tools matched your finance automation needs, sorted by fit.'"
}

RULES:
1. Output ONLY valid JSON. No markdown fences, no commentary.
2. Pick 5-8 tools. Never fewer than 5, never more than 8.
3. Only include tools with matchScore >= 50. If fewer than 5 tools meet this threshold, lower the bar to 40.
4. Sort matches by matchScore descending (highest first).
5. toolId MUST be from the catalog. Never invent IDs.
6. PRIORITIZE AI-NATIVE TOOLS. The catalog has 18 AI-focused categories (ai-coding, ai-writing, ai-image-video, ai-voice-audio, ai-chatbot, ai-search, ai-data, ai-sales, ai-support, ai-hr, ai-legal, ai-finance, ai-design, ai-productivity, document-ai, browser-automation, workflow-ai, llm-api). Bias toward these over generic SaaS categories (rpa, custom, purpose-built).
7. NEVER recommend raw LLM APIs (claude-api, openai-api, gemini-api, groq, cohere, together-ai, replicate, mistral) unless the user explicitly says they want to build with code. Even then, only as a secondary pick.
8. PREFER purpose-built AI solutions (toolType: 'solution', userEffort: 'upload-and-go' or 'configure') over building blocks.
9. If user provided currentTools, AVOID recommending tools they already have. Instead, find complementary AI tools or alternatives.
10. whyItMatches MUST be personalized AND emphasize the AI capability. Don't say "This tool is great for automation." Say "Since you mentioned wanting to automate lead routing in your SaaS company, Clay uses AI to enrich 75+ data sources in real-time..."
11. highlight should be a punchy tagline that captures what makes this AI tool special. Think dating app bio, not product page.
12. For diversity, try to include tools from at least 3 different categories when possible (e.g., don't return 5 AI writing tools — mix writing + chatbot + productivity).

=== TOOL CATALOG ===
${TOOL_CATALOG}`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as MatchDeckRequest;

    if (!body.whatToAutomate || body.whatToAutomate.trim().length < 5) {
      return NextResponse.json(
        { error: 'Please tell us what you want to automate (min 5 characters).' },
        { status: 400 }
      );
    }

    if (body.whatToAutomate.length > 2000) {
      return NextResponse.json(
        { error: 'Description too long. Please limit to 2,000 characters.' },
        { status: 400 }
      );
    }

    const industryLine = body.industry
      ? `Industry: ${body.industry}`
      : 'Industry: (not specified — infer from context)';

    const currentToolsLine = body.currentTools && body.currentTools.trim().length > 0
      ? `Current tools: ${body.currentTools.trim()}`
      : 'Current tools: (none provided)';

    const userMessage = `${industryLine}
${currentToolsLine}

What they want to do:
${body.whatToAutomate.trim()}

Pick the 5-8 best matching AI tools from the catalog. Personalize whyItMatches to their specific use case, emphasizing the AI capability that fits.`;

    const raw = await groqChatCompletion(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      { json: true, temperature: 0.4, maxTokens: 2500 }
    );

    if (!raw || !raw.trim()) {
      return NextResponse.json(
        { error: 'AI returned an empty response. Please try again.' },
        { status: 502 }
      );
    }

    // Strip markdown fences if present
    let jsonText = raw.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    let parsed: MatchDeckResponse;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      console.error('Failed to parse match deck response:', jsonText.slice(0, 500));
      return NextResponse.json(
        {
          error: 'AI returned malformed output. Please try again with clearer input.',
          raw: jsonText.slice(0, 500),
        },
        { status: 502 }
      );
    }

    // Validate tool IDs against catalog
    const validToolIds = new Set(TOOLS.map((t) => t.id));
    parsed.matches = (parsed.matches || []).filter((m) => validToolIds.has(m.toolId));

    // Clamp match scores
    parsed.matches = parsed.matches.map((m) => ({
      ...m,
      matchScore: Math.max(0, Math.min(100, Math.round(m.matchScore))),
    }));

    // Sort by match score descending
    parsed.matches.sort((a, b) => b.matchScore - a.matchScore);

    // Ensure we have at least 3 matches; if not, return error
    if (parsed.matches.length < 3) {
      return NextResponse.json(
        {
          error: 'Could not find enough matching tools. Try a more specific description.',
        },
        { status: 422 }
      );
    }

    parsed.totalToolsConsidered = TOOLS.length;

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error('Match deck error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Match deck failed: ${message}` },
      { status: 500 }
    );
  }
}

// Helper for client to fetch full tool details by ID
export function getMatchedTools(matchIds: string[]): Array<ToolMatch & { tool: Tool | undefined }> {
  return matchIds.map((id) => {
    const match: ToolMatch = {
      toolId: id,
      matchScore: 0,
      whyItMatches: '',
      highlight: '',
    };
    return { ...match, tool: TOOLS.find((t) => t.id === id) };
  });
}
