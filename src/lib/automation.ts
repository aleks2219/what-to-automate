// Automation Evaluator — types, content, and scoring engine

export type Industry =
  | 'technology'
  | 'finance'
  | 'healthcare'
  | 'manufacturing'
  | 'retail'
  | 'professional-services'
  | 'education'
  | 'logistics'
  | 'media'
  | 'nonprofit'
  | 'government'
  | 'other';

export type CompanySize =
  | 'startup' // 1-10
  | 'small' // 11-50
  | 'mid' // 51-250
  | 'large' // 251-1000
  | 'enterprise'; // 1000+

export type RoleLevel =
  | 'ic' // individual contributor
  | 'manager'
  | 'director'
  | 'vp'
  | 'c-suite'
  | 'founder';

export type Performer =
  | 'ic'
  | 'specialist'
  | 'manager'
  | 'vendor'
  | 'mixed';

export type Frequency =
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'quarterly'
  | 'annually';

export type AutomationApproach =
  | 'rpa' // robotic process automation (UiPath, Automation Anywhere)
  | 'ai' // LLM-based (Claude, GPT, etc.)
  | 'integration' // SaaS integration (Zapier, n8n, native APIs)
  | 'custom'; // custom software

export type Verdict = 'AUTOMATE_NOW' | 'PILOT_FIRST' | 'NOT_YET';

export interface AssessmentInput {
  // Company context
  industry: Industry;
  companySize: CompanySize;
  roleLevel: RoleLevel;

  // Process
  processName: string;
  processDescription: string;
  performer: Performer;
  frequency: Frequency;
  occurrencesPerCycle: number; // e.g. 50 times per day
  minutesPerOccurrence: number;

  // Costs
  hourlyCost: number; // loaded $/hour of performer
  numberOfPeople: number; // how many people perform this
  implementationCost: number; // estimated $ to build

  // Approach
  approach: AutomationApproach;
  automationPercentage: number; // 0-100, what % can be automated

  // Risk & change
  criticality: number; // 1-5
  errorTolerance: number; // 1-5 (5 = high tolerance)
  changeCapacity: number; // 1-5 (5 = high capacity)
}

export interface AssessmentResult {
  verdict: Verdict;
  verdictReason: string;
  annualHoursSaved: number;
  annualCostSavings: number;
  implementationCost: number;
  paybackMonths: number;
  threeYearROI: number; // percentage
  fiveYearNetValue: number;
  riskAdjustedScore: number; // 0-10
  strategicValueCallouts: string[];
  risks: string[];
  roadmap: { phase: string; duration: string; description: string }[];
  executiveSummary: string;
  recommendation: string;
}

// ---------- Content ----------

