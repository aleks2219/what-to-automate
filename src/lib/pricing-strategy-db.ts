// Knowledge base for the AI Pricing Strategy Advisor tool.
// Real-world pricing models, token cost patterns, margin benchmarks,
// and anti-patterns that kill AI SaaS businesses.

export interface PricingModel {
  id: string;
  name: string;
  description: string;
  howItWorks: string;
  pros: string[];
  cons: string[];
  bestFor: string;
  avoidFor: string;
  examples: string[];
  tokenCostRisk: 'low' | 'medium' | 'high' | 'extreme';
  marginProfile: string;
}

export const PRICING_MODELS: PricingModel[] = [
  {
    id: 'flat-subscription',
    name: 'Flat Subscription (unlimited)',
    description: 'Users pay a fixed monthly fee for unlimited AI usage. The simplest model but the most dangerous for AI apps.',
    howItWorks: '$20/mo for unlimited AI queries. Every user pays the same regardless of usage.',
    pros: ['Simple to understand', 'Predictable revenue', 'Users love "unlimited"', 'Easy to sell'],
    cons: ['Power users can cost 10-100x more than they pay', 'No natural usage brake', 'Token costs scale linearly, revenue does not', 'One viral user can bankrupt you'],
    bestFor: 'Apps with naturally bounded usage (1-2 queries/day per user) and low token costs (<$0.01/query)',
    avoidFor: 'Apps with unbounded usage, expensive models (>=$0.05/query), or power-user skew',
    examples: ['ChatGPT Plus ($20/mo, but OpenAI absorbs massive losses on power users)', 'Midjourney ($10-60/mo, bounded by GPU compute limits)'],
    tokenCostRisk: 'extreme',
    marginProfile: '80% of users are profitable at 90%+ margin. 20% of power users may cost more than they pay. 1% of extreme users can cost 10x their subscription. Overall margin: 40-70% if usage is naturally bounded, negative if not.',
  },
  {
    id: 'tiered-subscription',
    name: 'Tiered Subscription (with usage caps)',
    description: 'Multiple pricing tiers with increasing usage limits. The most common and safest AI SaaS model.',
    howItWorks: 'Free: 50 queries/mo. Pro ($20/mo): 500 queries/mo. Business ($100/mo): 5000 queries/mo. Enterprise (custom): unlimited.',
    pros: ['Natural usage brake (caps protect margin)', 'Upsell path (users upgrade when they hit caps)', 'Segmented by user value', 'Predictable costs per tier'],
    cons: ['Users hate hitting limits', 'Requires usage tracking infrastructure', 'Cap setting is a guessing game', 'Free tier can be expensive if abused'],
    bestFor: 'Most AI SaaS apps. The default recommendation for any app with variable usage.',
    avoidFor: 'Apps where usage is truly unpredictable or where caps would kill the product experience',
    examples: ['OpenAI API (tiered by usage volume)', 'Jasper ($49-125/mo with word limits)', 'Copy.ai ($36-186/mo with seat + word limits)'],
    tokenCostRisk: 'low',
    marginProfile: 'Free tier: negative margin (CAC investment). Pro tier: 60-80% margin. Business tier: 70-85% margin. Enterprise: 80-90% margin. Overall: 60-80% with properly set caps.',
  },
  {
    id: 'usage-based',
    name: 'Pure Usage-Based (pay per token/query)',
    description: 'Users pay exactly for what they use. No subscription. Like a utility bill.',
    howItWorks: '$0.02 per AI query. Or $0.001 per 1K tokens processed. Users pay at end of month based on actual usage.',
    pros: ['Margin is always positive (users pay = your cost + markup)', 'No power user risk', 'Scales perfectly with usage', 'Fair: users pay for value received'],
    cons: ['Unpredictable revenue', 'Users hate unpredictable bills', 'Hard to budget for buyers', 'No recurring revenue (harder to value company)', 'Requires metering infrastructure'],
    bestFor: 'Developer tools, APIs, platforms where users understand token costs. Apps with high-variance usage patterns.',
    avoidFor: 'Consumer apps, non-technical users, apps where users need predictable monthly costs',
    examples: ['OpenAI API (pay per token)', 'Anthropic API (pay per token)', 'Replicate (pay per second of compute)', 'AWS Bedrock (pay per token)'],
    tokenCostRisk: 'low',
    marginProfile: 'Always positive if markup > 0. Typical markup: 20-100% over raw token cost. Margin: 20-50% (lower than subscription because no "unused" revenue).',
  },
  {
    id: 'hybrid-subscription-usage',
    name: 'Hybrid (subscription + usage overage)',
    description: 'Flat subscription with included usage, then pay-per-use for overage. Best of both worlds.',
    howItWorks: '$20/mo includes 500 queries. Additional queries at $0.05 each. Users get predictable base cost + pay for extra usage.',
    pros: ['Predictable base revenue', 'Power users pay their fair share', 'Natural upsell (hit cap -> pay more or upgrade)', 'No power user bankruptcy risk'],
    cons: ['Complex to explain to users', 'Requires metering + billing infrastructure', 'Overage pricing must feel fair (not punitive)', 'Two billing systems to maintain'],
    bestFor: 'Apps with a mix of light and heavy users. The most profitable AI SaaS model when done right.',
    avoidFor: 'Apps where usage is binary (either you use it or you dont), or where overage would feel punitive',
    examples: ['OpenAI ChatGPT Plus + API ($20/mo + API costs)', 'Notion AI ($8/mo member + usage limits, then rate limited)', 'GitHub Copilot ($10/mo with usage limits)'],
    tokenCostRisk: 'low',
    marginProfile: 'Base subscription: 60-80% margin (most users stay under cap). Overage: 40-60% margin (lower markup on overage). Overall: 60-75%. Highest LTV because power users self-select into paying more.',
  },
  {
    id: 'per-seat',
    name: 'Per-Seat (team pricing)',
    description: 'Charge per user per month. Common for B2B SaaS but dangerous for AI apps.',
    howItWorks: '$15/user/month. Each team member gets unlimited AI features. Team of 10 = $150/mo.',
    pros: ['Familiar B2S model', 'Scales with team size', 'Easy to sell (per-seat is standard)', 'Predictable revenue per customer'],
    cons: ['One power user on a 50-seat account can eat the margin for all 50 seats', 'No usage brake per user', 'Token costs don\'t scale linearly with seats', 'Encourages account sharing'],
    bestFor: 'Apps where per-user usage is naturally low and similar across users (e.g., meeting notes, email drafting)',
    avoidFor: 'Apps with high variance in per-user usage, or where one user type (e.g., analyst) uses 100x more than others (e.g., sales rep)',
    examples: ['Notion AI ($8/member/mo)', 'Duo Security ($12/user/mo, not AI but per-seat model)', 'Grammarly Business ($15/user/mo)'],
    tokenCostRisk: 'medium',
    marginProfile: 'If all users are similar: 70-85% margin. If power users exist: 40-60% margin (power user costs subsidized by light users). Risk: one account with 1 power user + 49 light users looks profitable but the power user eats 80% of token costs.',
  },
  {
    id: 'credits',
    name: 'Credit System (prepaid usage)',
    description: 'Users buy credits. Each AI action costs credits. Credits expire or roll over.',
    howItWorks: 'Buy 1000 credits for $10. Each AI query costs 5-50 credits depending on model. Complex queries cost more.',
    pros: ['Margin always positive (prepaid)', 'Natural usage brake', 'Users can see cost per action', 'Flexible (charge more for expensive models)'],
    cons: ['Users hate "running out"', 'Credit-to-value mapping is confusing', 'Requires credit tracking + expiry logic', 'Friction at purchase (must buy before using)'],
    bestFor: 'Apps with mixed model usage (cheap + expensive models), creative tools, apps where users understand "credits"',
    avoidFor: 'Apps where users expect unlimited, subscription-style experiences',
    examples: ['Midjourney (fast hours = credits)', 'Replicate (credits per compute)', 'Hugging Face (compute credits)'],
    tokenCostRisk: 'low',
    marginProfile: 'Always positive (prepaid). Unused credits = pure profit. Typical: 30-50% of credits never used. Effective margin: 60-80% including unused credits.',
  },
  {
    id: 'freemium-usage-limited',
    name: 'Freemium (free tier with hard limits)',
    description: 'Free tier with strict usage limits. Paid tier removes limits or adds features.',
    howItWorks: 'Free: 10 queries/day (enough to try). Pro ($20/mo): 500 queries/day + better models + no rate limiting.',
    pros: ['Low CAC (free users spread word)', 'Natural upgrade trigger (hit limit -> pay)', 'Free tier cost is bounded by limits', 'Best for viral growth'],
    cons: ['Free tier costs money (token costs for non-paying users)', 'Conversion rate typically 2-5%', 'Free users can abuse (multiple accounts)', 'Must set limits carefully (too low = churn, too high = costly)'],
    bestFor: 'Consumer apps, apps with viral potential, apps where the free tier demonstrates enough value to convert',
    avoidFor: 'B2B enterprise apps, apps with high per-query token costs (>$0.05), apps where free users don\'t convert',
    examples: ['ChatGPT (free GPT-4o-mini, paid for GPT-4o)', 'Perplexity (free basic, paid Pro)', 'Claude.ai (free limited, paid Pro)'],
    tokenCostRisk: 'medium',
    marginProfile: 'Free tier: 100% negative margin (cost center). Paid tier: 70-85% margin. Break-even at 3-5% conversion rate. If free tier costs $0.02/query and paid tier is $20/mo, need 1 paid user per 33 free users to break even.',
  },
  {
    id: 'value-based',
    name: 'Value-Based (percentage of value created)',
    description: 'Charge based on the value the AI creates. The hardest to implement but highest margin.',
    howItWorks: 'AI saves $500/mo in labor? Charge $100/mo (20% of value saved). Or: AI generates leads worth $50 each? Charge $10 per lead.',
    pros: ['Highest margin (price tied to value, not cost)', 'Aligns incentives (you win when they win)', 'No token cost risk (price far exceeds cost)', 'Hard to compete against (custom pricing)'],
    cons: ['Requires measuring value (hard)', 'Custom pricing doesn\'t scale', 'Sales-heavy (can\'t self-serve)', 'Buyers resist "percentage" models'],
    bestFor: 'Apps with clear, measurable ROI (cost savings, revenue generation, time saved). Enterprise. Niche verticals.',
    avoidFor: 'Apps where value is subjective, consumer apps, self-serve products',
    examples: ['Klarna (takes % of transaction)', 'Affirm (interest on BNPL)', 'Some AI consulting tools (charge per document processed, where document value is $500+)'],
    tokenCostRisk: 'low',
    marginProfile: '80-95% margin. Token costs are irrelevant when price is tied to value. Example: AI processes a legal contract worth $2000 in lawyer time. Charge $200. Token cost: $0.50. Margin: 99.75%.',
  },
];

