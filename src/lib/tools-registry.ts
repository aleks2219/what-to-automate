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
// TOOL 3: Startup Idea Validator (coming soon placeholder)
// ============================================================
const startupIdeaValidator: ToolConfig = {
  slug: 'startup-idea-validator',
  name: 'Idea Validator',
  tagline: 'Is your startup idea worth pursuing?',
  description:
    'Describe your startup idea. Get an honest assessment of market size, competition, differentiation, and execution risk. No sugar-coating.',
  category: 'evaluator',
  icon: 'Lightbulb',
  iconColor: '#F59E0B',
  status: 'coming-soon',
  createdAt: '2026-06-29',

  inputLabel: 'Describe your startup idea',
  inputPlaceholder: 'e.g., An app that uses AI to help restaurants predict demand and reduce food waste...',
  inputHint: 'Be specific about the problem, solution, and target customer.',

  systemPrompt: 'You are a startup advisor. Evaluate the idea honestly.',
  temperature: 0.4,

  verdictLabels: {
    high: 'PURSUE IT',
    medium: 'PIVOT FIRST',
    low: 'RETHINK',
  },

  tweetTemplates: [
    'Is your startup idea actually good? I built a free tool that gives you an honest assessment — no sugar-coating. Try it: {url}',
  ],

  emailSubject: 'Your startup idea validation report',

  keywords: ['startup idea', 'idea validation', 'startup assessment'],
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
