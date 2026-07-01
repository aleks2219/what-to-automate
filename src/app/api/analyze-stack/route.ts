import { NextRequest, NextResponse } from 'next/server';
import { groqChatCompletion } from '@/lib/llm';
import { TOOLS } from '@/lib/tools-db';
import { filterToolsForQuery, buildFilteredCatalog } from '@/lib/tool-filter';

// Company-wide AI tool stack analyzer.
// Takes a company description and recommends tools across all departments.
// Uses the same 256-tool database as the matcher.

interface StackRequest {
  companyDescription: string;
  industry?: string;
  companySize?: string;
  currentTools?: string;
  companyWebsite?: string;
}

export interface DepartmentStack {
  department: string;
  functions: string[];
  recommendedTools: Array<{
    toolId: string;
    toolName: string;
    why: string;
    pricing: string;
    effort: string;
  }>;
  monthlyCost: string;
  priority: 'high' | 'medium' | 'low';
}

export interface StackAnalysis {
  departments: DepartmentStack[];
  totalMonthlyCost: string;
  consolidationOpportunities: string[];
  gaps: string[];
  phasedPlan: string[];
  summary: string;
  confidence: 'high' | 'medium' | 'low';
}

const SYSTEM_PROMPT = `You are an AI tool stack consultant for companies. You've advised 200+ companies on which AI tools to adopt across every department. You know the 256+ tool database inside and out.

The user describes their company. Your job is to recommend a COMPLETE AI tool stack organized by department.

You have access to a TOOL CATALOG with 256+ AI tools. Each tool has: category, capabilities, pricing, best-for, what-you-do, effort level, and industry fit.

ANALYSIS FRAMEWORK:

1. DEPARTMENT IDENTIFICATION: Based on the company description, identify which departments exist and what functions each performs. Common departments: Engineering, Sales, Marketing, Customer Support, Finance/Ops, HR/People, Design/Product, Legal, Operations.

2. TOOL RECOMMENDATIONS PER DEPARTMENT: For each department, recommend 2-4 specific tools from the catalog. For each tool:
   - Tool name + ID from catalog
   - Why it fits this department's needs
   - Monthly pricing
   - Effort to implement (upload-and-go / configure / build-visually / write-code)
   Only recommend tools that exist in the catalog. Never invent tools.

3. COST ESTIMATION: Calculate total monthly cost across all recommended tools. Include free tiers where applicable.

4. CONSOLIDATION: If the user already has tools, identify overlaps and consolidation opportunities. "You have both Slack and Teams. Pick one. Save $X/month."

5. GAPS: Identify capabilities they're missing that no tool in their current stack covers.

6. PHASED PLAN: Recommend rollout order (which tools to adopt first, second, third). Prioritize by impact/effort ratio.

OUTPUT: Valid JSON with this schema:
{
  "departments": [
    {
      "department": "string — department name",
      "functions": ["array of functions this department performs"],
      "recommendedTools": [
        {
          "toolId": "string — must be an ID from the catalog",
          "toolName": "string — tool name",
          "why": "string — 1 sentence why this fits this department",
          "pricing": "string — monthly cost",
          "effort": "string — effort level"
        }
      ],
      "monthlyCost": "string — estimated monthly cost for this department's tools",
      "priority": "high | medium | low — how important is AI for this department"
    }
  ],
  "totalMonthlyCost": "string — sum across all departments",
  "consolidationOpportunities": ["array of strings — specific cost-saving opportunities"],
  "gaps": ["array of strings — capabilities missing from the stack"],
  "phasedPlan": ["array of strings — rollout phases in order"],
  "summary": "string — 2-3 sentence executive summary of the recommended stack",
  "confidence": "high | medium | low"
}

RULES:
1. Output ONLY valid JSON.
2. toolId MUST be from the catalog. Never invent IDs.
3. Recommend 2-4 tools per department. Not more, not less.
4. Include free-tier tools where they fit (many tools have free tiers).
5. If user provided currentTools, avoid recommending tools they already have.
6. Prioritize purpose-built tools (category: purpose-built) over building blocks.
7. NEVER recommend raw LLM APIs (claude-api, openai-api) as standalone tools.
8. For each department, explain WHY AI is valuable there before recommending tools.
9. totalMonthlyCost should be a realistic estimate summing all departments.
10. phasedPlan should have 3-4 phases, each with specific tools to adopt.`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as StackRequest;

    if (!body.companyDescription || body.companyDescription.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please describe your company in at least one sentence.' },
        { status: 400 }
      );
    }

    // Build context from additional fields
    const contextLines: string[] = [];
    if (body.industry) contextLines.push(`Industry: ${body.industry}`);
    if (body.companySize) contextLines.push(`Company size: ${body.companySize}`);
    if (body.currentTools) contextLines.push(`Current tools: ${body.currentTools}`);

    // Filter the 256-tool catalog to relevant tools for this company
    const filterQuery = `${body.companyDescription} ${body.industry || ''} ${body.currentTools || ''}`;
    const filteredTools = filterToolsForQuery(filterQuery, body.industry, body.currentTools);
    const filteredCatalog = buildFilteredCatalog(filteredTools);

    const systemPrompt = `${SYSTEM_PROMPT}

=== TOOL CATALOG (top ${filteredTools.length} most relevant out of ${TOOLS.length} total) ===
${filteredCatalog}`;

    const userMessage = `${contextLines.length > 0 ? `--- COMPANY CONTEXT ---\n${contextLines.join('\n')}\n\n` : ''}--- COMPANY DESCRIPTION ---
${body.companyDescription.trim()}

Analyze this company and recommend a complete AI tool stack organized by department. Use only tools from the catalog.`;

    const raw = await groqChatCompletion(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      { json: true, temperature: 0.4, maxTokens: 3000 }
    );

    if (!raw || !raw.trim()) {
      return NextResponse.json(
        { error: 'AI returned an empty response. Please try again.' },
        { status: 502 }
      );
    }

    let jsonText = raw.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    let parsed: StackAnalysis;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      console.error('Failed to parse stack analysis:', jsonText.slice(0, 500));
      return NextResponse.json(
        { error: 'AI returned malformed output. Please try again.' },
        { status: 502 }
      );
    }

    // Validate tool IDs
    const validToolIds = new Set(TOOLS.map((t) => t.id));
    if (parsed.departments) {
      for (const dept of parsed.departments) {
        if (dept.recommendedTools) {
          dept.recommendedTools = dept.recommendedTools.filter((t) => validToolIds.has(t.toolId));
        }
      }
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error('Stack analysis error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Analysis failed: ${message}` },
      { status: 500 }
    );
  }
}
