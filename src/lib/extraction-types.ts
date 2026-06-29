// Shared types for AI extraction — kept separate from route.ts so client components
// can import these without pulling in z-ai-web-dev-sdk.
import {
  AutomationApproach,
  Frequency,
  Performer,
} from '@/lib/automation';
import { AssessmentInput } from '@/lib/automation';

export interface BudgetBreakdown {
  tooling: string; // e.g., "$25/mo"
  implementation: string; // e.g., "$8K one-time"
  ongoing: string; // e.g., "$500/yr maintenance"
  totalYear1: string; // e.g., "$11.3K"
}

export interface IndustryBenchmarks {
  maturity: string; // e.g., "Mid-maturity — typical for your industry/size"
  commonPatterns: string[]; // 2-3 common automation patterns in this industry
  averageRoi: string; // e.g., "Companies like yours typically see 180% ROI over 3 years"
}

export interface ExtractionResult {
  // Extracted process fields
  processName: string | null;
  processDescription: string | null;
  performer: Performer | null;
  frequency: Frequency | null;
  occurrencesPerCycle: number | null;
  minutesPerOccurrence: number | null;
  hourlyCost: number | null;
  numberOfPeople: number | null;
  approach: AutomationApproach | null;
  automationPercentage: number | null;
  criticality: number | null;
  errorTolerance: number | null;

  // AI-generated context
  assumptions: string[];
  approachRationale: string | null;
  redFlags: string[];
  adjacentProcesses: string[];
  confidence: 'high' | 'medium' | 'low';
  extractionNotes: string;

  // NEW: Action plan fields (v2)
  recommendedToolIds: string[]; // tool IDs from tools-db.ts
  toolRationale: string; // why these tools fit
  caseStudyIds: string[]; // case study IDs from case-studies-db.ts
  templateIds: string[]; // template IDs from workflow-templates-db.ts
  firstStep: string; // concrete action the user can take today
  budgetBreakdown: BudgetBreakdown;
  industryBenchmarks: IndustryBenchmarks;
}

// Helper to merge extraction result into AssessmentInput with sensible defaults
export function mergeExtractionToInput(
  extraction: ExtractionResult,
  overrides: Partial<AssessmentInput> = {}
): AssessmentInput {
  return {
    industry: overrides.industry || 'technology',
    companySize: overrides.companySize || 'mid',
    roleLevel: overrides.roleLevel || 'director',

    processName: extraction.processName || overrides.processName || '',
    processDescription: extraction.processDescription || overrides.processDescription || '',
    performer: extraction.performer || overrides.performer || 'specialist',
    frequency: extraction.frequency || overrides.frequency || 'daily',
    occurrencesPerCycle: extraction.occurrencesPerCycle ?? overrides.occurrencesPerCycle ?? 1,
    minutesPerOccurrence: extraction.minutesPerOccurrence ?? overrides.minutesPerOccurrence ?? 30,

    hourlyCost: extraction.hourlyCost ?? overrides.hourlyCost ?? 75,
    numberOfPeople: extraction.numberOfPeople ?? overrides.numberOfPeople ?? 1,
    implementationCost: overrides.implementationCost ?? 0,

    approach: extraction.approach || overrides.approach || 'integration',
    automationPercentage: extraction.automationPercentage ?? overrides.automationPercentage ?? 70,

    criticality: extraction.criticality ?? overrides.criticality ?? 3,
    errorTolerance: extraction.errorTolerance ?? overrides.errorTolerance ?? 3,
    changeCapacity: overrides.changeCapacity ?? 3, // can't be extracted from text — about the team
  };
}
