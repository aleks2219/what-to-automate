import { NextRequest, NextResponse } from 'next/server';
import {
  AutomationApproach,
  Frequency,
  Performer,
} from '@/lib/automation';
import { ExtractionResult } from '@/lib/extraction-types';
import { groqChatCompletion } from '@/lib/llm';
import { TOOLS } from '@/lib/tools-db';
import { CASE_STUDIES } from '@/lib/case-studies-db';
import { WORKFLOW_TEMPLATES } from '@/lib/workflow-templates-db';

export type { ExtractionResult };

// Build a catalog string the AI uses to reference tools, case studies, and templates
const TOOL_CATALOG = TOOLS.map(
  (t) =>
    `- id: "${t.id}" | ${t.name} | category: ${t.category} | type: ${t.toolType} | user effort: ${t.userEffort} | best for: ${t.bestFor} | what user does: ${t.whatYouDo} | pricing: ${t.startingPrice}`
).join('\n');

const CASE_STUDY_CATALOG = CASE_STUDIES.map(
  (c) => `- id: "${c.id}" | ${c.title} | industry: ${c.industry} | process: ${c.processAutomated} | tools: ${c.toolsUsed.join(', ')} | tags: ${c.tags.join(', ')}`
).join('\n');

const TEMPLATE_CATALOG = WORKFLOW_TEMPLATES.map(
  (t) => `- id: "${t.id}" | ${t.title} | category: ${t.category} | tools: ${t.toolsNeeded.join(', ')} | difficulty: ${t.difficulty}/5 | time: ${t.timeToBuild}`
).join('\n');

