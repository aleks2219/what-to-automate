import { NextRequest, NextResponse } from 'next/server';
import { groqChatCompletion } from '@/lib/llm';
import { getToolBySlug, ToolAnalysisResult } from '@/lib/tools-registry';
import { BUILD_SCENARIOS } from '@/lib/build-vs-buy-db';

// Generic AI analysis endpoint for the Tool Engine.
// Takes: { slug, input, fields: { industry, teamSize, etc. }, companyWebsite }
// Returns: ToolAnalysisResult (standardized output for all tools)

interface AnalyzeRequest {
  slug: string;
  input: string;
  fields?: Record<string, string>;
  companyWebsite?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AnalyzeRequest;

    // 1. Validate tool exists
    const tool = getToolBySlug(body.slug);
    if (!tool) {
      return NextResponse.json(
        { error: `Tool "${body.slug}" not found.` },
        { status: 404 }
      );
    }
    if (tool.status !== 'live') {
      return NextResponse.json(
        { error: `Tool "${tool.name}" is not yet live.` },
        { status: 403 }
      );
    }

    // 2. Validate input
    if (!body.input || body.input.trim().length < 5) {
      return NextResponse.json(
        { error: 'Please provide more detail (at least one sentence).' },
        { status: 400 }
      );
    }

    // 3. Build context from additional fields
    const fieldLines = Object.entries(body.fields || {})
      .filter(([, v]) => v && v.trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');

    // 4. Build the system prompt (config-driven + standardized output schema)
    const outputSchema = `Your output MUST be valid JSON with this exact schema:
{
  "verdict": "high | medium | low",
  "verdictLabel": "string — use: high="${tool.verdictLabels.high}", medium="${tool.verdictLabels.medium}", low="${tool.verdictLabels.low}",
  "score": "number 0-100",
  "summary": "string — 2-3 sentence executive summary",
  "keyInsights": ["array of 3-5 key insights — each must reference the user's specific situation"],
  "recommendations": ["array of 3-5 specific recommendations — NAME SPECIFIC TOOLS with pricing, include cost comparisons where relevant"],
  "actionItems": ["array of 2-4 things to do TODAY — must be truly actionable: specific URL to visit, specific step to take, specific person to talk to. NOT 'consider your options' — instead 'Go to clerk.com, click Get Started, create a project, add the Clerk provider to your app'"],
  "risks": ["array of 1-3 risks or caveats"],
  "confidence": "high | medium | low"
}

RULES:
1. Output ONLY valid JSON.
2. Be specific — don't say "consider options" — say "Buy HubSpot at $45/mo because..."
3. Reference the user's specific situation in every insight.
4. actionItems must be truly actionable: include specific URLs, specific steps, specific tools. Each should take under 30 minutes. Think "what would I literally do first if I were them?"
5. recommendations must NAME SPECIFIC TOOLS with real pricing. Never say "a CRM tool" — say "HubSpot (free CRM forever, $890/mo for Marketing Hub Pro)".
6. If recommending building, include estimated hours + cost.
7. Include a cost comparison (3-year TCO) in at least one recommendation when relevant.`;

    // Inject knowledge base for build-vs-buy tool
    let knowledgeBaseSection = '';
    if (tool.slug === 'build-vs-buy') {
      const kbText = BUILD_SCENARIOS.map((s) =>
        `- Pattern: "${s.pattern}" | Category: ${s.category} | Build: ${s.buildHours.min}-${s.buildHours.max} hrs ($${s.buildCost.min.toLocaleString()}-$${s.buildCost.max.toLocaleString()}) | Maintenance: ${s.ongoingMaintenanceHrs} hrs/mo | Alternatives: ${s.saasAlternatives.map(a => `${a.name} (${a.startingPrice}, ${a.url})`).join('; ')}`
      ).join('\n');
      knowledgeBaseSection = `\n\n=== BUILD VS BUY KNOWLEDGE BASE (${BUILD_SCENARIOS.length} scenarios) ===\n${kbText}\n\nIf the user's description matches any pattern above, reference those specific alternatives with pricing. If no match, use your general knowledge of SaaS tools.`;
    }

    const systemPrompt = `${tool.systemPrompt}${knowledgeBaseSection}\n\n${outputSchema}`;

    // 5. Build user message
    const userMessage = `${fieldLines ? `--- CONTEXT ---\n${fieldLines}\n\n` : ''}--- USER INPUT ---\n${body.input.trim()}\n\nAnalyze this and provide your recommendation.`;

    // 6. Call LLM
    const raw = await groqChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      { json: true, temperature: tool.temperature ?? 0.3, maxTokens: tool.slug === 'build-vs-buy' ? 3000 : 2000 }
    );

    if (!raw || !raw.trim()) {
      return NextResponse.json(
        { error: 'AI returned an empty response. Please try again.' },
        { status: 502 }
      );
    }

    // 7. Parse + validate
    let jsonText = raw.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    let parsed: ToolAnalysisResult;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return NextResponse.json(
        { error: 'AI returned malformed output. Please try again.' },
        { status: 502 }
      );
    }

    // 8. Sanitize
    const validVerdicts = ['high', 'medium', 'low'];
    if (!validVerdicts.includes(parsed.verdict)) parsed.verdict = 'medium';
    parsed.verdictLabel = tool.verdictLabels[parsed.verdict] || parsed.verdict;
    parsed.score = Math.max(0, Math.min(100, Math.round(parsed.score || 50)));
    if (!parsed.summary) parsed.summary = '';
    if (!Array.isArray(parsed.keyInsights)) parsed.keyInsights = [];
    if (!Array.isArray(parsed.recommendations)) parsed.recommendations = [];
    if (!Array.isArray(parsed.actionItems)) parsed.actionItems = [];
    if (!Array.isArray(parsed.risks)) parsed.risks = [];
    if (!validVerdicts.includes(parsed.confidence)) parsed.confidence = 'medium';

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error('Tool analysis error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Analysis failed: ${message}` },
      { status: 500 }
    );
  }
}