// ============ TOKEN COST PATTERNS ============
// Real-world cost estimates per query for common AI app types
export const TOKEN_COST_PATTERNS = [
  {
    appType: 'Chatbot (simple Q&A)',
    avgInputTokens: 500,
    avgOutputTokens: 200,
    typicalModel: 'GPT-4.1 mini',
    costPerQuery: 0.00028,
    costPer1000Queries: 0.28,
    notes: 'Simple FAQ bot. Most queries are short. Budget model is fine.',
  },
  {
    appType: 'Chatbot (complex reasoning)',
    avgInputTokens: 2000,
    avgOutputTokens: 1000,
    typicalModel: 'Claude Sonnet 4',
    costPerQuery: 0.021,
    costPer1000Queries: 21,
    notes: 'Complex support, technical questions. Needs frontier model. 75x more expensive than simple bot.',
  },
  {
    appType: 'Document analysis (RAG)',
    avgInputTokens: 8000,
    avgOutputTokens: 500,
    typicalModel: 'Claude Sonnet 4 (with caching)',
    costPerQuery: 0.0075,
    costPer1000Queries: 7.5,
    notes: 'With prompt caching: $0.30/M cached input. Without: $0.024/query. 3.2x savings with caching.',
  },
  {
    appType: 'Code generation',
    avgInputTokens: 3000,
    avgOutputTokens: 1500,
    typicalModel: 'Claude Sonnet 4',
    costPerQuery: 0.0315,
    costPer1000Queries: 31.5,
    notes: 'Multi-file context + long output. Expensive but high value (replaces $100/hr developer).',
  },
  {
    appType: 'Image generation',
    avgInputTokens: 50,
    avgOutputTokens: 0,
    typicalModel: 'Flux Pro',
    costPerQuery: 0.055,
    costPer1000Queries: 55,
    notes: 'Per-image pricing, not per-token. High cost per unit but high perceived value.',
  },
  {
    appType: 'Classification / extraction',
    avgInputTokens: 1000,
    avgOutputTokens: 100,
    typicalModel: 'GPT-4.1 nano',
    costPerQuery: 0.00014,
    costPer1000Queries: 0.14,
    notes: 'Cheapest common use case. High volume, low cost. Can process 100K docs for $14.',
  },
  {
    appType: 'Agent (multi-step reasoning)',
    avgInputTokens: 10000,
    avgOutputTokens: 3000,
    typicalModel: 'o3-mini',
    costPerQuery: 0.242,
    costPer1000Queries: 242,
    notes: 'Agents make multiple LLM calls. Reasoning tokens add up. Most expensive common use case. 860x more than classification.',
  },
  {
    appType: 'Transcription + summarization',
    avgInputTokens: 5000,
    avgOutputTokens: 800,
    typicalModel: 'Gemini 2.5 Flash',
    costPerQuery: 0.00123,
    costPer1000Queries: 1.23,
    notes: 'Audio input + text summary. Gemini is cheapest for multimodal.',
  },
  {
    appType: 'Embedding (for RAG)',
    avgInputTokens: 500,
    avgOutputTokens: 0,
    typicalModel: 'text-embedding-3-small',
    costPerQuery: 0.000065,
    costPer1000Queries: 0.065,
    notes: 'Embeddings are very cheap. 15x cheaper than classification. Main cost is the vector DB, not the embedding.',
  },
  {
    appType: 'Translation',
    avgInputTokens: 2000,
    avgOutputTokens: 2000,
    typicalModel: 'GPT-4.1 mini',
    costPerQuery: 0.004,
    costPer1000Queries: 4,
    notes: 'Input = output length for translation. Mid-tier model is fine for most languages.',
  },
];

