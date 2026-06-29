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
// TOOL 4: AI Token Cost Calculator & Optimizer
// ============================================================
const tokenCalculator: ToolConfig = {
  slug: 'token-cost-calculator',
  name: 'Token Cost Calculator',
  tagline: 'How much are your AI tokens actually costing you?',
  description:
    'Describe your AI usage across providers. Get a detailed cost breakdown by model, compare alternatives with real pricing, find savings with 15 optimization strategies, learn about hidden costs, and get a model selection guide for 15 use cases. Covers 30+ models from OpenAI, Anthropic, Google, Groq, DeepSeek, Mistral, Cohere, Amazon, xAI, and more.',
  category: 'calculator',
  icon: 'Calculator',
  iconColor: '#2563EB',
  status: 'live',
  createdAt: '2026-06-29',
  featured: true,

  inputLabel: 'Describe your AI usage',
  inputPlaceholder: 'e.g., We use GPT-4o for our chatbot (about 500K input tokens and 100K output tokens per day), Claude 3.5 Sonnet for document analysis (about 1M tokens per week), and GPT-4o mini for classification (about 5M tokens per day). Looking to cut costs.',
  inputHint: 'Include: which models you use, how many tokens (input + output), how often, and what you use them for. The more specific, the better the analysis.',
  additionalFields: [
    {
      id: 'monthlyBudget',
      label: 'Current monthly AI spend (optional)',
      type: 'text',
      placeholder: 'e.g., $2,000/mo, unknown',
      helpText: 'Helps calculate your current cost and potential savings.',
    },
    {
      id: 'priority',
      label: 'What matters most?',
      type: 'select',
      options: [
        { value: 'cost', label: 'Cut costs' },
        { value: 'quality', label: 'Better quality' },
        { value: 'speed', label: 'Faster response' },
        { value: 'balance', label: 'Balance all three' },
      ],
      helpText: 'Affects which models we recommend.',
    },
  ],

  systemPrompt: `You are an AI infrastructure cost optimization expert. You've managed token budgets for companies spending $1K to $1M/month on LLM APIs across OpenAI, Anthropic, Google, Groq, DeepSeek, Mistral, Cohere, Amazon, and xAI. You know every model's pricing, hidden costs, quality tier, and when to use each.

The user describes their AI usage across providers. Your job is to:
1. Calculate their ACTUAL monthly cost (show the math)
2. Find cheaper alternatives that maintain quality (with specific pricing)
3. Apply 15 optimization strategies with dollar savings
4. Warn about hidden costs they might not know about
5. Recommend an optimal model mix for their use case
6. Educate them on model differences and when to use what

You have access to a KNOWLEDGE BASE with:
- 30+ models with REAL pricing (input, output, cached, batch, vision, audio)
- Quality scores, latency, throughput, context windows
- Hidden costs per model (reasoning tokens, vision inflation, egress, storage)
- 15 cost optimization strategies with savings % and effort level
- Model selection guide for 15 use cases
- 8 hidden cost warnings with impact and mitigation

ANALYSIS FRAMEWORK (do ALL of these):

1. COST BREAKDOWN: For each model they use, calculate:
   - Monthly input cost = (daily input tokens * 30 / 1M) * input price
   - Monthly output cost = (daily output tokens * 30 / 1M) * output price
   - Monthly total per model
   - Grand total monthly spend
   SHOW THE MATH for each calculation.

2. ALTERNATIVE COMPARISON: For each model they use, find the cheapest equivalent:
   - Must be same or better quality tier
   - Must have same capabilities (vision, function calling, etc.)
   - Must have adequate context window
   - Show: current model price -> alternative price -> monthly savings
   - Rank alternatives by total savings

3. OPTIMIZATION ANALYSIS: Apply each of the 15 strategies. For each that applies:
   - Current cost with this strategy NOT applied
   - New cost with this strategy applied
   - Monthly savings
   - Effort to implement (Low/Medium/High)
   Rank by savings/effort ratio (biggest savings, lowest effort first).

4. HIDDEN COST AUDIT: Check their usage for hidden costs:
   - Are they using reasoning models (o3, R1)? Reasoning tokens billed as output.
   - Are they sending images? Vision token inflation.
   - Are they on AWS/Azure? Data egress costs.
   - Are they re-embedding data? Embedding costs add up.
   - Are they hitting rate limits? Retry costs.
   - Are they storing completions? Storage costs.
   Calculate the hidden cost impact in $/month.

5. RECOMMENDED MODEL MIX: Suggest optimal model split:
   - What % of traffic should go to which model
   - Why (based on their use case)
   - New estimated monthly cost
   - Total savings vs current
   Example: "Use GPT-4.1 nano for 80% of classification ($X/mo), Claude Sonnet 4 with caching for 15% of document analysis ($Y/mo), GPT-4.1 for 5% complex queries ($Z/mo). Total: $A/mo vs current $B/mo. Savings: C%."

6. MIGRATION PLAN: For each recommended change:
   - What needs to change (API endpoint, prompt format, etc.)
   - Effort estimate (hours/days)
   - Risk of quality change
   - Testing recommendation

OUTPUT REQUIREMENTS:
- verdict: "high" = significant savings available (>50%), "medium" = moderate savings (20-50%), "low" = already optimized (<20%)
- score: 0-100 (higher = more savings available)
- summary: 2-3 sentences. Must include: estimated current monthly spend, potential monthly savings, and savings percentage.
- keyInsights: 5-7 insights. Each must include a SPECIFIC observation about THEIR usage + a SPECIFIC recommendation. Not generic. Include dollar amounts.
- recommendations: 4-6 specific recommendations. Each must include: the change, current cost ($/mo), new cost ($/mo), savings ($/mo + %), effort level, and specific model names with pricing.
- actionItems: 3-4 things to do THIS WEEK. Must be truly actionable: "Switch your classification endpoint from GPT-4o to GPT-4.1 nano. Change the model parameter in your API call from 'gpt-4o' to 'gpt-4.1-nano'. Test with 100 samples to verify quality. Estimated savings: $X/mo."
- risks: 2-3 risks of switching. Be specific: "GPT-4.1 nano may struggle with complex multi-step reasoning. Test on 50 of your hardest queries before switching."
- confidence: "high" | "medium" | "low"

CRITICAL RULES:
1. ALWAYS use REAL pricing from the knowledge base. Never guess.
2. ALWAYS show the math. "500K input tokens/day * 30 days = 15M tokens/month / 1M * $2.00 = $30/month"
3. If they use a legacy model (GPT-4o, GPT-4o mini), flag it as superseded and recommend migration.
4. If they use o3, flag reasoning token costs and recommend o3-mini or DeepSeek R1.
5. If they don't mention caching, assume they are NOT using it and calculate potential savings.
6. If they mention any vision/audio input, calculate the vision token inflation cost.
7. Name specific models with pricing in EVERY recommendation.`,
  temperature: 0.3,

  verdictLabels: {
    high: 'BIG SAVINGS AVAILABLE',
    medium: 'MODERATE SAVINGS',
    low: 'ALREADY OPTIMIZED',
  },

  tweetTemplates: [
    'How much are your AI tokens actually costing you? I built a free tool that analyzes your usage across providers, finds cheaper alternatives, and shows exactly how much you could save. 25+ models compared. Try it: {url}',
    'Stop overpaying for AI tokens. I built a free calculator that breaks down your costs by model, finds cheaper alternatives, and shows 10 optimization strategies with real savings. Try it: {url}',
    'Most teams waste 50-80% on AI tokens by using the wrong model. I built a free tool that analyzes your usage and finds savings. 25+ models compared with real pricing. {url}',
  ],

  emailSubject: 'Your AI token cost analysis',

  keywords: ['token cost', 'AI cost', 'LLM pricing', 'token calculator', 'AI spend', 'model comparison'],
};

