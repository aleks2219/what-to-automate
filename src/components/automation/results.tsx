'use client';

import { motion } from 'framer-motion';
import {
  TrendingUp,
  AlertTriangle,
  Clock,
  DollarSign,
  Users,
  Target,
  FileText,
  RefreshCw,
  ShieldAlert,
  Lightbulb,
  CheckCircle2,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AssessmentInput, AssessmentResult, formatCurrency, formatMonths, formatNumber, APPROACHES } from '@/lib/automation';
import { ExtractionResult } from '@/lib/extraction-types';
import { ActionPlan } from '@/components/automation/action-plan';
import { CaseStudiesSection } from '@/components/automation/case-studies-section';
import { TemplatesSection } from '@/components/automation/templates-section';
import { EmailCapture } from '@/components/automation/email-capture';
import { ToolshedAnalysis } from '@/components/automation/toolshed-analysis';

interface ResultsProps {
  input: AssessmentInput;
  result: AssessmentResult;
  extraction?: ExtractionResult | null;
  onRestart: () => void;
}

const VERDICT_STYLES = {
  AUTOMATE_NOW: {
    bg: 'bg-emerald-700',
    text: 'text-white',
    icon: TrendingUp,
    section: 'border-emerald-200 bg-emerald-50/40',
    accent: 'text-emerald-700',
    bar: 'bg-emerald-600',
  },
  PILOT_FIRST: {
    bg: 'bg-amber-600',
    text: 'text-white',
    icon: AlertTriangle,
    section: 'border-amber-200 bg-amber-50/40',
    accent: 'text-amber-700',
    bar: 'bg-amber-600',
  },
  NOT_YET: {
    bg: 'bg-stone-700',
    text: 'text-white',
    icon: Clock,
    section: 'border-stone-200 bg-stone-50/60',
    accent: 'text-stone-700',
    bar: 'bg-stone-600',
  },
} as const;

