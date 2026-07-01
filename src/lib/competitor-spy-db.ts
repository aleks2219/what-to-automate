// Knowledge base for the AI Stack Guesser / Competitor Intelligence tool.
// Tech signal patterns, cost models, and vulnerability patterns
// used to infer a competitor's AI stack from public signals.

export interface TechSignal {
  pattern: string;           // What to look for in page source / scripts
  signalType: 'script-src' | 'meta-tag' | 'api-endpoint' | 'job-keyword' | 'privacy-policy' | 'cookie' | 'header' | 'feature-observation';
  indicates: string;         // What this signal means
  aiTool?: string;           // Which AI tool/service this maps to
  category: string;           // Category of the detected tool
  confidence: 'high' | 'medium' | 'low';
}

// Patterns to detect in competitor's website source
export const TECH_SIGNALS: TechSignal[] = [
  // Chatbot / support widgets
  { pattern: 'intercom', signalType: 'script-src', indicates: 'Intercom widget detected', aiTool: 'Intercom', category: 'ai-support', confidence: 'high' },
  { pattern: 'intercomcdn', signalType: 'script-src', indicates: 'Intercom CDN loaded', aiTool: 'Intercom', category: 'ai-support', confidence: 'high' },
  { pattern: 'drift', signalType: 'script-src', indicates: 'Drift chatbot detected', aiTool: 'Drift', category: 'ai-support', confidence: 'high' },
  { pattern: 'tawk.to', signalType: 'script-src', indicates: 'Tawk.to chat widget', aiTool: 'Tawk.to', category: 'ai-support', confidence: 'high' },
  { pattern: 'crisp.chat', signalType: 'script-src', indicates: 'Crisp chat widget', aiTool: 'Crisp', category: 'ai-support', confidence: 'medium' },
  { pattern: 'zendesk', signalType: 'script-src', indicates: 'Zendesk helpdesk widget', aiTool: 'Zendesk', category: 'ai-support', confidence: 'high' },
  { pattern: 'hubspot', signalType: 'script-src', indicates: 'HubSpot tracking + chat', aiTool: 'HubSpot', category: 'crm', confidence: 'high' },
  { pattern: 'salesloft', signalType: 'script-src', indicates: 'Salesloft sales engagement', aiTool: 'Salesloft', category: 'ai-sales', confidence: 'high' },
  { pattern: 'outreach.io', signalType: 'script-src', indicates: 'Outreach sales engagement', aiTool: 'Outreach', category: 'ai-sales', confidence: 'high' },

  // Analytics
  { pattern: 'google-analytics', signalType: 'script-src', indicates: 'Google Analytics 4', aiTool: 'Google Analytics', category: 'analytics', confidence: 'high' },
  { pattern: 'mixpanel', signalType: 'script-src', indicates: 'Mixpanel product analytics', aiTool: 'Mixpanel', category: 'analytics', confidence: 'high' },
  { pattern: 'amplitude', signalType: 'script-src', indicates: 'Amplitude product analytics', aiTool: 'Amplitude', category: 'analytics', confidence: 'high' },
  { pattern: 'posthog', signalType: 'script-src', indicates: 'PostHog analytics + feature flags', aiTool: 'PostHog', category: 'analytics', confidence: 'high' },
  { pattern: 'segment', signalType: 'script-src', indicates: 'Segment CDP', aiTool: 'Segment', category: 'data', confidence: 'high' },
  { pattern: 'hotjar', signalType: 'script-src', indicates: 'Hotjar session recording', aiTool: 'Hotjar', category: 'analytics', confidence: 'high' },
  { pattern: 'fullstory', signalType: 'script-src', indicates: 'FullStory session replay', aiTool: 'FullStory', category: 'analytics', confidence: 'high' },

  // AI providers (client-side API keys — a security vulnerability)
  { pattern: 'sk-proj-', signalType: 'script-src', indicates: 'OpenAI API key exposed in client-side code! Major security vulnerability.', aiTool: 'OpenAI', category: 'llm-api', confidence: 'high' },
  { pattern: 'sk-ant-', signalType: 'script-src', indicates: 'Anthropic API key exposed in client-side code! Major security vulnerability.', aiTool: 'Anthropic', category: 'llm-api', confidence: 'high' },
  { pattern: 'openai', signalType: 'script-src', indicates: 'OpenAI SDK or API reference detected', aiTool: 'OpenAI', category: 'llm-api', confidence: 'medium' },
  { pattern: 'anthropic', signalType: 'script-src', indicates: 'Anthropic SDK reference detected', aiTool: 'Anthropic', category: 'llm-api', confidence: 'medium' },
  { pattern: 'langchain', signalType: 'script-src', indicates: 'LangChain framework detected (likely RAG/agent architecture)', aiTool: 'LangChain', category: 'framework', confidence: 'high' },
  { pattern: 'pinecone', signalType: 'script-src', indicates: 'Pinecone vector DB detected (likely RAG)', aiTool: 'Pinecone', category: 'vector-db', confidence: 'high' },
  { pattern: 'chromadb', signalType: 'script-src', indicates: 'ChromaDB vector DB detected', aiTool: 'ChromaDB', category: 'vector-db', confidence: 'high' },
  { pattern: 'weaviate', signalType: 'script-src', indicates: 'Weaviate vector DB detected', aiTool: 'Weaviate', category: 'vector-db', confidence: 'high' },
  { pattern: 'supabase', signalType: 'script-src', indicates: 'Supabase backend (Postgres + pgvector possible)', aiTool: 'Supabase', category: 'backend', confidence: 'high' },
  { pattern: 'firebase', signalType: 'script-src', indicates: 'Firebase backend detected', aiTool: 'Firebase', category: 'backend', confidence: 'high' },

  // Frontend frameworks (indicates tech stack maturity)
  { pattern: 'next.js', signalType: 'script-src', indicates: 'Next.js framework (React, likely Vercel-hosted)', aiTool: 'Next.js', category: 'framework', confidence: 'high' },
  { pattern: '__next_data__', signalType: 'script-src', indicates: 'Next.js SSR/SSG detected', aiTool: 'Next.js', category: 'framework', confidence: 'high' },
  { pattern: 'nuxt', signalType: 'script-src', indicates: 'Nuxt.js (Vue) framework', aiTool: 'Nuxt.js', category: 'framework', confidence: 'high' },
  { pattern: 'sveltekit', signalType: 'script-src', indicates: 'SvelteKit framework', aiTool: 'SvelteKit', category: 'framework', confidence: 'high' },
  { pattern: 'react', signalType: 'script-src', indicates: 'React framework detected', aiTool: 'React', category: 'framework', confidence: 'medium' },
  { pattern: 'vue', signalType: 'script-src', indicates: 'Vue.js framework detected', aiTool: 'Vue.js', category: 'framework', confidence: 'medium' },

  // Hosting / CDN
  { pattern: 'vercel', signalType: 'header', indicates: 'Hosted on Vercel', aiTool: 'Vercel', category: 'hosting', confidence: 'high' },
  { pattern: 'cloudflare', signalType: 'header', indicates: 'Cloudflare CDN/proxy', aiTool: 'Cloudflare', category: 'hosting', confidence: 'high' },
  { pattern: 'netlify', signalType: 'header', indicates: 'Hosted on Netlify', aiTool: 'Netlify', category: 'hosting', confidence: 'high' },
  { pattern: 'aws', signalType: 'header', indicates: 'AWS-hosted', aiTool: 'AWS', category: 'hosting', confidence: 'medium' },

  // Payment
  { pattern: 'stripe', signalType: 'script-src', indicates: 'Stripe payments', aiTool: 'Stripe', category: 'payments', confidence: 'high' },
  { pattern: 'paddle', signalType: 'script-src', indicates: 'Paddle payments (merchant of record)', aiTool: 'Paddle', category: 'payments', confidence: 'high' },
  { pattern: 'lemonsqueezy', signalType: 'script-src', indicates: 'Lemon Squeezy payments', aiTool: 'Lemon Squeezy', category: 'payments', confidence: 'high' },

  // Marketing / email
  { pattern: 'mailchimp', signalType: 'script-src', indicates: 'Mailchimp email marketing', aiTool: 'Mailchimp', category: 'email', confidence: 'high' },
  { pattern: 'klaviyo', signalType: 'script-src', indicates: 'Klaviyo email/SMS marketing', aiTool: 'Klaviyo', category: 'email', confidence: 'high' },
  { pattern: 'customer.io', signalType: 'script-src', indicates: 'Customer.io lifecycle messaging', aiTool: 'Customer.io', category: 'email', confidence: 'high' },

  // Auth
  { pattern: 'clerk', signalType: 'script-src', indicates: 'Clerk authentication', aiTool: 'Clerk', category: 'auth', confidence: 'high' },
  { pattern: 'auth0', signalType: 'script-src', indicates: 'Auth0 authentication', aiTool: 'Auth0', category: 'auth', confidence: 'high' },
  { pattern: 'firebase-auth', signalType: 'script-src', indicates: 'Firebase Auth', aiTool: 'Firebase Auth', category: 'auth', confidence: 'high' },

  // Feature flags
  { pattern: 'launchdarkly', signalType: 'script-src', indicates: 'LaunchDarkly feature flags', aiTool: 'LaunchDarkly', category: 'feature-flags', confidence: 'high' },
  { pattern: 'statsig', signalType: 'script-src', indicates: 'Statsig feature flags + A/B testing', aiTool: 'Statsig', category: 'feature-flags', confidence: 'high' },

  // Error monitoring
  { pattern: 'sentry', signalType: 'script-src', indicates: 'Sentry error monitoring', aiTool: 'Sentry', category: 'monitoring', confidence: 'high' },
  { pattern: 'datadog', signalType: 'script-src', indicates: 'Datadog monitoring', aiTool: 'Datadog', category: 'monitoring', confidence: 'high' },
  { pattern: 'logrocket', signalType: 'script-src', indicates: 'LogRocket session replay', aiTool: 'LogRocket', category: 'monitoring', confidence: 'high' },
];

