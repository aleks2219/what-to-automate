// Pre-built workflow templates for common automation patterns.
// Each template includes tools needed, difficulty, and where to find a starting point.

export interface WorkflowTemplate {
  id: string;
  title: string;
  description: string;
  category: 'finance' | 'sales' | 'support' | 'operations' | 'hr' | 'marketing' | 'it';
  toolsNeeded: string[]; // tool IDs from tools-db
  difficulty: 1 | 2 | 3 | 4 | 5;
  timeToBuild: string;
  templateUrl: string; // link to cloneable template or platform's template gallery
  templateType: 'pre-built' | 'blueprint' | 'build-from-scratch';
  steps: string[];
  prerequisites: string[];
}

export const WORKFLOW_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'tpl-invoice-processing',
    title: 'Invoice Processing Automation',
    description:
      'Auto-extract data from incoming invoices (PDF/email), match against POs, route to AP for approval.',
    category: 'finance',
    toolsNeeded: ['make', 'claude-api'],
    difficulty: 3,
    timeToBuild: '1-2 days',
    templateUrl: 'https://www.make.com/en/templates?tags=finance',
    templateType: 'blueprint',
    steps: [
      'Connect Make.com to your email (Gmail/Outlook) to watch for invoice attachments',
      'Add a Claude API module to extract structured data: vendor, amount, line items, due date',
      'Add a module to query your ERP (NetSuite/QBO/Xero) for matching PO',
      'Add conditional logic: if match → auto-approve, if no match → route to AP specialist',
      'Add a Slack/email notification for exceptions',
      'Test with 10 historical invoices before going live',
    ],
    prerequisites: [
      'Make.com account (free tier works)',
      'Claude API key ($5 free credit on signup)',
      'Access to your ERP\'s API or a Make.com connector for it',
    ],
  },
  {
    id: 'tpl-lead-routing',
    title: 'Lead Routing & Qualification',
    description:
      'Capture leads from web forms + email, use AI to qualify, score, and route to right rep in CRM.',
    category: 'sales',
    toolsNeeded: ['zapier', 'claude-api'],
    difficulty: 2,
    timeToBuild: '4-8 hours',
    templateUrl: 'https://zapier.com/apps/categories/lead-management',
    templateType: 'pre-built',
    steps: [
      'Create a Zap that triggers on new form submission (Typeform/HubSpot/your website)',
      'Add a Claude API step to qualify the lead based on your ICP criteria',
      'Add a step to score the lead (1-100) based on firmographics + intent',
      'Add a step to look up the right sales rep in your CRM (by territory/industry)',
      'Create/update the lead in Salesforce/HubSpot with score and assigned rep',
      'Send a Slack notification to the assigned rep with lead summary',
    ],
    prerequisites: [
      'Zapier account (Starter plan $20/mo for multi-step Zaps)',
      'Claude API key',
      'CRM with Zapier integration (Salesforce, HubSpot, Pipedrive)',
    ],
  },
  {
    id: 'tpl-support-triage',
    title: 'Support Ticket Triage & Routing',
    description:
      'Classify incoming support tickets by category + urgency, route to right queue with suggested response.',
    category: 'support',
    toolsNeeded: ['make', 'claude-api'],
    difficulty: 3,
    timeToBuild: '1-2 days',
    templateUrl: 'https://www.make.com/en/templates?tags=customer-support',
    templateType: 'blueprint',
    steps: [
      'Connect Make.com to Zendesk/Intercom/Freshdesk to watch for new tickets',
      'Add Claude API module to classify: category (refund/bug/shipping/etc.), urgency (1-5), sentiment',
      'Add conditional routing: high urgency → priority queue, low → standard queue',
      'Add a step to generate a suggested response based on category',
      'Update the ticket with tags, priority, and internal note with suggested response',
      'Monitor for 1 week, adjust classification thresholds based on accuracy',
    ],
    prerequisites: [
      'Make.com account',
      'Claude API key',
      'Support tool with API access (Zendesk, Intercom, Freshdesk)',
    ],
  },
  {
    id: 'tpl-report-generation',
    title: 'Weekly Client Report Generation',
    description:
      'Pull data from multiple sources (GA, ads, CRM), generate narrative insights, produce PDF.',
    category: 'marketing',
    toolsNeeded: ['make', 'openai-api'],
    difficulty: 3,
    timeToBuild: '1-2 days',
    templateUrl: 'https://www.make.com/en/templates?tags=reporting',
    templateType: 'blueprint',
    steps: [
      'Set up a weekly scheduled trigger in Make.com',
      'Add modules to pull data from Google Analytics, Meta Ads, Google Ads, Shopify',
      'Aggregate data into a structured format (JSON or CSV)',
      'Send to OpenAI API with a prompt: "Generate a client-ready summary of this week\'s performance..."',
      'Format the response into a branded PDF using a document generation tool (DocuPilot, PDF.co)',
      'Email the PDF to the client + cc the account manager',
    ],
    prerequisites: [
      'Make.com account',
      'OpenAI API key',
      'Access to your analytics platforms\' APIs',
      'Branded PDF template (DocuPilot or similar)',
    ],
  },
  {
    id: 'tpl-expense-approval',
    title: 'Expense Report Auto-Approval',
    description:
      'Auto-check expense reports against policy, approve compliant ones, route exceptions with explanations.',
    category: 'finance',
    toolsNeeded: ['make', 'claude-api'],
    difficulty: 3,
    timeToBuild: '1-2 days',
    templateUrl: 'https://www.make.com/en/templates?tags=finance',
    templateType: 'blueprint',
    steps: [
      'Connect Make.com to Expensify/Ramp/Brex to watch for submitted reports',
      'Add Claude API module with your expense policy as context',
      'For each line item, ask Claude: "Does this comply with policy? If not, why?"',
      'Add conditional logic: all compliant → auto-approve, any violations → route to manager',
      'Include Claude\'s explanation in the manager notification for context',
      'Sync approval status back to your expense tool',
    ],
    prerequisites: [
      'Make.com account',
      'Claude API key',
      'Expense tool with API access (Expensify, Ramp, Brex)',
      'Your expense policy as a document (PDF or text)',
    ],
  },
  {
    id: 'tpl-customer-onboarding',
    title: 'Personalized Customer Onboarding Emails',
    description:
      'Send behavior-triggered, AI-personalized onboarding emails based on what features users explore.',
    category: 'marketing',
    toolsNeeded: ['n8n', 'openai-api'],
    difficulty: 3,
    timeToBuild: '2-3 days',
    templateUrl: 'https://n8n.io/workflows',
    templateType: 'blueprint',
    steps: [
      'Set up n8n to receive webhooks from your product analytics tool (Segment, Mixpanel, PostHog)',
      'Create a workflow that triggers when a user completes a key action (signup, feature use, etc.)',
      'Pull the user\'s recent activity log',
      'Send to OpenAI: "Write a personalized onboarding email referencing the features this user has explored..."',
      'Add guardrails: never mention features they haven\'t seen, keep under 150 words, include clear CTA',
      'Send via your ESP (Resend, Postmark, SendGrid)',
    ],
    prerequisites: [
      'n8n (cloud or self-hosted)',
      'OpenAI API key',
      'Product analytics tool with webhooks',
      'ESP with API access',
    ],
  },
  {
    id: 'tpl-social-scheduling',
    title: 'Social Media Cross-Posting',
    description:
      'Schedule once, auto-adapt and post to Twitter, LinkedIn, Instagram with platform-specific formatting.',
    category: 'marketing',
    toolsNeeded: ['make', 'openai-api'],
    difficulty: 2,
    timeToBuild: '4 hours',
    templateUrl: 'https://www.make.com/en/templates?tags=social-media',
    templateType: 'pre-built',
    steps: [
      'Connect Make.com to a Notion/Airtable database where you draft posts',
      'When a post is marked "ready", trigger Make.com',
      'Send the draft to OpenAI: "Adapt this post for Twitter (280 chars), LinkedIn (professional tone), Instagram (with hashtags)"',
      'Send each adapted version to the respective platform via API',
      'Update the database with posted URLs and timestamps',
    ],
    prerequisites: [
      'Make.com account',
      'OpenAI API key',
      'Social media accounts with API access',
      'Notion or Airtable for drafting',
    ],
  },
  {
    id: 'tpl-resume-screening',
    title: 'Resume Screening & Scoring',
    description:
      'AI-evaluate resumes against role requirements, score candidates, write summary notes in your ATS.',
    category: 'hr',
    toolsNeeded: ['claude-api'],
    difficulty: 4,
    timeToBuild: '3-5 days (custom build)',
    templateUrl: 'https://platform.openai.com/docs/guides/text-generation',
    templateType: 'build-from-scratch',
    steps: [
      'Build a simple web form (Retool, Bubble, or custom) for recruiters to paste job requirements',
      'Connect your ATS (Greenhouse, Lever, Ashby) to feed resumes via API',
      'Send each resume + job requirements to Claude with a structured prompt',
      'Ask Claude to score (1-100), highlight strengths/gaps, and write a 2-sentence summary',
      'Write results back to the ATS as internal notes',
      'Run in shadow mode for 2 weeks comparing AI scores to human decisions before going live',
      'Audit for bias — flag any patterns where non-traditional backgrounds score lower',
    ],
    prerequisites: [
      'Claude API key',
      'ATS with API access (Greenhouse, Lever, Ashby)',
      'Internal tooling for the recruiter UI (Retool recommended)',
      'Commitment to bias auditing before + after launch',
    ],
  },
  {
    id: 'tpl-vendor-onboarding',
    title: 'Vendor Onboarding & KYC',
    description:
      'Automate vendor document collection, verification, and ERP setup for new suppliers.',
    category: 'operations',
    toolsNeeded: ['power-automate'],
    difficulty: 4,
    timeToBuild: '1-2 weeks',
    templateUrl: 'https://powerautomate.microsoft.com/en-us/templates/',
    templateType: 'blueprint',
    steps: [
      'Create a Power Automate flow triggered by vendor submission form',
      'Use AI Builder to extract data from W-9, COI, and banking docs',
      'Add validation steps: tax ID format, COI expiration, banking details',
      'Route to procurement for approval if any validation fails',
      'On approval, use RPA to enter vendor in SAP/Oracle ERP (UI automation)',
      'Send welcome email to vendor with onboarding portal access',
    ],
    prerequisites: [
      'Power Automate Premium license ($15/user/mo + AI Builder add-on)',
      'Microsoft 365 environment',
      'ERP with either API or UI access (SAP, Oracle, Dynamics)',
    ],
  },
  {
    id: 'tpl-data-sync',
    title: 'CRM ↔ Marketing Tool Sync',
    description:
      'Keep customer data in sync between CRM (Salesforce/HubSpot) and marketing tools (Mailchimp/ESP).',
    category: 'operations',
    toolsNeeded: ['zapier'],
    difficulty: 2,
    timeToBuild: '2-4 hours',
    templateUrl: 'https://zapier.com/apps/salesforce/integrations/mailchimp',
    templateType: 'pre-built',
    steps: [
      'Create a Zap triggered on new/updated contact in Salesforce/HubSpot',
      'Add a filter step: only sync contacts meeting certain criteria (e.g., opted-in)',
      'Add an action: create/update subscriber in Mailchimp/your ESP',
      'Add tags based on CRM lifecycle stage',
      'Create a reverse Zap: unsubscribes in ESP → update CRM',
      'Run a one-time backfill to sync existing records',
    ],
    prerequisites: [
      'Zapier account (Starter plan for multi-step Zaps)',
      'CRM with Zapier integration',
      'ESP with Zapier integration',
    ],
  },
];

export function getTemplateById(id: string): WorkflowTemplate | undefined {
  return WORKFLOW_TEMPLATES.find((t) => t.id === id);
}

export function getTemplatesByIds(ids: string[]): WorkflowTemplate[] {
  return ids
    .map((id) => getTemplateById(id))
    .filter((t): t is WorkflowTemplate => t !== undefined);
}

export function getTemplatesByCategory(category: WorkflowTemplate['category']): WorkflowTemplate[] {
  return WORKFLOW_TEMPLATES.filter((t) => t.category === category);
}