export function Results({ input, result, extraction, onRestart }: ResultsProps) {
  const styles = VERDICT_STYLES[result.verdict];
  const VerdictIcon = styles.icon;
  const verdictLabel =
    result.verdict === 'AUTOMATE_NOW'
      ? 'AUTOMATE NOW'
      : result.verdict === 'PILOT_FIRST'
      ? 'PILOT FIRST'
      : 'NOT YET';

  const approachMeta = APPROACHES.find((a) => a.value === input.approach)!;

  // Build cumulative savings chart data over 5 years
  const chartData = Array.from({ length: 60 }, (_, i) => {
    const month = i + 1;
    const cumulativeSavings = (result.annualCostSavings / 12) * month;
    return {
      month,
      savings: Math.round(cumulativeSavings),
      investment: Math.round(result.implementationCost),
    };
  });

  const handleExportPDF = () => {
    window.print();
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/30">
      {/* Screen-only header (hidden in print) */}
      <header className="border-b border-stone-200/60 bg-white sticky top-0 z-10 print:hidden">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-700 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-stone-900 tracking-tight">AutoScore Report</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onRestart}
              className="text-stone-700 border-stone-300 hover:bg-stone-50"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              New assessment
            </Button>
            <Button
              onClick={handleExportPDF}
              className="bg-emerald-700 hover:bg-emerald-800 text-white"
            >
              <FileText className="w-4 h-4 mr-1.5" />
              Export PDF
            </Button>
          </div>
        </div>
      </header>

      {/* Print-only header */}
      <div className="hidden print:block px-12 pt-10 pb-4">
        <div className="flex items-center justify-between border-b-2 border-stone-900 pb-4">
          <div>
            <div className="text-2xl font-bold text-stone-900">AutoScore Report</div>
            <div className="text-sm text-stone-600 mt-1">
              Automation assessment: {input.processName}
            </div>
          </div>
          <div className="text-right text-sm text-stone-600">
            <div>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div className="mt-1">Confidential — for internal use</div>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-10 print:px-12 print:py-6">
        {/* Verdict hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <Card className={`border-2 ${styles.section} print:shadow-none`}>
            <CardContent className="p-8 print:p-0">
              <div className="flex flex-col lg:flex-row gap-6 items-start">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-md ${styles.bg} ${styles.text} text-sm font-bold tracking-wide flex-shrink-0`}>
                  <VerdictIcon className="w-4 h-4" />
                  {verdictLabel}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-stone-900 mb-3 print:text-xl">
                    {input.processName || 'Process assessment'}
                  </h1>
                  <p className="text-stone-700 leading-relaxed mb-4 print:text-sm">
                    {result.verdictReason}
                  </p>
                  <p className="text-stone-600 leading-relaxed print:text-sm">
                    {result.executiveSummary}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Key metrics row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 print:grid-cols-4 print:gap-3">
          <MetricCard
            icon={DollarSign}
            label="Annual savings"
            value={formatCurrency(result.annualCostSavings)}
            sub={`${formatNumber(result.annualCostSavings / 12)}/mo`}
            accent={styles.accent}
          />
          <MetricCard
            icon={Clock}
            label="Payback period"
            value={formatMonths(result.paybackMonths)}
            sub={`${result.threeYearROI > 0 ? '+' : ''}${Math.round(result.threeYearROI)}% 3-yr ROI`}
            accent={styles.accent}
          />
          <MetricCard
            icon={Users}
            label="Hours reclaimed"
            value={`${formatNumber(result.annualHoursSaved)} hrs`}
            sub={`${(result.annualHoursSaved / 2000).toFixed(1)} FTE/yr`}
            accent={styles.accent}
          />
          <MetricCard
            icon={Target}
            label="Risk-adjusted score"
            value={`${result.riskAdjustedScore.toFixed(1)}/10`}
            sub={`Implementation ${formatCurrency(result.implementationCost)}`}
            accent={styles.accent}
          />
        </div>

        {/* Savings chart */}
        <Card className="mb-10 border-stone-200 print:shadow-none">
          <CardContent className="p-6 print:p-0">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-semibold text-stone-900">
                Cumulative savings vs. implementation cost
              </h2>
              <span className="text-xs text-stone-500">5-year horizon</span>
            </div>
            <p className="text-sm text-stone-500 mb-5">
              When cumulative savings (line) cross implementation cost (dashed), payback is reached.
            </p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#888' }}
                    tickFormatter={(v) => (v % 12 === 0 ? `Yr ${v / 12}` : '')}
                    interval={6}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#888' }}
                    tickFormatter={(v) => (v >= 1000 ? `$${(v / 1000).toFixed(0)}K` : `$${v}`)}
                  />
                  <Tooltip
                    formatter={(v: number) => formatCurrency(v)}
                    labelFormatter={(v) => `Month ${v}`}
                    contentStyle={{
                      fontSize: 12,
                      borderRadius: 6,
                      border: '1px solid #e7e5e4',
                    }}
                  />
                  <ReferenceLine
                    y={result.implementationCost}
                    stroke="#78716c"
                    strokeDasharray="4 4"
                    label={{
                      value: 'Investment',
                      position: 'insideTopRight',
                      fontSize: 10,
                      fill: '#78716c',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="savings"
                    stroke="#047857"
                    strokeWidth={2}
                    fill="#047857"
                    fillOpacity={0.08}
                    name="Cumulative savings"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <ChartStat label="3-year net value" value={formatCurrency(3 * result.annualCostSavings - result.implementationCost)} />
              <ChartStat label="5-year net value" value={formatCurrency(result.fiveYearNetValue)} />
              <ChartStat label="3-year ROI" value={`${result.threeYearROI > 0 ? '+' : ''}${Math.round(result.threeYearROI)}%`} />
            </div>
          </CardContent>
        </Card>

        {/* Two-column: strategic value + risks */}
        <div className="grid lg:grid-cols-2 gap-6 mb-10 print:grid-cols-2 print:gap-4">
          {/* Strategic value */}
          <Card className="border-stone-200 print:shadow-none">
            <CardContent className="p-6 print:p-0">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-4 h-4 text-emerald-700" />
                <h2 className="text-lg font-semibold text-stone-900">Strategic value</h2>
              </div>
              <p className="text-sm text-stone-500 mb-4">
                Why this matters beyond direct savings.
              </p>
              <div className="space-y-4">
                {result.strategicValueCallouts.map((callout, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-stone-700 leading-relaxed">{callout}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Risks */}
          <Card className="border-stone-200 print:shadow-none">
            <CardContent className="p-6 print:p-0">
              <div className="flex items-center gap-2 mb-4">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <h2 className="text-lg font-semibold text-stone-900">Risks & considerations</h2>
              </div>
              <p className="text-sm text-stone-500 mb-4">
                What could go wrong, and what to plan for.
              </p>
              <div className="space-y-4">
                {result.risks.length === 0 ? (
                  <p className="text-sm text-stone-500">No material risks identified for this profile.</p>
                ) : (
                  result.risks.map((risk, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-stone-700 leading-relaxed">{risk}</span>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Roadmap */}
        <Card className="mb-10 border-stone-200 print:shadow-none">
          <CardContent className="p-6 print:p-0">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-stone-700" />
              <h2 className="text-lg font-semibold text-stone-900">Implementation roadmap</h2>
            </div>
            <p className="text-sm text-stone-500 mb-6">
              Phased rollout for {approachMeta.label.toLowerCase()} approach.
            </p>
            <div className="space-y-4">
              {result.roadmap.map((phase, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-8 h-8 rounded-full ${styles.bar} text-white text-xs font-semibold flex items-center justify-center`}>
                      {i + 1}
                    </div>
                    {i < result.roadmap.length - 1 && (
                      <div className="w-px flex-1 bg-stone-200 my-1" style={{ minHeight: '20px' }} />
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-baseline justify-between gap-3 mb-1">
                      <h3 className="font-semibold text-stone-900 text-sm">{phase.phase}</h3>
                      <span className="text-xs text-stone-500 flex-shrink-0">{phase.duration}</span>
                    </div>
                    <p className="text-sm text-stone-600 leading-relaxed">{phase.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendation */}
        <Card className={`border-2 ${styles.section} print:shadow-none`}>
          <CardContent className="p-6 print:p-0">
            <div className="flex items-center gap-2 mb-3">
              <ArrowRight className="w-4 h-4 text-stone-700" />
              <h2 className="text-lg font-semibold text-stone-900">Recommendation</h2>
            </div>
            <p className="text-stone-700 leading-relaxed">{result.recommendation}</p>
          </CardContent>
        </Card>

        {/* Action Plan — only render when extraction data is available (AI-assisted flow) */}
        {extraction && (extraction.recommendedToolIds.length > 0 || extraction.firstStep) && (
          <div className="space-y-6">
            <div className="pt-6 border-t border-stone-200">
              <h2 className="text-xl font-semibold text-stone-900 mb-1">Your action plan</h2>
              <p className="text-sm text-stone-600">
                Concrete next steps — specific tools, real case studies, and what to do today.
              </p>
            </div>

            {/* Toolshed analysis — only render when user provided current tools */}
            {extraction.currentToolAnalysis && extraction.currentToolAnalysis.length > 0 && (
              <ToolshedAnalysis
                currentToolAnalysis={extraction.currentToolAnalysis}
                consolidationOpportunities={extraction.consolidationOpportunities || []}
                toolshedGaps={extraction.toolshedGaps || []}
                usesExistingTools={extraction.usesExistingTools || false}
                toolshedSavings={extraction.toolshedSavings || 'None identified'}
              />
            )}

            <ActionPlan
              recommendedToolIds={extraction.recommendedToolIds}
              toolRationale={extraction.toolRationale}
              firstStep={extraction.firstStep}
              budgetBreakdown={extraction.budgetBreakdown}
              industryBenchmarks={extraction.industryBenchmarks}
            />
            <CaseStudiesSection caseStudyIds={extraction.caseStudyIds} />
            <TemplatesSection templateIds={extraction.templateIds} />
          </div>
        )}

        {/* Email capture — soft gate for PDF + playbook */}
        <EmailCapture
          processName={input.processName}
          verdict={verdictLabel}
          annualSavings={formatCurrency(result.annualCostSavings)}
        />

        {/* Assessment summary footer */}
        <div className="mt-10 pt-6 border-t border-stone-200 print:mt-6">
          <h3 className="text-xs font-medium uppercase tracking-wider text-stone-500 mb-3">
            Assessment inputs
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 text-sm">
            <InputPair label="Industry" value={getLabel('industry', input.industry)} />
            <InputPair label="Company size" value={getLabel('size', input.companySize)} />
            <InputPair label="Frequency" value={getLabel('freq', input.frequency)} />
            <InputPair label="Occurrences / cycle" value={String(input.occurrencesPerCycle)} />
            <InputPair label="Minutes / occurrence" value={String(input.minutesPerOccurrence)} />
            <InputPair label="People performing" value={String(input.numberOfPeople)} />
            <InputPair label="Loaded $/hour" value={`$${input.hourlyCost}`} />
            <InputPair label="Approach" value={approachMeta.label} />
            <InputPair label="Automation %" value={`${input.automationPercentage}%`} />
            <InputPair label="Implementation cost" value={input.implementationCost > 0 ? formatCurrency(input.implementationCost) : `${approachMeta.typicalCost} (default)`} />
            <InputPair label="Criticality" value={`${input.criticality}/5`} />
            <InputPair label="Error tolerance" value={`${input.errorTolerance}/5`} />
          </div>
        </div>
      </main>

      <footer className="border-t border-stone-200/60 bg-white py-5 print:hidden">
        <div className="max-w-5xl mx-auto px-6 text-xs text-stone-500 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>Generated by AutoScore — {new Date().toLocaleDateString()}</span>
          <span>Estimates only. Validate before capital allocation.</span>
        </div>
      </footer>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  sub: string;
  accent: string;
}) {
  return (
    <Card className="border-stone-200 print:shadow-none print:border-stone-300">
      <CardContent className="p-5 print:p-3">
        <div className="flex items-center gap-2 mb-2 text-stone-500">
          <Icon className={`w-3.5 h-3.5 ${accent}`} />
          <span className="text-xs font-medium uppercase tracking-wider">{label}</span>
        </div>
        <div className="text-2xl font-semibold text-stone-900 print:text-xl">{value}</div>
        <div className="text-xs text-stone-500 mt-1">{sub}</div>
      </CardContent>
    </Card>
  );
}

function ChartStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-xs text-stone-500 mb-1">{label}</div>
      <div className="text-lg font-semibold text-stone-900">{value}</div>
    </div>
  );
}

function InputPair({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-stone-400">{label}</div>
      <div className="text-sm text-stone-700 font-medium">{value}</div>
    </div>
  );
}

function getLabel(kind: 'industry' | 'size' | 'freq', value: string): string {
  if (kind === 'industry') {
    const found = INDUSTRIES_LABELS[value] || value;
    return found;
  }
  if (kind === 'size') {
    return SIZES_LABELS[value] || value;
  }
  if (kind === 'freq') {
    return FREQ_LABELS[value] || value;
  }
  return value;
}

const INDUSTRIES_LABELS: Record<string, string> = {
  technology: 'Technology',
  finance: 'Finance',
  healthcare: 'Healthcare',
  manufacturing: 'Manufacturing',
  retail: 'Retail',
  'professional-services': 'Professional Services',
  education: 'Education',
  logistics: 'Logistics',
  media: 'Media',
  nonprofit: 'Nonprofit',
  government: 'Government',
  other: 'Other',
};

const SIZES_LABELS: Record<string, string> = {
  startup: 'Startup (1–10)',
  small: 'Small (11–50)',
  mid: 'Mid-market (51–250)',
  large: 'Large (251–1000)',
  enterprise: 'Enterprise (1000+)',
};

const FREQ_LABELS: Record<string, string> = {
  hourly: 'Multiple/hour',
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annually: 'Annually',
};