// ============ MARGIN BENCHMARKS ============
export const MARGIN_BENCHMARKS = [
  {
    category: 'AI SaaS (overall)',
    grossMargin: '60-80%',
    notes: 'Healthy AI SaaS targets 70%+ gross margin. Below 50% is unsustainable. Token costs typically 15-35% of revenue.',
    warning: 'Below 40% margin = you are essentially reselling API access. Add more value or raise prices.',
  },
  {
    category: 'AI Chatbot SaaS',
    grossMargin: '50-75%',
    notes: 'Lower margin because chat is high-frequency + high-token. Caching is essential to maintain margin.',
    warning: 'Without caching, margins drop to 30-40%. With caching (90% hit rate), margins recover to 65-75%.',
  },
  {
    category: 'AI Document Processing',
    grossMargin: '70-85%',
    notes: 'Higher margin because documents are high-value (legal, financial) and users pay per document, not per query.',
    warning: 'Watch RAG costs. Without caching, re-embedding + re-retrieving documents 100x/month is expensive.',
  },
  {
    category: 'AI Code Generation',
    grossMargin: '75-90%',
    notes: 'Highest margin because code generation saves $100+/hr developer time. Users pay for value, not tokens.',
    warning: 'Quality is everything. If generated code quality drops 10%, churn spikes 30%. Don\'t sacrifice quality for token savings.',
  },
  {
    category: 'AI Image Generation',
    grossMargin: '40-60%',
    notes: 'Lower margin because image generation is expensive ($0.055/image) and users expect unlimited for cheap.',
    warning: 'Hard to charge more than $0.10/image to consumers. Must use credits or strict limits. Consider self-hosting Flux to cut costs 80%.',
  },
  {
    category: 'AI Agent Platform',
    grossMargin: '40-65%',
    notes: 'Agents make multiple LLM calls (5-20 per task). Token costs are 5-20x higher than single-query apps.',
    warning: 'Agent costs are unpredictable. Must use usage-based pricing or strict credit systems. Flat subscription = bankruptcy risk.',
  },
];

