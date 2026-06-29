// Knowledge base for the Startup Idea Validator tool.
// Common startup patterns, failure modes, and evaluation criteria.
// The AI uses this to give honest, specific feedback instead of generic advice.

export interface StartupPattern {
  id: string;
  pattern: string;           // Keywords that match this pattern
  category: string;
  difficulty: 'easy' | 'moderate' | 'hard' | 'very-hard';
  marketSaturation: 'blue-ocean' | 'emerging' | 'growing' | 'saturated' | 'oversaturated';
  typicalCapitalNeeded: string;
  timeToRevenue: string;
  keyRisks: string[];
  successFactors: string[];
  examples: string[];         // Real companies in this space
  redFlags: string[];         // Common reasons these fail
}

export const STARTUP_PATTERNS: StartupPattern[] = [
  {
    id: 'ai-wrapper',
    pattern: 'AI tool, GPT wrapper, AI app, ChatGPT for, AI-powered, AI assistant, LLM app',
    category: 'AI Wrapper / GPT Application',
    difficulty: 'easy',
    marketSaturation: 'oversaturated',
    typicalCapitalNeeded: '$0-50K (can bootstrap)',
    timeToRevenue: 'Weeks to months',
    keyRisks: [
      'OpenAI/Anthropic can release the same feature natively',
      'No defensible moat — anyone can copy in a weekend',
      'API costs can eat margins at scale',
      'Distribution is the real challenge, not the tech',
    ],
    successFactors: [
      'Solve a specific vertical workflow, not general chat',
      'Build proprietary data flywheel (user data improves output)',
      'Own distribution channel (audience, partnership, SEO)',
      'Move fast — the window for AI wrappers is closing',
    ],
    examples: ['Jasper (writing), Midjourney (images), Copy.ai (marketing), Perplexity (search)'],
    redFlags: [
      '"It\'s like ChatGPT but for X" — this is not a business, it\'s a feature',
      'No distribution plan beyond "post on Twitter"',
      'Relies entirely on one API provider with no fallback',
      'Targeting developers who can build it themselves',
    ],
  },
  {
    id: 'marketplace',
    pattern: 'marketplace, platform, two-sided market, connect buyers and sellers, Uber for, Airbnb for',
    category: 'Two-Sided Marketplace',
    difficulty: 'very-hard',
    marketSaturation: 'saturated',
    typicalCapitalNeeded: '$500K-5M (chicken-and-egg problem)',
    timeToRevenue: '6-18 months (need critical mass)',
    keyRisks: [
      'Cold start problem — need both sides simultaneously',
      'Liquidity takes time — marketplace without liquidity is useless',
      'Disintermediation — users bypass platform after first match',
      'Winner-take-all dynamics — second place has no value',
    ],
    successFactors: [
      'Start with supply-constrained side (usually harder to get)',
      'Niche down to one vertical before expanding',
      'Subsidize one side early (free for suppliers, pay for demand)',
      'Build trust mechanisms (reviews, escrow, guarantees)',
    ],
    examples: ['Airbnb (travel), Uber (transport), Fiverr (freelance), StockX (sneakers)'],
    redFlags: [
      '"Uber for X" without understanding why Uber worked (density + frequency)',
      'No plan for the cold start problem',
      'Low-frequency transactions (hard to build habits)',
      'No geographic or vertical density strategy',
    ],
  },
  {
    id: 'saas-b2b',
    pattern: 'SaaS, software as a service, B2B software, business tool, enterprise software, B2B platform',
    category: 'B2B SaaS',
    difficulty: 'moderate',
    marketSaturation: 'growing',
    typicalCapitalNeeded: '$50K-500K (can bootstrap with revenue)',
    timeToRevenue: '1-6 months (first paying customer)',
    keyRisks: [
      'Sales cycle can be 3-12 months for enterprise',
      'High CAC if you don\'t have distribution',
      'Churn kills — need <5% monthly churn for healthy growth',
      'Feature creep — building what prospects ask for, not what they\'ll pay for',
    ],
    successFactors: [
      'Solve a painful, expensive problem (people pay for pain relief)',
      'Clear ROI that the buyer can calculate',
      'Bottom-up adoption (free tier → team → enterprise)',
      'Integrates with existing stack (Salesforce, Slack, etc.)',
    ],
    examples: ['Notion, Calendly, Loom, Linear, Retool'],
    redFlags: [
      '"Better than [incumbent]" without 10x improvement in one dimension',
      'Targeting SMBs with no budget for new tools',
      'No clear buyer (who signs the check?)',
      'Solving a "nice to have" not a "must have"',
    ],
  },
  {
    id: 'consumer-app',
    pattern: 'app, mobile app, consumer app, social app, fitness app, productivity app, dating app',
    category: 'Consumer App',
    difficulty: 'hard',
    marketSaturation: 'oversaturated',
    typicalCapitalNeeded: '$100K-2M (need marketing budget)',
    timeToRevenue: '6-12+ months (need users first, then monetize)',
    keyRisks: [
      'User acquisition is incredibly expensive (CAC $5-50 per user)',
      'High churn — most apps lose 90% of users in 30 days',
      'App store discovery is broken — need external distribution',
      'Monetization is hard — consumers hate paying for apps',
    ],
    successFactors: [
      'Viral loop built into the product (each user brings others)',
      'Daily use habit (not monthly)',
      'Clear monetization from day 1 (subscription, marketplace, ads)',
      'Own a community or audience before launching',
    ],
    examples: ['BeReal, Wordle, Strava, Duolingo, Threads'],
    redFlags: [
      '"It\'s like Instagram but for X" — why would users switch?',
      'No viral coefficient (K > 1 needed for organic growth)',
      'Relying on app store discovery for distribution',
      'No monetization plan beyond "ads" or "premium features"',
    ],
  },
  {
    id: 'ecommerce-dtc',
    pattern: 'e-commerce, online store, DTC, direct to consumer, physical product, brand, shopify',
    category: 'E-Commerce / DTC Brand',
    difficulty: 'moderate',
    marketSaturation: 'saturated',
    typicalCapitalNeeded: '$10K-100K (inventory + ads)',
    timeToRevenue: '1-3 months (first sale)',
    keyRisks: [
      'CAC is rising — Facebook/Google ads get more expensive every year',
      'Inventory risk — cash tied up in unsold stock',
      'Margin compression — competing on price is a race to the bottom',
      'Supply chain complexity — shipping, returns, quality control',
    ],
    successFactors: [
      'Strong brand identity that resonates with a specific community',
      'Product differentiation (not just another private-label product)',
      'Own distribution channel (email list, social following, community)',
      'Healthy unit economics (LTV > 3x CAC)',
    ],
    examples: ['Glossier, Allbirds, Warby Parker, Liquid Death, Olipop'],
    redFlags: [
      'Selling commodity products with a logo slapped on',
      'No community or audience before launching',
      'Relying entirely on paid ads for distribution',
      'Thin margins (< 30%) with no path to improve',
    ],
  },
  {
    id: 'fintech',
    pattern: 'fintech, payments, banking, lending, insurance, crypto, investing, financial platform',
    category: 'Fintech',
    difficulty: 'very-hard',
    marketSaturation: 'saturated',
    typicalCapitalNeeded: '$1M-10M+ (regulatory + compliance)',
    timeToRevenue: '6-24 months (licensing takes forever)',
    keyRisks: [
      'Regulatory complexity — need licenses in every jurisdiction',
      'Compliance costs are enormous (KYC, AML, SOC 2)',
      'Trust is everything — one breach kills the company',
      'Capital requirements for lending products',
    ],
    successFactors: [
      'Partner with existing regulated entity (BaaS, sponsor bank)',
      'Find a regulatory arbitrage or underserved niche',
      'Build trust through transparency + security from day 1',
      'Have compliance expertise on the founding team',
    ],
    examples: ['Stripe, Ramp, Brex, Plaid, Chime, Robinhood'],
    redFlags: [
      'No one on the team understands financial regulation',
      'Solving a problem banks already solve adequately',
      'No plan for compliance, KYC, or AML',
      'Underestimating the cost and time of licensing',
    ],
  },
  {
    id: 'healthtech',
    pattern: 'healthtech, health, medical, healthcare, telemedicine, wellness, fitness tracker, patient',
    category: 'HealthTech / Wellness',
    difficulty: 'very-hard',
    marketSaturation: 'growing',
    typicalCapitalNeeded: '$500K-5M (clinical validation + FDA)',
    timeToRevenue: '12-36 months (if regulated)',
    keyRisks: [
      'HIPAA compliance is non-negotiable and expensive',
      'FDA approval for medical devices/software takes years',
      'Reimbursement (getting insurance to pay) is complex',
      'Patient data liability is enormous',
    ],
    successFactors: [
      'Start with wellness (unregulated) before medical (regulated)',
      'Partner with healthcare systems for distribution + credibility',
      'Have clinical evidence to back claims',
      'Understand the reimbursement landscape before building',
    ],
    examples: ['Hims, Calm, Headspace, Hinge Health, Oura'],
    redFlags: [
      'Making medical claims without FDA clearance',
      'No HIPAA compliance plan',
      'No healthcare expertise on the team',
      'Selling to patients instead of providers (harder monetization)',
    ],
  },
  {
    id: 'edtech',
    pattern: 'edtech, education, learning, course, teaching, tutoring, training, school, student',
    category: 'EdTech',
    difficulty: 'moderate',
    marketSaturation: 'saturated',
    typicalCapitalNeeded: '$10K-200K (can bootstrap)',
    timeToRevenue: '1-3 months (first paying student)',
    keyRisks: [
      'Users expect free content (YouTube, Khan Academy)',
      'Completion rates are terrible (< 10% for most online courses)',
      'B2B education sales cycles are long (school districts)',
      'Content becomes outdated quickly in tech fields',
    ],
    successFactors: [
      'Own a niche audience before building (newsletter, YouTube, community)',
      'Prove demand with a paid cohort before building software',
      'Focus on outcomes (jobs, certifications) not just content',
      'Community > content — peer learning drives completion',
    ],
    examples: ['MasterClass, Duolingo, Codecademy, Maven, Brilliant'],
    redFlags: [
      'Building a course platform when Teachable/Thinkific exist',
      'No audience to sell to',
      '"It\'s like Duolingo but for X" — Duolingo works because of gamification + massive investment',
      'Solving for "access to education" when the problem is motivation, not access',
    ],
  },
  {
    id: 'developer-tool',
    pattern: 'developer tool, dev tool, API, SDK, framework, library, CLI, infrastructure, devops',
    category: 'Developer Tool / Infrastructure',
    difficulty: 'hard',
    marketSaturation: 'growing',
    typicalCapitalNeeded: '$100K-1M (open source → commercial)',
    timeToRevenue: '6-18 months (open source adoption first)',
    keyRisks: [
      'Open source users rarely pay — conversion is < 1%',
      'Competing with free (open source alternatives)',
      'Developer audience is small and expensive to reach',
      'Cloud providers can offer the same feature natively',
    ],
    successFactors: [
      'Build open source community first (GitHub stars, contributors)',
      'Solve a painful problem developers complain about',
      'Open core model (free OSS, paid enterprise features)',
      'Developer advocates + community building > sales',
    ],
    examples: ['Vercel, Supabase, HashiCorp, Sentry, PostHog'],
    redFlags: [
      'No open source strategy — developers won\'t pay for closed tools',
      'Solving a problem that cloud providers already solve',
      'No distribution beyond "post on Hacker News"',
      'Competing on features, not developer experience',
    ],
  },
  {
    id: 'content-creator',
    pattern: 'newsletter, content creator, media, blog, podcast, YouTube, content platform, creator economy',
    category: 'Content / Creator Economy',
    difficulty: 'easy',
    marketSaturation: 'growing',
    typicalCapitalNeeded: '$0-10K (can start for free)',
    timeToRevenue: '3-12 months (need audience first)',
    keyRisks: [
      'Audience building takes time — no shortcuts',
      'Platform risk (algorithm changes, account bans)',
      'Monetization is hard below 10K engaged followers',
      'Burnout from content treadmill',
    ],
    successFactors: [
      'Pick a niche you can own (not "tech" but "devops for startups")',
      'Consistency > quality early on (ship daily/weekly)',
      'Own your audience (email list > social followers)',
      'Multiple revenue streams (ads, sponsorships, products, courses)',
    ],
    examples: ['Morning Brew, Stratechery, Lenny\'s Newsletter, Milk Road'],
    redFlags: [
      'Starting a newsletter about a topic you don\'t care about',
      'No differentiation from existing creators in the space',
      'Relying on one platform (YouTube algorithm change = business dies)',
      'Expecting revenue in month 1',
    ],
  },
  {
    id: 'community-platform',
    pattern: 'community platform, social network, community app, group platform, membership, forum',
    category: 'Community / Social Platform',
    difficulty: 'very-hard',
    marketSaturation: 'saturated',
    typicalCapitalNeeded: '$100K-1M (need critical mass)',
    timeToRevenue: '6-18 months (need community first)',
    keyRisks: [
      'Cold start problem — empty communities die',
      'Moderation is expensive and never-ending',
      'Network effects mean winner-take-all',
      'Monetization without alienating members is tricky',
    ],
    successFactors: [
      'Start as a Discord/Slack group before building software',
      'Curate the first 100 members carefully (quality > quantity)',
      'Have a clear purpose that brings people back daily',
      'Monetize with membership, not ads',
    ],
    examples: ['Circle, Geneva, Geneva, Discord, Reddit'],
    redFlags: [
      'Building a community platform before having a community',
      'No moderation plan',
      '"It\'s like Discord but better" — Discord is free and people love it',
      'No clear reason for daily engagement',
    ],
  },
  {
    id: 'hardware-iot',
    pattern: 'hardware, IoT, device, physical product, sensor, smart device, gadget, electronics',
    category: 'Hardware / IoT',
    difficulty: 'very-hard',
    marketSaturation: 'emerging',
    typicalCapitalNeeded: '$500K-5M (manufacturing + inventory)',
    timeToRevenue: '12-24 months (design → prototype → manufacture → ship)',
    keyRisks: [
      'Manufacturing is expensive and unforgiving',
      'Inventory risk — you pay upfront, sell later',
      'Supply chain disruptions can kill you',
      'Returns, warranty, support for physical products is expensive',
    ],
    successFactors: [
      'Start with software + off-the-shelf hardware before custom design',
      'Crowdfund to validate demand before manufacturing',
      'Have manufacturing expertise or partner on the team',
      'Plan for the full lifecycle (returns, warranty, end-of-life)',
    ],
    examples: ['Oura, Pebble (failed), Wyze, Eight Sleep'],
    redFlags: [
      'No hardware experience on the team',
      'Underestimating manufacturing costs and timelines',
      'No plan for returns, warranty, or support',
      'Solving a problem that doesn\'t need hardware',
    ],
  },
  {
    id: 'no-code-tool',
    pattern: 'no-code, low-code, builder, visual builder, template generator, website builder, app builder',
    category: 'No-Code / Low-Code Tool',
    difficulty: 'hard',
    marketSaturation: 'oversaturated',
    typicalCapitalNeeded: '$50K-500K',
    timeToRevenue: '3-12 months',
    keyRisks: [
      'Competing with Webflow, Bubble, Retool — well-funded incumbents',
      'No-code users are price-sensitive and churn-prone',
      'Maintaining visual builders is engineering-intensive',
      'AI is eating this space (just describe what you want → code generated)',
    ],
    successFactors: [
      'Pick a vertical no-code tool (e.g., "no-code for restaurants")',
      'AI-first approach (natural language > drag-drop)',
      'Own distribution to non-technical users',
      'Templates + onboarding that get users to "wow" in 5 minutes',
    ],
    examples: ['Webflow, Bubble, Retool, Glide, Softr'],
    redFlags: [
      'Building a general no-code tool — the market is won',
      'Competing on features with 100x better-funded incumbents',
      'No AI strategy (AI is the future of no-code)',
      'Targeting developers (they\'d rather write code)',
    ],
  },
];

// Helper: find matching patterns based on user's idea
export function findMatchingPatterns(userIdea: string): StartupPattern[] {
  const input = userIdea.toLowerCase();
  const matches = STARTUP_PATTERNS.filter((pattern) => {
    return pattern.pattern
      .split(',')
      .some((keyword) => input.includes(keyword.trim()));
  });
  return matches.length > 0 ? matches : [];
}