const SYSTEM_PROMPT = `You are a senior operations consultant and automation strategist. Your job is to take unstructured input from a user — which might be a one-sentence description, a pasted SOP doc, a Slack thread, meeting notes, or a transcribed voice memo — and extract structured data for an automation assessment tool.

Your output MUST be valid JSON with this exact schema:

{
  "processName": "string or null — short, descriptive name (e.g., 'Monthly vendor invoice reconciliation'). null if no process is mentioned.",
  "processDescription": "string or null — 1-3 sentence summary of what the process does, in plain English. null if no process is mentioned.",
  "performer": "ic | specialist | manager | vendor | mixed | null — who primarily does this work. ic = generalist team member. specialist = domain expert (finance, legal, ops). manager = people leader doing hands-on work. vendor = outsourced. mixed = multiple roles.",
  "frequency": "hourly | daily | weekly | monthly | quarterly | annually | null — how often the workflow recurs.",
  "occurrencesPerCycle": "number or null — how many times per cycle (e.g., 50 invoices per day, 4 reports per week). Use 1 if user says 'once per day' or 'weekly'.",
  "minutesPerOccurrence": "number or null — average minutes per single occurrence, including handoffs and review.",
  "hourlyCost": "number or null — loaded USD hourly cost of the performer. Specialist ~75-150, Manager ~100-200, IC ~40-80, Vendor ~80-250. null if not mentioned and not inferable.",
  "numberOfPeople": "number or null — how many people perform this across the team. Default to 1 if not mentioned.",
  "approach": "integration | ai | rpa | custom | null — recommended approach based on process characteristics. integration = SaaS-to-SaaS via Zapier/n8n/APIs. ai = LLM-based for unstructured data, judgment, extraction. rpa = UiPath/Power Automate for legacy systems without APIs. custom = purpose-built software for complex business logic. RECOMMEND based on the process, don't just default.",
  "automationPercentage": "number 10-100 or null — what % of the process can realistically be automated. 60-80% is typical for first pass. Lower for regulated / high-judgment work.",
  "criticality": "number 1-5 or null — how critical is this process to the business? 1 = operational nicety, 5 = mission-critical. Infer from language ('critical', 'compliance', 'revenue', 'customer-facing' = higher).",
  "errorTolerance": "number 1-5 or null — how tolerant is the process of errors? 1 = zero tolerance (regulated, financial), 5 = errors are fine (internal drafts, experiments). Infer from context.",
  "assumptions": ["array of strings — each assumption you made when filling in fields. Be specific: 'Assumed specialist performer because the description mentioned finance team'."],
  "approachRationale": "string or null — 1-2 sentences explaining why you recommended the chosen approach.",
  "redFlags": ["array of strings — any concerns about the process (e.g., 'sounds regulated — verify audit trail requirements', 'no clear owner mentioned', 'process seems to involve multiple approval bottlenecks')"],
  "adjacentProcesses": ["array of strings — other processes at the same company that might benefit from automation, based on what was described. Max 3 suggestions."],
  "confidence": "high | medium | low — overall confidence in the extraction. high = user gave clear, detailed input. medium = some inference required. low = input was vague or sparse.",
  "extractionNotes": "string — 1-2 sentences for the user explaining what you extracted and any major gaps they should fill in.",

  "recommendedToolIds": ["array of 2-3 tool IDs from the catalog below. Pick tools that fit the approach + process. Always prefer tools the user's team can actually adopt (consider difficulty)."],
  "toolRationale": "string — 2-3 sentences explaining why you picked these specific tools. Reference the process characteristics that drove the choice.",
  "caseStudyIds": ["array of 1-2 case study IDs from the catalog below that match the process most closely. Pick by similarity of process, industry, or approach."],
  "templateIds": ["array of 1-2 template IDs from the catalog below that the user could use as a starting point. Pick by category match."],
  "firstStep": "string — one concrete action the user can take TODAY in under 30 minutes. Be specific (e.g., 'Sign up for Make.com free plan, connect your email, and build a 2-step flow that triggers when an invoice arrives'). Include the tool name and the specific action.",
  "budgetBreakdown": {
    "tooling": "string — monthly or annual cost of recommended tools (e.g., '$25/mo for Make + Claude')",
    "implementation": "string — one-time build cost (e.g., '$8K for a consultant or 40 hours internal')",
    "ongoing": "string — annual maintenance cost (e.g., '$500/yr for updates and monitoring')",
    "totalYear1": "string — total cost in year 1 (e.g., '$11.3K total')"
  },
  "industryBenchmarks": {
    "maturity": "string — 1 sentence on where this company sits vs typical automation maturity for their industry/size",
    "commonPatterns": ["array of 2-3 strings — common automation patterns in this industry, based on the process described"],
    "averageRoi": "string — 1 sentence on typical ROI for similar automation projects in this industry"
  }
}

CRITICAL RULES:
1. Output ONLY valid JSON. No markdown fences, no commentary before or after.
2. Use null for any field you cannot reasonably infer from the input.
3. Be conservative — better to return null than to guess wildly.
4. For hourlyCost, if the user mentions salaries, divide by 2000 hours/year. If they mention 'specialist' or 'finance', assume $75-150/hr.
5. For automationPercentage, default to 70 if process seems well-defined, 50 if it involves significant judgment or unstructured data.
6. For approach: if user mentions 'documents', 'emails', 'unstructured text', 'classify', 'extract', 'summarize' -> recommend 'ai'. If 'legacy system', 'mainframe', 'no API', 'SAP', 'Oracle EBS' -> 'rpa'. If 'between tools', 'Slack to', 'sync', 'connect', 'Zapier' -> 'integration'. If 'core system', 'complex logic', 'customer-facing product', 'scale to thousands' -> 'custom'.
7. Adjacent processes should be plausible given the context, not generic. If they describe invoice processing, suggest 'expense approval' and 'vendor onboarding', not 'everything in finance'.

TOOL SELECTION RULES (CRITICAL — read carefully):
8. PREFER END-TO-END SOLUTIONS over building blocks. The user is a senior leader, not a developer. Recommend tools where they CONFIGURE rather than BUILD.
9. NEVER recommend raw AI APIs (claude-api, openai-api) as standalone solutions. They are building blocks, not solutions. If you recommend Claude/OpenAI capabilities, do so via a wrapper tool like Make.com or Zapier that has built-in AI modules — never as a standalone tool.
10. PREFER tools with these characteristics (in priority order):
    a. PURPOSE-BUILT tools that solve the specific problem (e.g., for invoice processing: lido, nanonets, docparser; for lead enrichment: clay; for web scraping: browse-ai, bardeen; for browser automation: axiom)
    b. INTEGRATION tools with built-in AI (make, zapier — they have Claude/OpenAI modules built in, no API key needed)
    c. INTEGRATION tools without AI (n8n, workato, pipedream, celigo)
    d. RPA tools (power-automate, uipath) for legacy systems without APIs
    e. CUSTOM tools (retool, bubble, airtable) only when the process is genuinely unique
    f. NEVER recommend raw API tools (claude-api, openai-api) as the primary solution
11. Always pick 2-3 tools. Prefer a primary tool + a complementary tool.
12. For caseStudyIds: only pick IDs that exist in the catalog. If none match well, return an empty array.
13. For templateIds: only pick IDs that exist in the catalog. If none match, return an empty array.
14. For firstStep: be concrete and specific to the FIRST tool you recommend. Don't say 'evaluate tools' — say 'Sign up for Lido's free plan, upload 5 sample invoices, and watch it extract vendor + amount automatically'.
15. For budgetBreakdown: provide realistic estimates. If implementation is via a purpose-built SaaS, implementation cost is low (mostly configuration). If custom dev, estimate hours × loaded hourly rate.
16. For toolRationale: explain WHY these specific tools fit the user's process characteristics AND why they minimize the user's effort. Mention what the user actually does (upload, configure, build visually) rather than abstract capabilities.

=== TOOL CATALOG ===
${TOOL_CATALOG}

=== CASE STUDY CATALOG ===
${CASE_STUDY_CATALOG}

=== WORKFLOW TEMPLATE CATALOG ===
${TEMPLATE_CATALOG}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, mode } = body as { text: string; mode?: string };

    if (!text || typeof text !== 'string' || text.trim().length < 5) {
      return NextResponse.json(
        { error: 'Input text is required (min 5 characters).' },
        { status: 400 }
      );
    }

    if (text.length > 10000) {
      return NextResponse.json(
        { error: 'Input too long. Please limit to 10,000 characters.' },
        { status: 400 }
      );
    }

    const modeHint =
      mode === 'voice'
        ? 'The user recorded a voice memo describing a process they want to evaluate for automation. The text below is a transcription — it may contain filler words, hesitations, or incomplete sentences. Interpret generously.'
        : mode === 'paste'
        ? 'The user pasted a document (could be an SOP, Slack thread, meeting notes, job description, or process documentation). Extract the process being described even if the document covers multiple topics.'
        : 'The user typed a brief description of a process they want to evaluate for automation.';

    const raw = await groqChatCompletion(
      [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `${modeHint}\n\n--- USER INPUT ---\n${text.trim()}`,
        },
      ],
      { json: true, temperature: 0.3, maxTokens: 3000 }
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

    let parsed: ExtractionResult;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      console.error('Failed to parse AI response as JSON:', jsonText.slice(0, 500));
      return NextResponse.json(
        {
          error: 'AI returned malformed output. Please try again with clearer input.',
          raw: jsonText.slice(0, 500),
        },
        { status: 502 }
      );
    }

    // Validate enum fields
    const validPerformers: Performer[] = ['ic', 'specialist', 'manager', 'vendor', 'mixed'];
    const validFrequencies: Frequency[] = ['hourly', 'daily', 'weekly', 'monthly', 'quarterly', 'annually'];
    const validApproaches: AutomationApproach[] = ['integration', 'ai', 'rpa', 'custom'];

    if (parsed.performer && !validPerformers.includes(parsed.performer)) {
      parsed.performer = null;
    }
    if (parsed.frequency && !validFrequencies.includes(parsed.frequency)) {
      parsed.frequency = null;
    }
    if (parsed.approach && !validApproaches.includes(parsed.approach)) {
      parsed.approach = null;
    }

    // Clamp numeric fields
    if (parsed.automationPercentage !== null) {
      parsed.automationPercentage = Math.max(10, Math.min(100, Math.round(parsed.automationPercentage)));
    }
    if (parsed.criticality !== null) {
      parsed.criticality = Math.max(1, Math.min(5, Math.round(parsed.criticality)));
    }
    if (parsed.errorTolerance !== null) {
      parsed.errorTolerance = Math.max(1, Math.min(5, Math.round(parsed.errorTolerance)));
    }

    // Validate tool/case-study/template IDs against catalogs
    const validToolIds = new Set(TOOLS.map((t) => t.id));
    const validCaseStudyIds = new Set(CASE_STUDIES.map((c) => c.id));
    const validTemplateIds = new Set(WORKFLOW_TEMPLATES.map((t) => t.id));

    parsed.recommendedToolIds = (parsed.recommendedToolIds || []).filter((id) =>
      validToolIds.has(id)
    );
    parsed.caseStudyIds = (parsed.caseStudyIds || []).filter((id) =>
      validCaseStudyIds.has(id)
    );
    parsed.templateIds = (parsed.templateIds || []).filter((id) =>
      validTemplateIds.has(id)
    );

    // Ensure required new fields have defaults
    if (!parsed.toolRationale) parsed.toolRationale = '';
    if (!parsed.firstStep) parsed.firstStep = '';
    if (!parsed.budgetBreakdown) {
      parsed.budgetBreakdown = {
        tooling: '',
        implementation: '',
        ongoing: '',
        totalYear1: '',
      };
    }
    if (!parsed.industryBenchmarks) {
      parsed.industryBenchmarks = {
        maturity: '',
        commonPatterns: [],
        averageRoi: '',
      };
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error('Extraction error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { error: `Extraction failed: ${message}` },
      { status: 500 }
    );
  }
}
