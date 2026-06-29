// Curated case studies — anonymized but based on real implementations.
// Metrics are drawn from public vendor case studies and industry benchmarks.

export interface CaseStudy {
  id: string;
  title: string;
  industry: string;
  companySize: string;
  processAutomated: string;
  approach: string; // integration | ai | rpa | custom
  toolsUsed: string[]; // tool IDs from tools-db
  results: {
    timeSaved: string;
    costSaved: string;
    errorReduction: string;
    paybackMonths: number;
  };
  summary: string;
  keyLearning: string;
  tags: string[]; // for matching — process type tags
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'cs-invoice-reconciliation',
    title: 'Mid-market SaaS company automates AP invoice reconciliation',
    industry: 'Technology',
    companySize: 'Mid-market (150 employees)',
    processAutomated: 'Vendor invoice matching against POs in NetSuite',
    approach: 'integration',
    toolsUsed: ['make', 'claude-api'],
    results: {
      timeSaved: '80% reduction (12 min → 2.4 min per invoice)',
      costSaved: '$94K/year in AP team capacity',
      errorReduction: '67% fewer mismatch errors',
      paybackMonths: 4,
    },
    summary:
      'A 150-person SaaS company was manually reconciling ~200 vendor invoices per week against POs in NetSuite. They built a Make.com flow that triggers on invoice arrival, uses Claude to extract structured data from PDFs, matches against PO records, and routes exceptions to the AP team. The 2-person AP team now handles 3x volume without adding headcount.',
    keyLearning:
      'Combining a visual integration tool (Make) with an LLM (Claude) for document processing was cheaper and faster than building a custom solution. The team spent 3 weeks on the initial build, but piloted with one vendor category first to validate.',
    tags: ['invoice', 'reconciliation', 'finance', 'netsuite', 'pdf-processing', 'ap'],
  },
  {
    id: 'cs-lead-routing',
    title: 'B2B services firm automates lead routing and qualification',
    industry: 'Professional Services',
    companySize: 'Small (45 employees)',
    processAutomated: 'Inbound lead qualification, scoring, and CRM routing',
    approach: 'integration',
    toolsUsed: ['zapier', 'claude-api'],
    results: {
      timeSaved: '100% automation of manual lead review',
      costSaved: '$32K/year in SDR capacity reallocated',
      errorReduction: '90% reduction in misrouted leads',
      paybackMonths: 2,
    },
    summary:
      'A consulting firm was receiving 150+ inbound leads per week across web forms, email, and LinkedIn. SDRs manually reviewed each one, scored it, and routed to the right partner. They built a Zapier flow that captures leads from all sources, uses Claude to qualify based on firmographic data and stated needs, scores the lead, and routes to Salesforce with a recommended partner. SDRs now focus only on edge cases.',
    keyLearning:
      'The AI qualification took 2 weeks to tune — they started too strict (missing good leads) and gradually loosened thresholds based on partner feedback. The biggest win was reducing response time from 4 hours to 2 minutes.',
    tags: ['lead', 'routing', 'sales', 'crm', 'qualification', 'sd'],
  },
  {
    id: 'cs-customer-support-triage',
    title: 'E-commerce brand automates support ticket triage with AI',
    industry: 'Retail',
    companySize: 'Mid-market (300 employees)',
    processAutomated: 'Customer support ticket classification and routing',
    approach: 'ai',
    toolsUsed: ['claude-api', 'make'],
    results: {
      timeSaved: '65% reduction in first-response time',
      costSaved: '$120K/year in support team efficiency',
      errorReduction: '40% fewer escalations from misrouted tickets',
      paybackMonths: 3,
    },
    summary:
      'An e-commerce company received 2,000+ support tickets per week. Human agents manually categorized and routed each one, leading to delays and misroutes. They built a Make.com flow that captures tickets from Zendesk, uses Claude to classify (refund, shipping, product issue, etc.), assess urgency, and route to the right queue with a suggested response. Agents now handle 2x tickets per hour.',
    keyLearning:
      'The biggest surprise was that AI-suggested responses were adopted 70% of the time — agents edit and send rather than writing from scratch. They initially tried to fully auto-respond but pulled back after a few tone-deaf replies to angry customers.',
    tags: ['support', 'triage', 'classification', 'zendesk', 'ecommerce'],
  },
  {
    id: 'cs-report-generation',
    title: 'Marketing agency automates weekly client report generation',
    industry: 'Media',
    companySize: 'Small (25 employees)',
    processAutomated: 'Multi-source data aggregation into client-ready reports',
    approach: 'integration',
    toolsUsed: ['make', 'openai-api'],
    results: {
      timeSaved: '15 hours/week per analyst',
      costSaved: '$45K/year in analyst time',
      errorReduction: '85% fewer manual data entry errors',
      paybackMonths: 1,
    },
    summary:
      'A digital marketing agency produced weekly performance reports for 12 clients, each pulling data from Google Analytics, Meta Ads, LinkedIn Ads, and Shopify. Analysts spent 15+ hours/week just on data gathering. They built Make.com flows that pull all data automatically, use GPT-4o to generate narrative insights, and produce a polished PDF. Analysts now review and customize instead of gathering.',
    keyLearning:
      'Clients initially worried about "AI-generated reports" — the agency rebranded them as "AI-assisted, analyst-reviewed" and got positive feedback. The narrative insights were a bigger differentiator than expected.',
    tags: ['report', 'analytics', 'marketing', 'client', 'pdf', 'data-aggregation'],
  },
  {
    id: 'hsr-resume-screening',
    title: 'High-growth startup automates resume screening for high-volume roles',
    industry: 'Technology',
    companySize: 'Mid-market (200 employees)',
    processAutomated: 'Resume screening and initial candidate qualification',
    approach: 'ai',
    toolsUsed: ['claude-api', 'greenhouse-api'],
    results: {
      timeSaved: '70% reduction in recruiter screening time',
      costSaved: '$80K/year in recruiter capacity',
      errorReduction: '25% improvement in qualified-hire rate',
      paybackMonths: 5,
    },
    summary:
      'A scaling tech startup was hiring 200+ people per year across engineering, sales, and ops. Recruiters spent 30+ hours/week screening resumes. They built an internal tool using Claude API to evaluate resumes against role requirements, score candidates, and write summary notes in Greenhouse. Recruiters now only review the top 30% of candidates.',
    keyLearning:
      'Bias auditing was critical — they ran the system in shadow mode for 6 weeks comparing AI scores to human decisions, found and fixed patterns that under-scored non-traditional backgrounds. The system now flags candidates from non-target schools for human review rather than auto-rejecting.',
    tags: ['hr', 'recruiting', 'resume', 'screening', 'greenhouse'],
  },
  {
    id: 'cs-vendor-onboarding',
    title: 'Manufacturing company automates vendor onboarding KYC',
    industry: 'Manufacturing',
    companySize: 'Enterprise (2,000 employees)',
    processAutomated: 'Vendor document collection, verification, and ERP setup',
    approach: 'rpa',
    toolsUsed: ['uipath', 'power-automate'],
    results: {
      timeSaved: '85% reduction in onboarding cycle time',
      costSaved: '$180K/year in procurement team capacity',
      errorReduction: '95% fewer compliance audit findings',
      paybackMonths: 8,
    },
    summary:
      'A manufacturing company onboarded 500+ vendors per year, each requiring tax forms, insurance certificates, banking details, and ERP setup. Procurement specialists spent 4+ hours per vendor. They deployed UiPath bots that collect documents via email, verify completeness, extract data into SAP, and route exceptions to humans. Onboarding dropped from 2 weeks to 2 days.',
    keyLearning:
      'RPA was the right choice because SAP had no modern API and the company was not ready to migrate. The bots are brittle to SAP UI changes — they budget 15% of build cost annually for maintenance. Piloted with one vendor category for 3 months before scaling.',
    tags: ['vendor', 'onboarding', 'kyc', 'sap', 'manufacturing', 'erp'],
  },
  {
    id: 'cs-clinical-documentation',
    title: 'Healthcare network automates clinical documentation summaries',
    industry: 'Healthcare',
    companySize: 'Enterprise (5,000+ employees)',
    processAutomated: 'Patient visit note summarization for EHR',
    approach: 'ai',
    toolsUsed: ['claude-api'],
    results: {
      timeSaved: '12 minutes per patient visit',
      costSaved: '$2.4M/year in clinician time',
      errorReduction: '30% more complete documentation',
      paybackMonths: 6,
    },
    summary:
      'A healthcare network with 200+ providers was losing clinician time to documentation — each visit required 15+ minutes of notes. They built a HIPAA-compliant internal tool using Claude API that takes raw clinician dictation and produces structured EHR-ready notes. Clinicians review and edit rather than writing from scratch. They got back 12 minutes per visit.',
    keyLearning:
      'HIPAA compliance drove the build vs buy decision — they couldn\'t use consumer SaaS tools. Built on AWS with BAA in place, no model training, full audit logging. Clinician adoption was the long pole — they involved doctors in prompt engineering for 2 months before rollout.',
    tags: ['healthcare', 'clinical', 'documentation', 'ehr', 'hipaa'],
  },
  {
    id: 'cs-expense-approval',
    title: 'Professional services firm automates expense report approval',
    industry: 'Professional Services',
    companySize: 'Mid-market (500 employees)',
    processAutomated: 'Expense report review, policy compliance check, approval routing',
    approach: 'integration',
    toolsUsed: ['make', 'claude-api'],
    results: {
      timeSaved: '90% reduction in approval cycle time',
      costSaved: '$48K/year in finance team capacity',
      errorReduction: '60% fewer policy violations',
      paybackMonths: 3,
    },
    summary:
      'A consulting firm processed 1,500+ expense reports per month. Finance reviewers checked each against policy, flagged violations, and routed to managers. They built a Make.com flow that receives reports from Expensify, uses Claude to check against the 40-page policy (receipts required >$25, no alcohol, etc.), auto-approves compliant ones, and routes exceptions with explanations.',
    keyLearning:
      'Putting the policy as a structured document that Claude references (rather than embedding in the prompt) made updates trivial — finance updates the doc, no code changes needed. The 60% reduction in violations came from consistency, not stricter rules.',
    tags: ['expense', 'approval', 'finance', 'policy', 'expensify'],
  },
  {
    id: 'cs-inventory-forecasting',
    title: 'Retailer automates inventory reorder point calculation',
    industry: 'Retail',
    companySize: 'Mid-market (80 stores)',
    processAutomated: 'SKU-level demand forecasting and reorder trigger',
    approach: 'custom',
    toolsUsed: ['supabase', 'openai-api'],
    results: {
      timeSaved: '100% automation of manual forecasting',
      costSaved: '$340K/year in reduced stockouts + overstock',
      errorReduction: '45% improvement in forecast accuracy',
      paybackMonths: 7,
    },
    summary:
      'An 80-store retailer was forecasting demand for 4,000 SKUs using Excel and gut feel. They built a custom tool on Supabase that pulls POS data, uses GPT-4o to analyze seasonality and trends per SKU, calculates reorder points, and triggers purchase orders in their inventory system. Stockouts dropped 40%, overstock dropped 35%.',
    keyLearning:
      'Custom was the right call — their existing systems were too fragmented for off-the-shelf tools. The AI\'s value wasn\'t in forecasting sophistication (simple stats would have worked) but in producing human-readable explanations of why each reorder point was set, building trust with the merchandising team.',
    tags: ['inventory', 'forecasting', 'retail', 'pos', 'reorder'],
  },
  {
    id: 'cs-contract-review',
    title: 'Legal team automates contract clause review',
    industry: 'Finance',
    companySize: 'Enterprise (1,000 employees)',
    processAutomated: 'Contract clause identification and risk flagging',
    approach: 'ai',
    toolsUsed: ['claude-api'],
    results: {
      timeSaved: '70% reduction in initial review time',
      costSaved: '$220K/year in outside counsel fees',
      errorReduction: '40% more risk flags caught',
      paybackMonths: 5,
    },
    summary:
      'A financial services firm reviewed 3,000+ contracts per year. Junior attorneys spent 2+ hours per contract flagging non-standard clauses. They built an internal tool using Claude API with their clause playbook that identifies risky terms, compares to standards, and produces a flagged document for attorney review. Review time dropped to 30 minutes per contract.',
    keyLearning:
      'They deliberately kept a human in the loop — Claude flags but attorneys decide. The 40% improvement in risk detection wasn\'t from being smarter than attorneys, but from consistency — Claude checks every clause every time, while humans skim when busy. Required 4 months of prompt iteration with senior attorneys.',
    tags: ['legal', 'contract', 'review', 'finance', 'risk'],
  },
  {
    id: 'cs-onboarding-sequences',
    title: 'SaaS company automates customer onboarding email sequences',
    industry: 'Technology',
    companySize: 'Mid-market (90 employees)',
    processAutomated: 'Personalized onboarding email sequences based on user behavior',
    approach: 'integration',
    toolsUsed: ['n8n', 'openai-api'],
    results: {
      timeSaved: '100% automation of manual personalization',
      costSaved: '$60K/year in CSM capacity + 18% activation lift',
      errorReduction: 'N/A (new capability)',
      paybackMonths: 2,
    },
    summary:
      'A B2B SaaS company sent generic onboarding emails to all new signups. Customer success manually personalized a few key accounts. They built an n8n flow that tracks user behavior in their app, uses GPT-4o to write personalized emails referencing specific features the user has explored, and sends via their ESP. Activation rate increased 18%.',
    keyLearning:
      'Personalization at scale was the unlock — they couldn\'t have hired enough CSMs to do this manually. They A/B tested AI-personalized vs generic and the lift paid for the entire build in 2 months. Required careful guardrails to prevent tone-deaf emails (no mentioning features the user hasn\'t seen).',
    tags: ['onboarding', 'email', 'saas', 'personalization', 'cs'],
  },
  {
    id: 'cs-field-service-dispatch',
    title: 'Logistics company automates field service technician dispatch',
    industry: 'Logistics',
    companySize: 'Enterprise (800 employees)',
    processAutomated: 'Service ticket dispatch, technician assignment, route optimization',
    approach: 'custom',
    toolsUsed: ['retool', 'claude-api'],
    results: {
      timeSaved: '60% reduction in dispatch cycle time',
      costSaved: '$280K/year in dispatcher capacity + fuel savings',
      errorReduction: '50% fewer wrong-tech-assigned errors',
      paybackMonths: 9,
    },
    summary:
      'A logistics company dispatched 200+ technicians per day for equipment repairs. Dispatchers manually matched tickets to technicians based on skills, location, and availability. They built a custom tool on Retool that uses Claude to evaluate ticket-to-tech fit, suggests optimal assignments, and lets dispatchers approve or override. Dispatchers now handle 3x volume.',
    keyLearning:
      'Retool was perfect because dispatchers needed a UI to review and override AI suggestions — full automation would have been rejected. The AI suggests but humans decide. The hardest part was encoding technician skills accurately — they spent 6 weeks on the data model.',
    tags: ['dispatch', 'field-service', 'logistics', 'routing', 'scheduling'],
  },
];

export function getCaseStudyById(id: string): CaseStudy | undefined {
  return CASE_STUDIES.find((c) => c.id === id);
}

export function getCaseStudiesByIds(ids: string[]): CaseStudy[] {
  return ids
    .map((id) => getCaseStudyById(id))
    .filter((c): c is CaseStudy => c !== undefined);
}

export function searchCaseStudies(query: string): CaseStudy[] {
  const q = query.toLowerCase();
  return CASE_STUDIES.filter((c) => {
    const haystack = [
      c.title,
      c.industry,
      c.processAutomated,
      c.summary,
      c.keyLearning,
      ...c.tags,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(q);
  });
}