// Job posting keywords that indicate AI stack
export const JOB_KEYWORD_SIGNALS = [
  { keyword: 'langchain', indicates: 'Using LangChain for LLM orchestration', aiTool: 'LangChain', category: 'framework' },
  { keyword: 'llamaindex', indicates: 'Using LlamaIndex for RAG', aiTool: 'LlamaIndex', category: 'framework' },
  { keyword: 'pinecone', indicates: 'Using Pinecone for vector search', aiTool: 'Pinecone', category: 'vector-db' },
  { keyword: 'openai', indicates: 'Using OpenAI API', aiTool: 'OpenAI', category: 'llm-api' },
  { keyword: 'anthropic', indicates: 'Using Anthropic Claude API', aiTool: 'Anthropic', category: 'llm-api' },
  { keyword: 'hugging face', indicates: 'Using Hugging Face models', aiTool: 'Hugging Face', category: 'llm-api' },
  { keyword: 'tensorflow', indicates: 'Using TensorFlow for ML', aiTool: 'TensorFlow', category: 'ml-framework' },
  { keyword: 'pytorch', indicates: 'Using PyTorch for ML', aiTool: 'PyTorch', category: 'ml-framework' },
  { keyword: 'fine-tuning', indicates: 'Fine-tuning models (higher AI maturity)', aiTool: 'Various', category: 'ml-ops' },
  { keyword: 'rag', indicates: 'Building RAG applications', aiTool: 'Various', category: 'architecture' },
  { keyword: 'agent', indicates: 'Building AI agents (advanced)', aiTool: 'Various', category: 'architecture' },
  { keyword: 'embedding', indicates: 'Using embeddings for search/RAG', aiTool: 'Various', category: 'architecture' },
  { keyword: 'vector database', indicates: 'Using a vector database', aiTool: 'Various', category: 'architecture' },
  { keyword: 'ml ops', indicates: 'Has ML Ops practice (high AI maturity)', aiTool: 'Various', category: 'ml-ops' },
  { keyword: 'model deployment', indicates: 'Deploys custom models', aiTool: 'Various', category: 'ml-ops' },
  { keyword: 'gpu', indicates: 'Uses GPU infrastructure (custom model hosting)', aiTool: 'Various', category: 'infrastructure' },
];