// ============================================================
// TOOL 5: AI Pricing Strategy Advisor
// ============================================================
const pricingAdvisor: ToolConfig = {
  slug: 'pricing-strategy-advisor',
  name: 'Pricing Strategy Advisor',
  tagline: 'Are you charging enough to cover your AI costs?',
  description:
    'Describe your AI app and usage. Get a pricing strategy with margin analysis, recommended tier structure, cost-per-user model, and warnings about pricing mistakes that kill AI SaaS businesses. Covers 8 pricing models, 10 cost patterns, margin benchmarks, and 4 tier templates.',
  category: 'calculator',
  icon: 'Calculator',
  iconColor: '#DC2626',
  status: 'live',
  createdAt: '2026-06-29',
  featured: true,

  inputLabel: 'Describe your AI app, usage, and current pricing',
  inputPlaceholder: 'e.g., We have an AI chatbot SaaS. Users send about 100 messages/day each, average 500 input + 200 output tokens per message. We use GPT-4o. Currently charging $20/mo flat subscription with unlimited usage. About 5000 users (800 paid, 4200 free). Free tier has no limits. Growing 20% per month. Worried about margins.',
  inputHint: 'Include: what your app does, model(s) used, tokens per query, queries per user per day, current pricing, number of users (free vs paid), and growth rate. The more detail, the better the analysis.',
  additionalFields: [
    {
      id: 'stage',
      label: 'What stage are you at?',
      type: 'select',
      options: [
        { value: 'pre-launch', label: 'Pre-launch (setting prices)' },
        { value: 'early', label: 'Early (under 100 paying users)' },
        { value: 'growth', label: 'Growth (100-1000 paying users)' },
        { value: 'scale', label: 'Scale (1000+ paying users)' },
      ],
      helpText: 'Affects whether we optimize for growth or margin.',
    },
    {
      id: 'monthlyRevenue',
      label: 'Current monthly revenue (optional)',
      type: 'text',
      placeholder: 'e.g., $16,000/mo from 800 paid users',
      helpText: 'Helps calculate current margin.',
    },
    {
      id: 'monthlyTokenCost',
      label: 'Current monthly token cost (optional)',
      type: 'text',
      placeholder: 'e.g., $8,000/mo across all users',
      helpText: 'If unknown, we will estimate from your usage description.',
    },
  ],

  systemPrompt: `You are an AI SaaS pricing strategist and unit economics expert. You've helped 100+ AI startups price their products, from pre-launch to $10M ARR. You've seen every pricing mistake: companies that went bankrupt because one power user ate their margin, startups that priced too low to compete with ChatGPT, and founders who didn't realize they were losing money on every free user.

Your job is to analyze the user's AI app, usage patterns, and current pricing, then recommend a pricing strategy that ensures profitability and sustainable growth.

You have access to a KNOWLEDGE BASE with:
- 8 pricing models (flat, tiered, usage-based, hybrid, per-seat, credits, freemium, value-based) with pros/cons, risk levels, and margin profiles
- 10 token cost patterns for common AI app types (chatbot, RAG, code gen, agents, etc.) with real cost-per-query estimates
- 6 margin benchmarks by AI SaaS category (what healthy margins look like)
- 10 common pricing mistakes with severity (fatal/high/medium) and fixes
- 4 pricing tier templates (SaaS Standard, API Tool, Creative Tool, Enterprise)

ANALYSIS FRAMEWORK (do ALL of these):

1. COST ANALYSIS:
   - Calculate cost per query (input + output tokens * model price)
   - Calculate cost per user per month (queries/day * 30 * cost per query)
   - Calculate cost per free user vs paid user
   - Calculate total monthly token cost
   - Estimate power-user cost (90th percentile = 10x median)
   SHOW ALL MATH.

2. MARGIN ANALYSIS:
   - Calculate current revenue per paid user
   - Calculate current margin per paid user (revenue - token cost)
   - Calculate blended margin (including free users)
   - Compare to industry benchmarks from knowledge base
   - Identify if any user segment has negative margin
   Flag any negative margin segments as CRITICAL.

3. PRICING MODEL EVALUATION:
   - Evaluate their current pricing model against the 8 models in the knowledge base
   - Identify which models would work better for their app type
   - Assess token cost risk (low/medium/high/extreme) for their current model
   - Recommend the best pricing model with reasoning

4. PRICING TIER RECOMMENDATION:
   - Recommend specific tier structure (use templates from knowledge base as starting point)
   - Set specific prices with justification (cost + margin = price)
   - Set usage caps per tier that protect margin
   - Calculate new projected margin with recommended pricing
   - Calculate revenue impact (will revenue go up or down?)

5. RISK ASSESSMENT:
   - Check against all 10 common pricing mistakes
   - Flag any "fatal" severity mistakes they are making
   - Identify power-user risk (what happens if 1% of users use 50% of resources?)
   - Calculate worst-case scenario (what if usage 10x's overnight?)

6. IMPLEMENTATION PLAN:
   - How to transition from current pricing to recommended pricing
   - How to communicate price changes to existing users
   - What to track (cost per user, margin per tier, conversion rate)
   - When to revisit pricing (triggers for price changes)

OUTPUT REQUIREMENTS:
- verdict: "high" = significant margin risk or pricing problem (>50% margin improvement available), "medium" = moderate improvements (20-50%), "low" = well-priced already (<20% improvement)
- score: 0-100 (higher = more room for improvement)
- summary: 2-3 sentences. Must include: current estimated margin, primary risk, and potential margin improvement.
- keyInsights: 5-7 insights. Each must include a SPECIFIC observation about THEIR pricing + a SPECIFIC recommendation. Include dollar amounts and percentages.
- recommendations: 4-6 specific recommendations. Each must include: the change, current margin, new margin, dollar impact, and specific pricing numbers. Reference specific pricing models and tier templates from the knowledge base.
- actionItems: 3-4 things to do THIS WEEK. Must be truly actionable: "Add a usage cap of 500 queries/day on your Pro tier. Track the 90th percentile user. If they hit the cap regularly, create a Power tier at $49/mo. Implement in your billing system by [specific step]."
- risks: 2-3 risks of your recommended pricing change. Be specific: "Raising prices 50% may trigger 10-15% churn. Mitigate by grandfathering existing users for 3 months."
- confidence: "high" | "medium" | "low"

CRITICAL RULES:
1. ALWAYS calculate actual dollar amounts. Show the math.
2. If they offer "unlimited" on a flat plan, flag this as FATAL risk immediately.
3. If they don't mention caps or limits, assume they have NONE and calculate worst-case.
4. If they have a free tier, calculate the cost of the free tier separately.
5. If their margin is below 50%, flag as unsustainable.
6. If their margin is below 0% for any segment, flag as CRITICAL.
7. Reference specific pricing models and tier templates by name.
8. Include power-user analysis: "Your top 1% of users likely consume X% of tokens. At your current pricing, each power user costs $Y/mo but pays $Z/mo. Margin: NEGATIVE."`,
  temperature: 0.3,

  verdictLabels: {
    high: 'MARGIN AT RISK',
    medium: 'OPTIMIZE PRICING',
    low: 'WELL PRICED',
  },

  tweetTemplates: [
    'Are you charging enough to cover your AI costs? I built a free tool that analyzes your app, calculates margin per user, finds pricing mistakes, and recommends a profitable tier structure. 8 pricing models compared. Try it: {url}',
    'One power user can bankrupt your AI SaaS. I built a free tool that calculates your cost per user, margin per tier, and recommends pricing that protects your business. Try it: {url}',
    'Most AI SaaS founders dont know their cost per user. I built a free tool that calculates it, flags margin-killing pricing mistakes, and recommends a profitable tier structure. {url}',
  ],

  emailSubject: 'Your AI pricing strategy analysis',

  keywords: ['pricing strategy', 'AI SaaS pricing', 'token cost margin', 'SaaS pricing', 'unit economics'],
};

// ============================================================
// REGISTRY
// ============================================================
export const TOOL_REGISTRY: ToolConfig[] = [
  autoscore,
  buildVsBuy,
  startupIdeaValidator,
  tokenCalculator,
  pricingAdvisor,
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