// ============ COMMON PRICING MISTAKES ============
export const PRICING_MISTAKES = [
  {
    mistake: 'Pricing too low to "compete with ChatGPT"',
    impact: 'You are not OpenAI. You cannot absorb $100M/year in token losses. ChatGPT Plus is $20/mo because OpenAI makes it up on enterprise + API. You cant.',
    fix: 'Price based on YOUR costs + margin, not what OpenAI charges. If your cost per user is $5/mo, charge at least $15/mo (3x cost = 67% margin).',
    severity: 'fatal',
  },
  {
    mistake: 'Offering "unlimited" on a flat plan',
    impact: 'One power user generating 10K queries/day at $0.02/query = $6,000/mo in token costs on a $20/mo subscription. You lose $5,980/mo on one user.',
    fix: 'Never offer true unlimited. Set a generous cap (e.g., 1000 queries/day) that covers 99% of users but prevents abuse. Use hybrid model with overage.',
    severity: 'fatal',
  },
  {
    mistake: 'Not modeling power-user skew',
    impact: 'In most AI apps, the top 1% of users consume 50%+ of total tokens. The top 10% consume 80%+. If your pricing doesn\'t account for this, power users eat all your margin.',
    fix: 'Model your usage distribution. Assume top 1% uses 50x the median. Set caps or pricing tiers that make power users profitable. Track the 90th percentile cost per user.',
    severity: 'high',
  },
  {
    mistake: 'Using frontier models for everything',
    impact: 'Using GPT-4.1 ($2/M input) for simple classification when GPT-4.1 nano ($0.10/M input) would work = 20x cost increase for zero quality difference.',
    fix: 'Audit every feature. Route simple tasks to budget models, complex tasks to frontier. Use a model router. Typical split: 80% budget, 15% mid, 5% frontier.',
    severity: 'high',
  },
  {
    mistake: 'No prompt caching',
    impact: 'RAG apps that send the same system prompt + context on every query pay full price every time. With caching, 90% of input tokens cost 10% of the price.',
    fix: 'Enable prompt caching on Anthropic (90% discount) or OpenAI (75% discount). For RAG, cache the system prompt + retrieved documents. Break-even: if the same context is used 2+ times within the TTL.',
    severity: 'high',
  },
  {
    mistake: 'Not tracking cost per user',
    impact: 'You don\'t know which users are profitable and which are bleeding money. You can\'t set prices without knowing cost per user.',
    fix: 'Log token usage per user. Calculate cost per user per month. Segment by free/paid/power. If any segment has negative margin, adjust caps or pricing for that segment.',
    severity: 'high',
  },
  {
    mistake: 'Free tier too generous',
    impact: 'Free tier with 100 queries/day at $0.02/query = $60/mo per free user. If you have 10,000 free users, that\'s $600K/mo in token costs for zero revenue.',
    fix: 'Free tier should cost < $0.50/user/month. Use cheapest model (Gemini Flash free tier, GPT-4.1 nano). Cap at 10-20 queries/day. Consider rate limiting aggressively on free.',
    severity: 'medium',
  },
  {
    mistake: 'Ignoring output token costs',
    impact: 'Output tokens cost 4-8x more than input. A model generating 2000 output tokens costs 4-8x more than 2000 input tokens. Long responses eat margin.',
    fix: 'Set max_tokens limits. Use structured outputs (JSON) instead of verbose text. Constrain response length in system prompt. Every 100 output tokens you eliminate saves 4-8x what 100 input tokens cost.',
    severity: 'medium',
  },
  {
    mistake: 'Not setting spending limits',
    impact: 'A bug in your code can create an infinite loop that calls the API 1000x/second. At $0.02/query, that\'s $20/second = $72,000/hour. One bug can bankrupt you.',
    fix: 'Set hard spending limits on every provider account. OpenAI: hard limit in dashboard. Anthropic: spending alerts. Set at 2x expected monthly spend. Implement circuit breakers in your code.',
    severity: 'fatal',
  },
  {
    mistake: 'Pricing based on competitor prices',
    impact: 'Your competitor might have 10x your volume (lower unit costs), different model mix, or be losing money on purpose. Copying their prices can destroy your margin.',
    fix: 'Price based on YOUR costs + desired margin. Then check if your price is competitive. If your costs are too high to be competitive, fix costs first (model routing, caching, compression).',
    severity: 'medium',
  },
];

