import { NextRequest, NextResponse } from 'next/server';
import {
  AutomationApproach,
  Frequency,
  Performer,
} from '@/lib/automation';
import { ExtractionResult } from '@/lib/extraction-types';
import { getZaiClient } from '@/lib/zai-config';

export type { ExtractionResult };

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
  "extractionNotes": "string — 1-2 sentences for the user explaining what you extracted and any major gaps they should fill in."
}

CRITICAL RULES:
1. Output ONLY valid JSON. No markdown fences, no commentary before or after.
2. Use null for any field you cannot reasonably infer from the input.
3. Be conservative — better to return null than to guess wildly.
4. For hourlyCost, if the user mentions salaries, divide by 2000 hours/year. If they mention 'specialist' or 'finance', assume $75-150/hr.
5. For automationPercentage, default to 70 if process seems well-defined, 50 if it involves significant judgment or unstructured data.
6. For approach: if user mentions 'documents', 'emails', 'unstructured text', 'classify', 'extract', 'summarize' -> recommend 'ai'. If 'legacy system', 'mainframe', 'no API', 'SAP', 'Oracle EBS' -> 'rpa'. If 'between tools', 'Slack to', 'sync', 'connect', 'Zapier' -> 'integration'. If 'core system', 'complex logic', 'customer-facing product', 'scale to thousands' -> 'custom'.
7. Adjacent processes should be plausible given the context, not generic. If they describe invoice processing, suggest 'expense approval' and 'vendor onboarding', not 'everything in finance'.`;

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

    const zai = getZaiClient();

    const modeHint =
      mode === 'voice'
        ? 'The user recorded a voice memo describing a process they want to evaluate for automation. The text below is a transcription — it may contain filler words, hesitations, or incomplete sentences. Interpret generously.'
        : mode === 'paste'
        ? 'The user pasted a document (could be an SOP, Slack thread, meeting notes, job description, or process documentation). Extract the process being described even if the document covers multiple topics.'
        : 'The user typed a brief description of a process they want to evaluate for automation.';

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: `${modeHint}\n\n--- USER INPUT ---\n${text.trim()}`,
        },
      ],
      thinking: { type: 'disabled' },
    });

    const raw = completion.choices[0]?.message?.content?.trim();

    if (!raw) {
      return NextResponse.json(
        { error: 'AI returned an empty response. Please try again.' },
        { status: 502 }
      );
    }

    // Strip markdown fences if present
    let jsonText = raw;
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
