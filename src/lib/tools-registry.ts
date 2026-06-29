// Tool Registry — the directory of all tools in the platform.
// To add a new tool: create a config file in tools/ and import it here.
// The homepage + routing automatically pick up changes.

import { ToolConfig } from './tool-config';

// ============================================================
// TOOL 1: AutoScore (flagship — links to existing full app)
// ============================================================
const autoscore: ToolConfig = {
  slug: 'automation-evaluator',
  name: 'AutoScore',
  tagline: 'Should you automate that process?',
  description:
    'Describe a process in one sentence. Get a verdict, ROI, payback period, risks, a phased roadmap, and specific tool recommendations. The flagship tool with full assessment + AI tool matcher.',
  category: 'evaluator',
  icon: 'Zap',
  iconColor: '#047857',
  status: 'live',
  createdAt: '2026-06-28',
  featured: true,

  inputLabel: 'What process do you want to evaluate?',
  inputPlaceholder: 'e.g., Every week our finance team reconciles 200 vendor invoices against POs in NetSuite...',
  inputHint: 'One sentence is enough. The AI extracts everything else.',
  additionalFields: [
    {
      id: 'industry',
      label: 'Industry',
      type: 'select',
      options: [
        { value: 'technology', label: 'Technology' },
        { value: 'finance', label: 'Finance' },
        { value: 'healthcare', label: 'Healthcare' },
        { value: 'retail', label: 'Retail' },
        { value: 'manufacturing', label: 'Manufacturing' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      id: 'currentTools',
      label: 'Current tools (optional)',
      type: 'text',
      placeholder: 'Slack, Notion, Zapier...',
    },
    {
      id: 'companyWebsite',
      label: 'Company website (optional)',
      type: 'url',
      placeholder: 'yourcompany.com',
    },
  ],

  systemPrompt: `You are a senior operations consultant. Analyze the user's process for automation potential. Output JSON with verdict (high=automate now, medium=pilot first, low=not yet), score (0-100), summary, keyInsights, recommendations, actionItems, risks, and confidence.`,
  temperature: 0.3,

  verdictLabels: {
    high: 'AUTOMATE NOW',
    medium: 'PILOT FIRST',
    low: 'NOT YET',
  },

  tweetTemplates: [
    'Should you automate that process? I built a free tool that takes one sentence and gives you a verdict, ROI, payback, risks, and a roadmap. Try it: {url}',
    'Most leaders automate the wrong things. I built a tool to help: describe a process → get a verdict + ROI + tool recommendations. Free: {url}',
    'New tool: AutoScore. Input a process → get a decision-ready report with ROI, payback, risks, and phased roadmap. {url}',
  ],

  emailSubject: 'Your AutoScore automation assessment report',

  keywords: ['automation', 'ROI', 'process automation', 'business case'],
};

// ============================================================
// TOOL 2: Build vs. Buy (knowledge-rich decision tool)
// ============================================================
const buildVsBuy: ToolConfig = {
  slug: 'build-vs-buy',
  name: 'Build vs. Buy',
  tagline: 'Should you build it yourself or buy an existing tool?',
  description:
    'Describe what you need. Get an instant analysis with 3-year cost comparison, specific SaaS alternatives with pricing, build time estimates, maintenance burden, and a clear verdict. Covers 15+ common scenarios from auth to e-commerce.',
  category: 'decision',
  icon: 'Scale',
  iconColor: '#7C3AED',
  status: 'live',
  createdAt: '2026-06-29',
  featured: true,

  inputLabel: 'What do you need to build or buy?',
  inputPlaceholder: 'e.g., We need a customer portal where clients can view invoices, download reports, and submit support tickets. We use Salesforce and want it integrated.',
  inputHint: 'Describe the feature/tool you\'re considering. Include integrations, scale, and any constraints. The more detail, the better the analysis.',
  additionalFields: [
    {
      id: 'teamSize',
      label: 'Team size',
      type: 'select',
      options: [
        { value: 'solo', label: 'Just me / solo founder' },
        { value: 'small', label: '2-10 people' },
        { value: 'mid', label: '11-50 people' },
        { value: 'large', label: '50+ people' },
      ],
      helpText: 'Affects whether you have the capacity to maintain custom code.',
    },
    {
      id: 'devCapacity',
      label: 'Do you have developers?',
      type: 'select',
      options: [
        { value: 'no-devs', label: 'No developers on team' },
        { value: 'some-devs', label: '1-3 developers' },
        { value: 'dev-team', label: '4+ developers' },
        { value: 'outsourced', label: 'Outsource to agency/freelancer' },
      ],
      helpText: 'Critical factor — can you actually build and maintain this?',
    },
    {
      id: 'timeline',
      label: 'When do you need this live?',
      type: 'select',
      options: [
        { value: 'asap', label: 'ASAP (days)' },
        { value: 'weeks', label: '2-4 weeks' },
        { value: 'months', label: '1-3 months' },
        { value: 'flexible', label: 'No rush' },
      ],
    },
    {
      id: 'budget',
      label: 'Monthly budget for this',
      type: 'text',
      placeholder: 'e.g., $500/mo, $5K one-time, unknown',
      helpText: 'Include both what you can spend upfront + monthly.',
    },
  ],

  systemPrompt: `You are a senior engineering leader and product strategist with 15+ years of experience making build-vs-buy decisions. You've seen every mistake: teams building auth from scratch (security nightmares), companies building CMSes instead of shipping product, startups building custom CRMs when HubSpot is free.

The user is deciding whether to build a custom solution or buy an existing SaaS tool. Your job is to give them a definitive, specific, actionable recommendation.

You have access to a KNOWLEDGE BASE of 15+ common build scenarios with:
- Specific SaaS alternatives with real pricing
- Build time estimates (hours + cost at $100/hr)
- Ongoing maintenance burden (hours/month)
- Key considerations for each scenario

ANALYSIS FRAMEWORK — evaluate ALL of these factors:

1. TOTAL COST OF OWNERSHIP (3-year):
   - Build: upfront dev cost + 3 years of maintenance (hrs/month × $100 × 36) + infrastructure
   - Buy: monthly subscription × 36 + setup + integration costs
   - Include opportunity cost — what else could the team build?

2. TIME TO VALUE:
   - Build: dev time + testing + deployment (weeks to months)
   - Buy: setup + configuration (hours to days)

3. MAINTENANCE BURDEN:
   - Build: bug fixes, security patches, feature updates, infrastructure monitoring
   - Buy: vendor handles everything, but you depend on their roadmap

4. COMPETITIVE ADVANTAGE:
   - Is this a core differentiator? If yes, BUILD (it's your moat)
   - Is this table stakes (auth, payments, email)? If yes, BUY (don't reinvent)

5. TEAM EXPERTISE:
   - Do they have developers who can build + maintain this?
   - Is this the best use of their dev team's time?

6. SCALABILITY:
   - SaaS pricing often scales linearly with usage — at what volume does building become cheaper?
   - Custom code scales with infrastructure costs only

7. INTEGRATION NEEDS:
   - How many existing systems need to connect?
   - SaaS tools with good APIs may be easier to integrate than custom code

8. DATA SENSITIVITY:
   - Compliance requirements (HIPAA, SOC 2, GDPR)?
   - Some data must stay in-house → build or self-host

9. VENDOR LOCK-IN:
   - How hard is it to switch away from the SaaS later?
   - Migration costs if the vendor raises prices or shuts down

10. SWITCHING COSTS:
    - If you build and it fails, can you easily migrate to a SaaS?
    - If you buy and it fails, can you easily build?

OUTPUT REQUIREMENTS:
- verdict: "high" = BUY (strong case for SaaS), "medium" = HYBRID (buy + customize), "low" = BUILD (custom is the right call)
- score: 0-100 (higher = stronger case for buying)
- summary: 2-3 sentence executive summary that references their specific situation
- keyInsights: 4-6 insights, each should be a specific factor with your analysis (not generic). Reference their team size, timeline, budget.
- recommendations: 3-5 specific recommendations. NAME SPECIFIC TOOLS with pricing. If recommending build, estimate hours + cost. Include a 3-year cost comparison in one recommendation.
- actionItems: 2-3 things to do TODAY (e.g., "Sign up for Clerk's free tier and test the auth flow" or "Get a quote from 2 agencies for the build")
- risks: 2-3 risks of your recommended path
- confidence: "high" | "medium" | "low"

CRITICAL: Always reference SPECIFIC tools from the knowledge base with REAL pricing. Never say "consider a SaaS tool" — say "Use Clerk (free up to 10K users) because your team has no developers and needs auth in days, not months."

If the user's scenario matches a knowledge base entry, reference the specific SaaS alternatives with their pricing. If it doesn't match, use your knowledge of the SaaS landscape to recommend specific tools.`,
  temperature: 0.4,

  verdictLabels: {
    high: 'BUY',
    medium: 'HYBRID',
    low: 'BUILD',
  },

  tweetTemplates: [
    'Build vs. Buy — the eternal debate. I built a free tool that analyzes your situation and gives specific tool recommendations with pricing, 3-year cost comparison, and action items. Try it: {url}',
    'Stop debating build vs. buy in meetings. Describe what you need → get instant analysis with specific SaaS alternatives, build cost estimates, and a clear verdict. Free: {url}',
    'New tool: Build vs. Buy analyzer. Covers 15+ scenarios (auth, CMS, e-commerce, CRM, payments...) with real pricing. Input what you need → get a recommendation in 5 seconds. {url}',
    'Should you build it or buy it? I built a free AI tool that gives you specific tool names + pricing + 3-year cost comparison + maintenance estimate. No more guessing. {url}',
  ],

  emailSubject: 'Your Build vs. Buy analysis report',

  keywords: ['build vs buy', 'make or buy', 'software decision', 'SaaS vs custom', 'build or buy', 'software architecture'],
};

// ============================================================
// TOOL 3: Startup Idea Validator (live — knowledge-rich)
// ============================================================
const startupIdeaValidator: ToolConfig = {
  slug: 'startup-idea-validator',
  name: 'Idea Validator',
  tagline: 'Is your startup idea worth pursuing?',
  description:
    'Describe your startup idea. Get an honest assessment across 10 dimensions: market size, competition, differentiation, execution risk, capital needed, time to revenue, and more. Includes a knowledge base of 14 startup patterns with real failure modes. No sugar-coating.',
  category: 'evaluator',
  icon: 'Lightbulb',
  iconColor: '#F59E0B',
  status: 'live',
  createdAt: '2026-06-29',
  featured: true,

  inputLabel: 'Describe your startup idea',
  inputPlaceholder: 'e.g., An AI tool that helps restaurants predict demand and reduce food waste by analyzing their POS data, weather patterns, and local events...',
  inputHint: 'Be specific about the problem, solution, target customer, and how you make money. The more detail, the better the analysis.',
  additionalFields: [
    {
      id: 'stage',
      label: 'What stage are you at?',
      type: 'select',
      options: [
        { value: 'idea', label: 'Just an idea' },
        { value: 'research', label: 'Researching the market' },
        { value: 'prototype', label: 'Building a prototype' },
        { value: 'mvp', label: 'Have an MVP' },
        { value: 'users', label: 'Have some users' },
      ],
      helpText: 'Where you are affects what advice is most useful.',
    },
    {
      id: 'capital',
      label: 'How much can you invest?',
      type: 'select',
      options: [
        { value: 'bootstrap', label: 'Bootstrapping ($0-10K)' },
        { value: 'small', label: 'Small savings ($10-50K)' },
        { value: 'funded', label: 'Can raise ($50K-500K)' },
        { value: 'vc', label: 'VC-backed ($500K+)' },
      ],
      helpText: 'Some ideas require more capital than others.',
    },
    {
      id: 'timeCommitment',
      label: 'Time commitment',
      type: 'select',
      options: [
        { value: 'side', label: 'Side project (nights/weekends)' },
        { value: 'full', label: 'Full-time' },
        { value: 'team', label: 'Full-time team (2+ people)' },
      ],
    },
  ],

  systemPrompt: `You are a brutally honest startup advisor with 15+ years of experience. You've founded 3 companies (one exited, two failed), angel invested in 50+ startups, and mentored at Y Combinator. You've seen every type of idea and know why most fail.

Your job is to evaluate the user's startup idea HONESTLY. No sugar-coating. No "that's a great idea!" if it's not. Founders deserve the truth before they spend years and savings on something doomed.

You have access to a KNOWLEDGE BASE of 14 startup patterns. Each pattern includes:
- Market saturation level (blue-ocean to oversaturated)
- Typical capital needed
- Time to revenue
- Key risks specific to this type of startup
- Success factors that separate winners from losers
- Real examples of companies in this space
- Red flags that predict failure

EVALUATION FRAMEWORK — assess ALL 10 dimensions:

1. PROBLEM: Is this a real, painful problem people will pay to solve? Or a "nice to have"?
2. MARKET SIZE: Is the market big enough to build a real business? (> $100M TAM ideal)
3. TIMING: Is now the right time? Too early = education cost. Too late = saturated.
4. COMPETITION: Who else is doing this? What's the competitive moat?
5. DIFFERENTIATION: Why would someone choose this over existing solutions?
6. EXECUTION RISK: Can THIS team (based on what they told you) actually build this?
7. CAPITAL FIT: Does the idea match their budget? (Can't bootstrap a fintech with $0)
8. TIME TO REVENUE: How long until first dollar? Does their runway support it?
9. DISTRIBUTION: How will they get customers? "Build it and they will come" is a lie.
10. FAILURE MODES: What's the most likely way this fails? Be specific.

OUTPUT REQUIREMENTS:
- verdict: "high" = PURSUE IT (strong idea, good timing, manageable risk), "medium" = PIVOT FIRST (idea has potential but needs changes), "low" = RETHINK (fundamental problems that need addressing before proceeding)
- score: 0-100 (higher = stronger idea)
- summary: 2-3 sentences. Lead with the verdict and the ONE biggest reason.
- keyInsights: 4-6 insights, each covering one of the 10 dimensions above. Be specific to their idea.
- recommendations: 3-5 specific recommendations. If the idea matches a knowledge base pattern, reference the success factors and red flags. Include specific competitors to study and specific next steps to validate the idea.
- actionItems: 2-4 things to do THIS WEEK. Not "research the market" but "interview 10 restaurant owners about how they currently handle demand forecasting. Find them via LinkedIn or walk into 10 restaurants."
- risks: 2-4 specific risks. Not generic "competition" but "Toast and Square already have POS data and 100K+ restaurant customers. They can add AI forecasting in a sprint. Your moat is zero."
- confidence: "high" | "medium" | "low"

CRITICAL RULES:
1. If the idea is an AI wrapper ("ChatGPT for X"), call it out. These are features, not businesses. Explain why and what would make it defensible.
2. If the idea is a marketplace, explain the cold start problem and how they'll solve it.
3. If the capital needed doesn't match their budget, flag it immediately.
4. If they have no distribution plan, that's a bigger risk than the product itself.
5. Reference specific competitors by name with what they do well.
6. Be direct but constructive. Don't crush dreams, but don't waste their time either.`,
  temperature: 0.4,

  verdictLabels: {
    high: 'PURSUE IT',
    medium: 'PIVOT FIRST',
    low: 'RETHINK',
  },

  tweetTemplates: [
    'I built a free tool that tells you if your startup idea is actually good. Describe it in one sentence. Get a brutally honest assessment across 10 dimensions. No sugar-coating. Try it: {url}',
    'Stop wondering if your startup idea is worth pursuing. I built a free AI tool that evaluates it across market size, competition, execution risk, and 7 more dimensions. Try it: {url}',
    'Most startup ideas fail for predictable reasons. I built a free tool that identifies those reasons before you waste a year. Describe your idea. Get honest feedback. {url}',
    'Is your startup idea a winner or a time sink? Free AI tool evaluates it across 10 dimensions with specific competitors, risks, and next steps. No login: {url}',
  ],

  emailSubject: 'Your startup idea validation report',

  keywords: ['startup idea', 'idea validation', 'startup assessment', 'business idea', 'should I start'],
};

// ============================================================
// REGISTRY
// ============================================================
export const TOOL_REGISTRY: ToolConfig[] = [
  autoscore,
  buildVsBuy,
  startupIdeaValidator,
];

export function getToolBySlug(slug: string): ToolConfig | undefined {
  return TOOL_REGISTRY.find((t) => t.slug === slug);
}

export function getLiveTools(): ToolConfig[] {
  return TOOL_REGISTRY.filter((t) => t.status === 'live');
}

export function getFeaturedTools(): ToolConfig[] {
  return TOOL_REGISTRY.filter((t) => t.featured && t.status === 'live');
}
