// Tool Engine — config-driven tool definitions.
// Each tool is a single config file. The generic UI components render from it.
// To add a new tool: create a config, add it to the registry, push to GitHub.
// Vercel auto-deploys, the tool is live at /tools/[slug].

export type ToolCategory =
  | 'decision'      // Should you do X or Y?
  | 'calculator'    // What's the ROI/score?
  | 'matcher'       // Which option fits best?
  | 'analyzer'      // What's the state of X?
  | 'evaluator';    // Is X worth doing?

export type ToolStatus = 'live' | 'draft' | 'coming-soon';

// The knowledge base item — for matcher/comparison tools.
// For decision tools, this is the set of options being compared.
export interface KnowledgeItem {
  id: string;
  name: string;
  category?: string;
  description: string;
  pros?: string[];
  cons?: string[];
  url?: string;
  pricing?: string;
  bestFor?: string;
  tags?: string[];
}

// Optional fields that the tool can ask for (beyond the main text input)
export interface ToolInputField {
  id: string;
  label: string;
  type: 'text' | 'select' | 'url';
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  helpText?: string;
}

// The config that defines a tool. This is all you need to create a new tool.
export interface ToolConfig {
  slug: string;                    // URL path: /tools/[slug]
  name: string;                    // Display name
  tagline: string;                 // One-line hook
  description: string;             // 2-3 sentences for the landing page
  category: ToolCategory;
  icon: string;                    // Lucide icon name (e.g., 'Scale', 'Calculator')
  iconColor: string;               // Hex color for the icon
  status: ToolStatus;
  createdAt: string;               // ISO date
  featured?: boolean;              // Show on homepage hero

  // Input configuration
  inputLabel: string;              // Label for the main textarea
  inputPlaceholder: string;        // Placeholder text
  inputHint?: string;              // Helper text below the input
  additionalFields?: ToolInputField[]; // Optional extra fields

  // AI configuration
  systemPrompt: string;            // The system prompt for the LLM
  inputModeHint?: string;          // How to interpret the user's input
  temperature?: number;            // LLM temperature (default: 0.3)

  // Knowledge base (optional — for matcher/comparison tools)
  knowledgeBase?: KnowledgeItem[];

  // Result configuration
  verdictLabels: {
    high: string;
    medium: string;
    low: string;
  };

  // Tweet templates for the tweet-draft script
  tweetTemplates: string[];

  // Email configuration
  emailSubject: string;

  // SEO
  keywords?: string[];
}

// Standardized AI output — every tool returns this shape
export interface ToolAnalysisResult {
  verdict: 'high' | 'medium' | 'low';
  verdictLabel: string;            // Display label from config
  score: number;                   // 0-100
  summary: string;                 // 2-3 sentence executive summary
  keyInsights: string[];           // 3-5 key points
  recommendations: string[];       // 2-4 specific recommendations
  actionItems: string[];           // 1-3 things to do today
  risks?: string[];                // Optional risks/caveats
  matchedItems?: Array<{           // For matcher tools — ranked results
    id: string;
    name: string;
    matchScore: number;
    whyItMatches: string;
  }>;
  confidence: 'high' | 'medium' | 'low';
}
