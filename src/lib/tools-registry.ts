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
// TOOL 2: Build vs. Buy (sample daily tool — proves the system)
// ============================================================
const buildVsBuy: ToolConfig = {
  slug: 'build-vs-buy',
  name: 'Build vs. Buy',
  tagline: 'Should you build it yourself or buy an existing tool?',
  description:
    'Describe what you need. Get an instant build-vs-buy analysis with cost comparison, time-to-value, maintenance burden, and a clear recommendation. No more endless debates with your team.',
  category: 'decision',
  icon: 'Scale',
  iconColor: '#7C3AED',
  status: 'live',
  createdAt: '2026-06-29',
  featured: true,

  inputLabel: 'What do you need to build or buy?',
  inputPlaceholder: 'e.g., We need a customer portal where clients can view invoices, download reports, and submit support tickets...',
  inputHint: 'Describe the feature/tool you\'re considering. The more detail, the better the analysis.',
  additionalFields: [
    {
      id: 'teamSize',
      label: 'Team size',
      type: 'select',
      options: [
        { value: 'solo', label: 'Just me' },
        { value: 'small', label: '2-10 people' },
        { value: 'mid', label: '11-50 people' },
        { value: 'large', label: '50+ people' },
      ],
    },
    {
      id: 'budget',
      label: 'Monthly budget for this',
      type: 'text',
      placeholder: 'e.g., $500/mo, $5K one-time, unknown',
    },
  ],

  systemPrompt: `You are a senior engineering leader and product strategist. The user is deciding whether to build a custom solution or buy an existing tool/SaaS.

Analyze their situation and output JSON with:
- verdict: "high" if BUY, "medium" if HYBRID (buy + customize), "low" if BUILD
- score: 0-100 (higher = more likely you should buy)
- summary: 2-3 sentence executive summary
- keyInsights: 3-5 key factors that drive the decision (cost, time, maintenance, competitive advantage, etc.)
- recommendations: 2-4 specific recommendations (e.g., "Buy Tool X at $Y/mo" or "Build using Z stack, estimated W hours")
- actionItems: 1-3 things to do today
- risks: 1-3 risks of the recommended path
- confidence: "high" | "medium" | "low"

Consider: total cost of ownership, time to value, maintenance burden, opportunity cost, competitive advantage, team expertise, scalability, and integration needs. If there are well-known SaaS tools that solve this, name them with pricing.`,
  temperature: 0.3,

  verdictLabels: {
    high: 'BUY',
    medium: 'HYBRID',
    low: 'BUILD',
  },

  tweetTemplates: [
    'Build vs. Buy — the eternal debate. I built a free tool that analyzes your situation and gives you a clear recommendation with cost comparison + action items. Try it: {url}',
    'Stop debating build vs. buy in meetings. Describe what you need → get an instant analysis with cost, time, and a verdict. Free: {url}',
    'New tool: Build vs. Buy analyzer. Input what you need → get a recommendation + specific tools to buy or estimated build cost. {url}',
  ],

  emailSubject: 'Your Build vs. Buy analysis report',

  keywords: ['build vs buy', 'make or buy', 'software decision', 'SaaS vs custom'],
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