// ============ PRICING TIER TEMPLATES ============
export const PRICING_TIER_TEMPLATES = [
  {
    template: 'AI SaaS Standard',
    tiers: [
      { name: 'Free', price: '$0', limits: '10 queries/day, budget model only', targetMargin: 'N/A (CAC investment)', targetCost: '<$0.10/user/mo' },
      { name: 'Pro', price: '$19/mo', limits: '500 queries/day, mid-tier model', targetMargin: '70%', targetCost: '<$5.70/user/mo' },
      { name: 'Business', price: '$49/mo', limits: '2000 queries/day, frontier model', targetMargin: '75%', targetCost: '<$12.25/user/mo' },
      { name: 'Enterprise', price: 'Custom', limits: 'Custom caps, dedicated support, SLA', targetMargin: '80%', targetCost: 'varies' },
    ],
    notes: 'Safest default for most AI SaaS. Caps protect margin. Clear upgrade path. Pro tier at $19/mo is the sweet spot for individual users.',
  },
  {
    template: 'AI API / Developer Tool',
    tiers: [
      { name: 'Free', price: '$0', limits: '1000 requests/mo, rate limited', targetMargin: 'N/A', targetCost: '<$0.50/user/mo' },
      { name: 'Starter', price: '$29/mo', limits: '50K requests/mo', targetMargin: '60%', targetCost: '<$11.60/user/mo' },
      { name: 'Growth', price: '$99/mo', limits: '250K requests/mo', targetMargin: '70%', targetCost: '<$29.70/user/mo' },
      { name: 'Scale', price: '$299/mo', limits: '1M requests/mo', targetMargin: '75%', targetCost: '<$74.75/user/mo' },
      { name: 'Enterprise', price: 'Custom', limits: 'Unlimited, dedicated support', targetMargin: '80%', targetCost: 'varies' },
    ],
    notes: 'For developer-facing tools. Price per request, not per token. Markup: 2-3x raw API cost. Higher tiers get volume discount.',
  },
  {
    template: 'AI Creative Tool',
    tiers: [
      { name: 'Free', price: '$0', limits: '5 generations/day, watermarked', targetMargin: 'N/A', targetCost: '<$0.30/user/mo' },
      { name: 'Creator', price: '$12/mo', limits: '100 generations/day, no watermark', targetMargin: '55%', targetCost: '<$5.40/user/mo' },
      { name: 'Pro', price: '$29/mo', limits: '500 generations/day, priority queue', targetMargin: '65%', targetCost: '<$10.15/user/mo' },
      { name: 'Studio', price: '$99/mo', limits: 'Unlimited, API access, team seats', targetMargin: '70%', targetCost: '<$29.70/user/mo' },
    ],
    notes: 'For image/video/audio generation. Credits or daily limits are essential. Watermark on free creates upgrade pressure. Studio tier for agencies.',
  },
  {
    template: 'AI Enterprise Platform',
    tiers: [
      { name: 'Pilot', price: '$500/mo', limits: '5 seats, 50K queries/mo, single workspace', targetMargin: '70%', targetCost: '<$150/user/mo' },
      { name: 'Team', price: '$2,000/mo', limits: '25 seats, 250K queries/mo, SSO', targetMargin: '75%', targetCost: '<$500/user/mo' },
      { name: 'Business', price: '$5,000/mo', limits: '100 seats, 1M queries/mo, audit logs', targetMargin: '80%', targetCost: '<$1,000/user/mo' },
      { name: 'Enterprise', price: 'Custom ($10K+)', limits: 'Unlimited, on-prem option, dedicated support, SLA', targetMargin: '85%', targetCost: 'varies' },
    ],
    notes: 'For B2B enterprise AI platforms. High ACV, low volume, high margin. Sales-led. Emphasize security, compliance, and support over price.',
  },
];