export const INDUSTRIES: { value: Industry; label: string }[] = [
  { value: 'technology', label: 'Technology / SaaS' },
  { value: 'finance', label: 'Finance / Banking' },
  { value: 'healthcare', label: 'Healthcare / Life Sciences' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail / E-commerce' },
  { value: 'professional-services', label: 'Professional Services' },
  { value: 'education', label: 'Education' },
  { value: 'logistics', label: 'Logistics / Supply Chain' },
  { value: 'media', label: 'Media / Entertainment' },
  { value: 'nonprofit', label: 'Nonprofit' },
  { value: 'government', label: 'Government / Public Sector' },
  { value: 'other', label: 'Other' },
];

export const COMPANY_SIZES: { value: CompanySize; label: string; sub: string }[] = [
  { value: 'startup', label: 'Startup', sub: '1–10 people' },
  { value: 'small', label: 'Small', sub: '11–50 people' },
  { value: 'mid', label: 'Mid-market', sub: '51–250 people' },
  { value: 'large', label: 'Large', sub: '251–1,000 people' },
  { value: 'enterprise', label: 'Enterprise', sub: '1,000+ people' },
];

export const ROLE_LEVELS: { value: RoleLevel; label: string }[] = [
  { value: 'ic', label: 'Individual Contributor' },
  { value: 'manager', label: 'Manager' },
  { value: 'director', label: 'Director' },
  { value: 'vp', label: 'VP' },
  { value: 'c-suite', label: 'C-Suite' },
  { value: 'founder', label: 'Founder / Owner' },
];

export const PERFORMERS: { value: Performer; label: string; sub: string }[] = [
  { value: 'ic', label: 'Individual contributor', sub: 'Generalist on the team' },
  { value: 'specialist', label: 'Specialist', sub: 'Domain expert (finance, legal, ops)' },
  { value: 'manager', label: 'Manager', sub: 'People leader doing hands-on work' },
  { value: 'vendor', label: 'Vendor / outsourced', sub: 'External party' },
  { value: 'mixed', label: 'Mixed', sub: 'Multiple roles involved' },
];

export const FREQUENCIES: { value: Frequency; label: string; cyclesPerYear: number }[] = [
  { value: 'hourly', label: 'Multiple times per hour', cyclesPerYear: 1000 },
  { value: 'daily', label: 'Daily', cyclesPerYear: 250 },
  { value: 'weekly', label: 'Weekly', cyclesPerYear: 50 },
  { value: 'monthly', label: 'Monthly', cyclesPerYear: 12 },
  { value: 'quarterly', label: 'Quarterly', cyclesPerYear: 4 },
  { value: 'annually', label: 'Annually', cyclesPerYear: 1 },
];

export const APPROACHES: {
  value: AutomationApproach;
  label: string;
  description: string;
  typicalCost: string;
  typicalCostValue: number;
  timeToValue: string;
  bestFor: string;
}[] = [
  {
    value: 'integration',
    label: 'SaaS Integration',
    description: 'Connect existing tools via Zapier, n8n, Make, or native APIs. Lowest code, fastest to ship.',
    typicalCost: '$2K–15K',
    typicalCostValue: 8000,
    timeToValue: '2–6 weeks',
    bestFor: 'Well-defined workflows between SaaS tools with stable APIs',
  },
  {
    value: 'ai',
    label: 'AI / LLM-based',
    description: 'Use Claude, GPT, or fine-tuned models for tasks requiring judgment, extraction, classification, or generation.',
    typicalCost: '$5K–50K',
    typicalCostValue: 25000,
    timeToValue: '4–12 weeks',
    bestFor: 'Unstructured data, language tasks, decisions requiring pattern matching',
  },
  {
    value: 'rpa',
    label: 'RPA (Robotic Process Automation)',
    description: 'UiPath, Automation Anywhere, or Power Automate to mimic human clicks in legacy systems without APIs.',
    typicalCost: '$15K–100K',
    typicalCostValue: 50000,
    timeToValue: '8–16 weeks',
    bestFor: 'Legacy systems, regulated industries, no-API environments',
  },
  {
    value: 'custom',
    label: 'Custom Software',
    description: 'Purpose-built application with internal or external dev team. Most flexible, highest upfront cost.',
    typicalCost: '$50K–300K+',
    typicalCostValue: 150000,
    timeToValue: '3–9 months',
    bestFor: 'Core competitive workflows, complex business logic, scalable products',
  },
];

// ---------- Scoring engine ----------

export function computeAssessment(input: AssessmentInput): AssessmentResult {
  const frequencyMeta = FREQUENCIES.find((f) => f.value === input.frequency)!;
  const approachMeta = APPROACHES.find((a) => a.value === input.approach)!;

  const annualOccurrences = input.occurrencesPerCycle * frequencyMeta.cyclesPerYear;
  const totalAnnualHoursPerPerson =
    (annualOccurrences * input.minutesPerOccurrence) / 60;
  const automatableHoursPerPerson =
    totalAnnualHoursPerPerson * (input.automationPercentage / 100);
  const annualHoursSaved = automatableHoursPerPerson * input.numberOfPeople;
  const annualCostSavings = annualHoursSaved * input.hourlyCost;

  const implementationCost =
    input.implementationCost > 0
      ? input.implementationCost
      : approachMeta.typicalCostValue;

  const monthlySavings = annualCostSavings / 12;
  const paybackMonths = monthlySavings > 0 ? implementationCost / monthlySavings : Infinity;
  const threeYearROI =
    implementationCost > 0
      ? ((3 * annualCostSavings - implementationCost) / implementationCost) * 100
      : 0;
  const fiveYearNetValue = 5 * annualCostSavings - implementationCost;

  // Risk adjustment: base score from payback, then nudge by risk factors
  let baseScore = 0;
  if (paybackMonths < 6) baseScore = 10;
  else if (paybackMonths < 12) baseScore = 8.5;
  else if (paybackMonths < 18) baseScore = 7;
  else if (paybackMonths < 24) baseScore = 5.5;
  else if (paybackMonths < 36) baseScore = 4;
  else if (paybackMonths < 60) baseScore = 2.5;
  else baseScore = 1;

  // Risk adjustments
  const criticalityPenalty = (input.criticality - 1) * 0.4; // 0 to 1.6
  const errorToleranceBonus = (input.errorTolerance - 1) * 0.2; // 0 to 0.8
  const changeCapacityBonus = (input.changeCapacity - 1) * 0.3; // 0 to 1.2

  let riskAdjustedScore = baseScore - criticalityPenalty + errorToleranceBonus + changeCapacityBonus;
  riskAdjustedScore = Math.max(0, Math.min(10, riskAdjustedScore));

  // Verdict
  let verdict: Verdict;
  let verdictReason: string;

  if (paybackMonths > 36 || riskAdjustedScore < 4) {
    verdict = 'NOT_YET';
    verdictReason =
      paybackMonths > 36
        ? `Payback exceeds 3 years (${formatMonths(paybackMonths)}). The capital is better deployed elsewhere unless the strategic value extends well beyond direct savings.`
        : `Risk-adjusted score is ${riskAdjustedScore.toFixed(1)}/10. Process criticality, low error tolerance, or limited change capacity outweigh the financial case right now.`;
  } else if (paybackMonths > 18 || riskAdjustedScore < 7) {
    verdict = 'PILOT_FIRST';
    verdictReason =
      paybackMonths > 18
        ? `Payback of ${formatMonths(paybackMonths)} is acceptable but not obvious. A scoped pilot will validate assumptions before full investment.`
        : `Risk-adjusted score of ${riskAdjustedScore.toFixed(1)}/10 suggests meaningful upside but real execution risk. A pilot de-risks the rollout.`;
  } else {
    verdict = 'AUTOMATE_NOW';
    verdictReason = `Payback of ${formatMonths(paybackMonths)} and risk-adjusted score of ${riskAdjustedScore.toFixed(1)}/10 make this a clear near-term investment. Delaying only forfeits savings.`;
  }

  // Strategic value callouts (qualitative, leadership-relevant)
  const strategicValueCallouts: string[] = [];
  if (annualHoursSaved > 0) {
    strategicValueCallouts.push(
      `Reclaims ~${Math.round(annualHoursSaved).toLocaleString()} hours of ${
        performerLabel(input.performer)
      } capacity annually — equivalent to ${(annualHoursSaved / 2000).toFixed(1)} full-time equivalents.`
    );
  }
  if (input.numberOfPeople > 1) {
    strategicValueCallouts.push(
      `Standardizes a process currently performed by ${input.numberOfPeople} people, reducing variance and audit risk across the team.`
    );
  }
  if (input.criticality >= 4) {
    strategicValueCallouts.push(
      `Removes human error from a business-critical process, where mistakes today carry outsized operational or reputational cost.`
    );
  } else {
    strategicValueCallouts.push(
      `Frees specialist attention for higher-judgment work that automation cannot do — likely the more expensive part of the workflow today.`
    );
  }
  if (annualCostSavings > 0) {
    const scalabilityNote =
      input.approach === 'custom' || input.approach === 'integration'
        ? `Marginal cost of scaling to 2x volume is near zero — headcount cost scales linearly today.`
        : `Approach scales without proportional headcount increases.`;
    strategicValueCallouts.push(scalabilityNote);
  }

  // Risks
  const risks: string[] = [];
  switch (input.approach) {
    case 'rpa':
      risks.push(
        'RPA scripts break when underlying UI changes. Budget ~15% of build cost annually for maintenance.'
      );
      break;
    case 'ai':
      risks.push(
        'LLM outputs require human review for high-stakes decisions. Plan for a "human-in-the-loop" approval step.'
      );
      break;
    case 'integration':
      risks.push(
        'Depends on third-party API stability and rate limits. Vendor changes can break the workflow without warning.'
      );
      break;
    case 'custom':
      risks.push(
        'Custom software creates an ongoing maintenance and ownership burden. Identify the internal owner before building.'
      );
      break;
  }
  if (input.criticality >= 4 && input.errorTolerance <= 2) {
    risks.push(
      'High criticality combined with low error tolerance means a single bad automation outcome can be costly. Phase rollout with shadow-mode validation before cutover.'
    );
  }
  if (input.changeCapacity <= 2) {
    risks.push(
      'Limited change-management capacity on the team. Without dedicated rollout support, adoption will lag and ROI will be delayed by 3–6 months.'
    );
  }
  if (input.numberOfPeople > 10) {
    risks.push(
      `${input.numberOfPeople} people currently perform this process — training and change management will be the long pole, not the technology.`
    );
  }

  // Roadmap
  const roadmap = buildRoadmap(input, verdict);

  // Executive summary
  const executiveSummary = buildExecutiveSummary(input, {
    annualCostSavings,
    paybackMonths,
    annualHoursSaved,
    verdict,
    approach: approachMeta,
  });

  const recommendation =
    verdict === 'AUTOMATE_NOW'
      ? `Fund this initiative in the current planning cycle. Assign an owner, allocate the budget (~$${Math.round(implementationCost / 1000)}K), and target a ${approachMeta.timeToValue.toLowerCase()} time-to-value.`
      : verdict === 'PILOT_FIRST'
      ? `Approve a scoped 6-week pilot with clear success metrics: hours saved, error rate, and user satisfaction. Re-evaluate full investment based on pilot outcomes.`
      : `Defer this initiative. Re-evaluate in 2 quarters if implementation costs fall, the process scales further, or strategic priorities shift. Consider lower-cost alternatives first.`;

  return {
    verdict,
    verdictReason,
    annualHoursSaved,
    annualCostSavings,
    implementationCost,
    paybackMonths,
    threeYearROI,
    fiveYearNetValue,
    riskAdjustedScore,
    strategicValueCallouts,
    risks,
    roadmap,
    executiveSummary,
    recommendation,
  };
}

function buildRoadmap(
  input: AssessmentInput,
  verdict: Verdict
): { phase: string; duration: string; description: string }[] {
  const approachMeta = APPROACHES.find((a) => a.value === input.approach)!;
  const pilotPhase =
    verdict !== 'AUTOMATE_NOW'
      ? [
          {
            phase: 'Phase 0 — Pilot',
            duration: '4–6 weeks',
            description:
              'Scope to one team or one workflow variant. Measure baseline, deploy, validate savings assumptions before scaling.',
          },
        ]
      : [];

  return [
    ...pilotPhase,
    {
      phase: 'Phase 1 — Discovery & Design',
      duration: '2–3 weeks',
      description:
        'Document the current process step-by-step, define success metrics, design the target workflow, and identify integration points.',
    },
    {
      phase: 'Phase 2 — Build',
      duration: approachMeta.timeToValue,
      description: `Build the ${approachMeta.label.toLowerCase()} solution. Include error handling, observability, and a human fallback path. Internal QA against real production data.`,
    },
    {
      phase: 'Phase 3 — Shadow Mode',
      duration: '2 weeks',
      description:
        'Run automation in parallel with humans. Compare outputs, catch edge cases, build team confidence before cutover.',
    },
    {
      phase: 'Phase 4 — Rollout & Adoption',
      duration: '3–4 weeks',
      description:
        'Train the team, switch over, monitor KPIs weekly. Capture hours saved and re-deploy that capacity to higher-value work.',
    },
    {
      phase: 'Phase 5 — Iterate',
      duration: 'Ongoing',
      description:
        'Quarterly review. Expand to adjacent processes, tune the automation percentage up, retire manual steps that are no longer needed.',
    },
  ];
}

function buildExecutiveSummary(
  input: AssessmentInput,
  result: {
    annualCostSavings: number;
    paybackMonths: number;
    annualHoursSaved: number;
    verdict: Verdict;
    approach: (typeof APPROACHES)[number];
  }
): string {
  const sizeLabel = COMPANY_SIZES.find((s) => s.value === input.companySize)?.label;
  const industryLabel = INDUSTRIES.find((i) => i.value === input.industry)?.label;
  const approachLabel = result.approach.label;

  const verdictPhrase =
    result.verdict === 'AUTOMATE_NOW'
      ? 'warrants immediate investment'
      : result.verdict === 'PILOT_FIRST'
      ? 'warrants a scoped pilot before full commitment'
      : 'does not currently warrant investment';

  return `This assessment evaluated "${input.processName || 'the process'}" — a ${input.frequency} workflow performed by ${input.numberOfPeople} ${
    performerLabel(input.performer).toLowerCase()
  }${input.numberOfPeople > 1 ? 's' : ''} in a ${sizeLabel?.toLowerCase()} ${industryLabel?.toLowerCase()} organization. The proposed ${approachLabel.toLowerCase()} approach automates approximately ${input.automationPercentage}% of the workflow, yielding an estimated ${Math.round(result.annualHoursSaved).toLocaleString()} hours and $${Math.round(result.annualCostSavings).toLocaleString()} in annual savings with a ${formatMonths(result.paybackMonths)} payback period. Based on the financial case and risk profile, this initiative ${verdictPhrase}.`;
}

function performerLabel(p: Performer): string {
  return (
    {
      ic: 'individual contributor',
      specialist: 'specialist',
      manager: 'manager',
      vendor: 'vendor resource',
      mixed: 'team member',
    }[p] || 'team member'
  );
}

export function formatMonths(months: number): string {
  if (!isFinite(months)) return 'N/A';
  if (months < 1) return '< 1 month';
  if (months < 12) return `${Math.round(months)} months`;
  const years = months / 12;
  if (years < 2) return `${years.toFixed(1)} years`;
  return `${Math.round(years)} years`;
}

export function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${Math.round(n).toLocaleString()}`;
}

export function formatNumber(n: number): string {
  return Math.round(n).toLocaleString();
}