// Vulnerability patterns — things that indicate the competitor has AI weaknesses
export const VULNERABILITY_PATTERNS = [
  {
    pattern: 'Client-side API key exposure',
    description: 'Their OpenAI/Anthropic API key is visible in the page source. Anyone can steal it and rack up charges on their account.',
    severity: 'critical',
    howToDetect: 'Search page source for sk-proj- or sk-ant- prefixes',
    howToExploit: 'If their key is exposed, their costs are vulnerable to abuse. You can highlight this as a security concern when competing.',
    estimatedCost: 'Could cost them $1000s if abused',
  },
  {
    pattern: 'No prompt caching detected',
    description: 'They are likely sending the same system prompt on every API call without caching. This means they are paying 5-10x more than necessary for RAG/chatbot workloads.',
    severity: 'high',
    howToDetect: 'If they use RAG features but their API calls dont include cache_control headers',
    howToExploit: 'If you use prompt caching (90% discount on Anthropic), your costs are 10x lower. You can offer lower prices or more features for the same cost.',
    estimatedCost: 'Paying 5-10x more than necessary on input tokens',
  },
  {
    pattern: 'Using a single frontier model for everything',
    description: 'If their product has simple features (classification, extraction) but they only use GPT-4o or Claude Sonnet, they are overpaying 10-20x on those tasks.',
    severity: 'high',
    howToDetect: 'Job postings mention only one model. No mention of model routing, cascading, or budget models.',
    howToExploit: 'Use model routing (80% budget model, 20% frontier). Your costs are 70% lower. Pass savings to customers.',
    estimatedCost: 'Paying 10-20x more than necessary on simple tasks',
  },
  {
    pattern: 'No batch processing',
    description: 'If they process documents or do bulk operations in real-time, they are paying 2x what they could with batch APIs.',
    severity: 'medium',
    howToDetect: 'No mention of batch processing, async jobs, or queue systems in their architecture.',
    howToExploit: 'Use batch APIs (50% discount). Process non-urgent tasks asynchronously. Lower costs = lower prices.',
    estimatedCost: 'Paying 2x more than necessary for non-urgent tasks',
  },
  {
    pattern: 'No free tier or very limited free tier',
    description: 'If they dont offer a free tier, they are missing the primary conversion funnel for AI tools. Users want to try before they buy.',
    severity: 'medium',
    howToDetect: 'Check their pricing page. No free tier = missed opportunity.',
    howToExploit: 'Offer a generous free tier (using Gemini Flash free tier or GPT-4.1 nano). Capture users they are losing.',
    estimatedCost: 'Losing 30-50% of potential conversions',
  },
  {
    pattern: 'Monolithic architecture (no model routing)',
    description: 'If all queries go through one model, they have no cost optimization. A simple classifier could route 80% of traffic to a cheaper model.',
    severity: 'high',
    howToDetect: 'No mention of model routing, cascading, or multi-model architecture.',
    howToExploit: 'Build model routing. Your costs drop 60-80%. You can undercut their pricing while maintaining margins.',
    estimatedCost: 'Paying 60-80% more than necessary',
  },
  {
    pattern: 'Slow response times (no Groq/edge inference)',
    description: 'If their AI features are slow (>2s response), they are likely using a standard API provider without optimization. Users perceive slow AI as low quality.',
    severity: 'medium',
    howToDetect: 'Test their AI features. If response time >2s, they are not optimized.',
    howToExploit: 'Use Groq (500+ tps) for speed-sensitive features. Your product feels faster = higher satisfaction.',
    estimatedCost: 'Losing users to perceived low quality',
  },
  {
    pattern: 'No multimodal capabilities',
    description: 'If they only do text but their competitors offer image/audio/video, they are falling behind. Multimodal is table stakes for AI apps in 2026.',
    severity: 'low',
    howToDetect: 'Their product features page only mentions text-based AI.',
    howToExploit: 'Add multimodal using Gemini 2.5 Flash (cheapest multimodal). Feature parity advantage.',
    estimatedCost: 'Losing customers to multimodal competitors',
  },
];

