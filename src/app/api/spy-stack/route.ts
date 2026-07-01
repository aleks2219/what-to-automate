import { NextRequest, NextResponse } from 'next/server';
import { groqChatCompletion } from '@/lib/llm';
import { fetchWebsiteContent } from '@/lib/website-fetcher';
import { TECH_SIGNALS, VULNERABILITY_PATTERNS, COST_ESTIMATION_MODELS } from '@/lib/competitor-spy-db';

// Competitor AI Stack Guesser.
// Fetches competitor website, scans for tech signals, infers AI stack.

interface SpyRequest {
  competitorUrl: string;
  yourDescription?: string;
}

export interface DetectedSignal {
  signal: string;
  indicates: string;
  aiTool?: string;
  category: string;
  confidence: 'high' | 'medium' | 'low';
  type: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SpyRequest;

    if (!body.competitorUrl || body.competitorUrl.trim().length < 5) {
      return NextResponse.json(
        { error: 'Please enter a competitor URL.' },
        { status: 400 }
      );
    }

    // 1. Fetch competitor website
    const websiteResult = await fetchWebsiteContent(body.competitorUrl.trim());
    if (!websiteResult || !websiteResult.content || websiteResult.content.length < 50) {
      return NextResponse.json(
        { error: `Could not fetch ${body.competitorUrl}. The site may be down, blocked, or require JavaScript.` },
        { status: 422 }
      );
    }

    // 2. Scan for tech signals
    const contentLower = websiteResult.content.toLowerCase();
    const detectedSignals: DetectedSignal[] = [];

    for (const signal of TECH_SIGNALS) {
      if (contentLower.includes(signal.pattern.toLowerCase())) {
        detectedSignals.push({
          signal: signal.pattern,
          indicates: signal.indicates,
          aiTool: signal.aiTool,
          category: signal.category,
          confidence: signal.confidence,
          type: signal.signalType,
        });
      }
    }

    // Also fetch raw HTML for deeper signal detection
    try {
      const normalizedUrl = body.competitorUrl.trim().startsWith('http')
        ? body.competitorUrl.trim()
        : `https://${body.competitorUrl.trim()}`;
      const htmlRes = await fetch(normalizedUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; AutoScoreBot/1.0)' },
        signal: AbortSignal.timeout(8000),
      });
      if (htmlRes.ok) {
        const rawHtml = (await htmlRes.text()).toLowerCase();
        for (const signal of TECH_SIGNALS) {
          const alreadyDetected = detectedSignals.some((d) => d.signal === signal.pattern);
          if (!alreadyDetected && rawHtml.includes(signal.pattern.toLowerCase())) {
            detectedSignals.push({
              signal: signal.pattern,
              indicates: signal.indicates,
              aiTool: signal.aiTool,
              category: signal.category,
              confidence: signal.confidence,
              type: signal.signalType,
            });
          }
        }
      }
    } catch {
      // HTML fetch failed, continue with extracted content
    }

    // 3. Build AI prompt
    const signalsText = detectedSignals.length > 0
      ? detectedSignals.map((s) => `- [${s.confidence}] ${s.indicates} (category: ${s.category}${s.aiTool ? `, tool: ${s.aiTool}` : ''})`).join('\n')
      : 'No specific tech signals detected from page source.';

    const vulnerabilitiesText = VULNERABILITY_PATTERNS.map((v) =>
      `- [${v.severity}] ${v.pattern}: ${v.description}. Detect: ${v.howToDetect}. Exploit: ${v.howToExploit}. Cost: ${v.estimatedCost}`
    ).join('\n');

    const costModelsText = COST_ESTIMATION_MODELS.map((c) =>
      `- ${c.companyType}: ${c.estimatedMonthlyCost}/mo, ${c.costPerUserRange}/user. Models: ${c.likelyModels.join(', ')}. ${c.notes}`
    ).join('\n');

    const systemPrompt = `You are a competitive intelligence analyst specializing in AI technology stacks. You analyze competitors' public signals to infer their AI infrastructure, costs, and vulnerabilities.

You have detected TECH SIGNALS from the competitor's website. You also have VULNERABILITY PATTERNS to check and COST MODELS for estimation.

Your job: infer their AI stack, estimate costs, find vulnerabilities, and identify advantages.

OUTPUT: Valid JSON:
{
  "inferredStack": [{"category":"string","likelyTool":"string","confidence":"high|medium|low","reasoning":"string","estimatedCost":"string"}],
  "estimatedMonthlyCost": "string",
  "costBreakdown": "string — show your math",
  "vulnerabilities": [{"pattern":"string","description":"string","severity":"critical|high|medium|low","howToExploit":"string","estimatedCost":"string"}],
  "yourAdvantages": ["array of specific advantages"],
  "summary": "string — 2-3 sentences",
  "confidence": "high|medium|low"
}

RULES:
1. Output ONLY valid JSON.
2. Base inferences on EVIDENCE (detected signals + website content).
3. If API key exposure detected, flag as CRITICAL.
4. Show cost math: "10K users * 100 queries/day * $0.001 = $30K/mo"
5. yourAdvantages must be SPECIFIC and ACTIONABLE.
6. Be honest about confidence levels.`;

    const userMessage = `--- COMPETITOR WEBSITE ---
URL: ${websiteResult.url}
Title: ${websiteResult.title || 'Unknown'}

--- DETECTED TECH SIGNALS (${detectedSignals.length}) ---
${signalsText}

--- COMPETITOR WEBSITE CONTENT (extracted, first 3000 chars) ---
${websiteResult.content.slice(0, 3000)}

${body.yourDescription ? `--- USER'S OWN DESCRIPTION ---\n${body.yourDescription}\n\nCompare and find advantages.` : '--- USER DESCRIPTION ---\n(Not provided)'}

Analyze this competitor's AI stack, costs, vulnerabilities, and advantages.`;

    const raw = await groqChatCompletion(
      [
        { role: 'system', content: `${systemPrompt}\n\n=== VULNERABILITY PATTERNS ===\n${vulnerabilitiesText}\n\n=== COST MODELS ===\n${costModelsText}` },
        { role: 'user', content: userMessage },
      ],
      { json: true, temperature: 0.4, maxTokens: 3000 }
    );

    if (!raw || !raw.trim()) {
      return NextResponse.json({ error: 'AI returned empty response. Try again.' }, { status: 502 });
    }

    let jsonText = raw.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonText);
    } catch {
      return NextResponse.json({ error: 'AI returned malformed output. Try again.' }, { status: 502 });
    }

    parsed.signals = detectedSignals;
    return NextResponse.json(parsed);
  } catch (err: unknown) {
    console.error('Spy analysis error:', err);
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `Analysis failed: ${message}` }, { status: 500 });
  }
}