// Cost estimation models based on company type and features
export const COST_ESTIMATION_MODELS = [
  {
    companyType: 'AI Chatbot SaaS',
    signals: ['chatbot', 'AI assistant', 'AI chat', 'virtual assistant'],
    estimatedUsersRange: '1K-100K',
    estimatedMonthlyTokens: '50M-500M',
    likelyModels: ['GPT-4o or GPT-4o mini', 'Claude 3.5 Sonnet', 'GPT-4.1 mini'],
    estimatedMonthlyCost: '$2K-$50K',
    costPerUserRange: '$0.50-$5.00',
    notes: 'Chatbots are high-frequency. Without caching, costs balloon. With caching, 90% cheaper.',
  },
  {
    companyType: 'AI Document Processing',
    signals: ['document', 'PDF', 'invoice', 'extract', 'OCR', 'parse'],
    estimatedUsersRange: '100-10K',
    estimatedMonthlyTokens: '10M-100M',
    likelyModels: ['GPT-4o mini', 'Claude 3.5 Haiku', 'Gemini 2.5 Flash'],
    estimatedMonthlyCost: '$500-$10K',
    costPerUserRange: '$2-$20',
    notes: 'Document processing is lower frequency but higher token count per request. Caching is critical for repeated document types.',
  },
  {
    companyType: 'AI Code Generation',
    signals: ['code', 'coding', 'developer', 'IDE', 'autocomplete', 'code review'],
    estimatedUsersRange: '1K-50K',
    estimatedMonthlyTokens: '100M-1B',
    likelyModels: ['Claude 3.5 Sonnet', 'GPT-4o', 'Codex'],
    estimatedMonthlyCost: '$5K-$100K',
    costPerUserRange: '$5-$20',
    notes: 'Code gen is the most expensive per-user (long context + long output). But also highest value (replaces $100/hr developer).',
  },
  {
    companyType: 'AI Content Generation',
    signals: ['content', 'writing', 'blog', 'marketing copy', 'SEO', 'social media'],
    estimatedUsersRange: '500-50K',
    estimatedMonthlyTokens: '20M-200M',
    likelyModels: ['GPT-4o', 'Claude 3.5 Sonnet', 'GPT-4o mini'],
    estimatedMonthlyCost: '$1K-$20K',
    costPerUserRange: '$1-$5',
    notes: 'Content gen is moderate cost. Can use cheaper models for short-form, frontier for long-form.',
  },
  {
    companyType: 'AI Search / RAG Platform',
    signals: ['search', 'RAG', 'knowledge base', 'semantic search', 'document search', 'chat with docs'],
    estimatedUsersRange: '500-20K',
    estimatedMonthlyTokens: '50M-500M',
    likelyModels: ['GPT-4o mini', 'Claude 3.5 Sonnet (with caching)', 'text-embedding-3-small'],
    estimatedMonthlyCost: '$2K-$30K',
    costPerUserRange: '$2-$10',
    notes: 'RAG has embedding costs + LLM costs. Without caching, re-retrieving the same documents is expensive. With caching, 90% cheaper.',
  },
  {
    companyType: 'AI Image/Video Generation',
    signals: ['image', 'video', 'generate', 'create', 'art', 'design', 'midjourney', 'dall-e'],
    estimatedUsersRange: '1K-100K',
    estimatedMonthlyTokens: 'N/A (per-image pricing)',
    likelyModels: ['DALL-E 3', 'Stable Diffusion', 'Flux Pro', 'Midjourney API'],
    estimatedMonthlyCost: '$1K-$50K',
    costPerUserRange: '$1-$10',
    notes: 'Image gen is priced per-image, not per-token. $0.04-$0.06 per image. High volume = high cost.',
  },
  {
    companyType: 'AI Agent Platform',
    signals: ['agent', 'autonomous', 'workflow', 'automate', 'multi-step', 'task automation'],
    estimatedUsersRange: '100-5K',
    estimatedMonthlyTokens: '10M-100M',
    likelyModels: ['GPT-4o', 'Claude 3.5 Sonnet', 'o3-mini'],
    estimatedMonthlyCost: '$5K-$50K',
    costPerUserRange: '$10-$100',
    notes: 'Agents are the most expensive per-user (5-20 LLM calls per task). Must use usage-based pricing or credits.',
  },
  {
    companyType: 'AI Sales/Marketing Tool',
    signals: ['sales', 'outbound', 'lead', 'prospecting', 'cold email', 'CRM', 'enrichment'],
    estimatedUsersRange: '500-10K',
    estimatedMonthlyTokens: '20M-200M',
    likelyModels: ['GPT-4o mini', 'Claude 3.5 Haiku', 'GPT-4o'],
    estimatedMonthlyCost: '$1K-$15K',
    costPerUserRange: '$2-$15',
    notes: 'Sales tools use AI for personalization + enrichment. Can use cheaper models for most tasks.',
  },
];
