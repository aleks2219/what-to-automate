'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  Edit3,
  Zap,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  AssessmentInput,
  INDUSTRIES,
  COMPANY_SIZES,
  ROLE_LEVELS,
  PERFORMERS,
  FREQUENCIES,
  APPROACHES,
  Industry,
  CompanySize,
  RoleLevel,
  Performer,
  Frequency,
  AutomationApproach,
} from '@/lib/automation';
import { ExtractionResult, mergeExtractionToInput } from '@/lib/extraction-types';

interface ConfirmProps {
  extraction: ExtractionResult;
  onGenerate: (input: AssessmentInput) => void;
  onBack: () => void;
  onRestart: () => void;
}

export function ConfirmExtracted({ extraction, onGenerate, onBack, onRestart }: ConfirmProps) {
  // Company context (about the user, not extractable from process description)
  const [industry, setIndustry] = useState<Industry>('technology');
  const [companySize, setCompanySize] = useState<CompanySize>('mid');
  const [roleLevel, setRoleLevel] = useState<RoleLevel>('director');

  // Editable process fields — initialized from extraction
  const [processName, setProcessName] = useState(extraction.processName || '');
  const [performer, setPerformer] = useState<Performer>(
    extraction.performer || 'specialist'
  );
  const [frequency, setFrequency] = useState<Frequency>(
    extraction.frequency || 'daily'
  );
  const [occurrencesPerCycle, setOccurrencesPerCycle] = useState<number>(
    extraction.occurrencesPerCycle ?? 1
  );
  const [minutesPerOccurrence, setMinutesPerOccurrence] = useState<number>(
    extraction.minutesPerOccurrence ?? 30
  );
  const [hourlyCost, setHourlyCost] = useState<number>(extraction.hourlyCost ?? 75);
  const [numberOfPeople, setNumberOfPeople] = useState<number>(
    extraction.numberOfPeople ?? 1
  );
  const [approach, setApproach] = useState<AutomationApproach>(
    extraction.approach || 'integration'
  );
  const [automationPercentage, setAutomationPercentage] = useState<number>(
    extraction.automationPercentage ?? 70
  );
  const [criticality, setCriticality] = useState<number>(extraction.criticality ?? 3);
  const [errorTolerance, setErrorTolerance] = useState<number>(
    extraction.errorTolerance ?? 3
  );

  const handleGenerate = () => {
    const input: AssessmentInput = mergeExtractionToInput(extraction, {
      industry,
      companySize,
      roleLevel,
      processName,
      performer,
      frequency,
      occurrencesPerCycle,
      minutesPerOccurrence,
      hourlyCost,
      numberOfPeople,
      approach,
      automationPercentage,
      criticality,
      errorTolerance,
    });
    onGenerate(input);
  };

  const approachMeta = APPROACHES.find((a) => a.value === approach)!;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/30">
      <header className="border-b border-stone-200/60 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-700 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-stone-900 tracking-tight">AutoScore</span>
          </div>
          <button
            onClick={onRestart}
            className="text-sm text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Start over
          </button>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <Badge className="bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100">
                <Sparkles className="w-3 h-3 mr-1" />
                AI extracted
              </Badge>
              <Badge
                variant="outline"
                className={
                  extraction.confidence === 'high'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : extraction.confidence === 'medium'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : 'bg-stone-100 text-stone-600 border-stone-200'
                }
              >
                Confidence: {extraction.confidence}
              </Badge>
            </div>

            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-stone-900 mb-2">
              Confirm the details
            </h1>
            <p className="text-stone-600 mb-2 leading-relaxed">
              {extraction.extractionNotes ||
                'Quickly review what we extracted. Tap any field to adjust — most should be right.'}
            </p>
            <p className="text-xs text-stone-500 mb-8">
              You don&apos;t need to fill in everything. Empty fields use sensible defaults.
            </p>

            {/* AI Assumptions + Red flags */}
            {(extraction.assumptions.length > 0 || extraction.redFlags.length > 0) && (
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {extraction.assumptions.length > 0 && (
                  <Card className="border-emerald-100 bg-emerald-50/40">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-800 uppercase tracking-wider mb-2">
                        <Lightbulb className="w-3 h-3" />
                        Assumptions made
                      </div>
                      <ul className="space-y-1.5">
                        {extraction.assumptions.map((a, i) => (
                          <li key={i} className="text-xs text-stone-700 flex items-start gap-1.5">
                            <span className="text-emerald-600 mt-0.5">•</span>
                            <span>{a}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
                {extraction.redFlags.length > 0 && (
                  <Card className="border-amber-100 bg-amber-50/40">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-amber-800 uppercase tracking-wider mb-2">
                        <AlertCircle className="w-3 h-3" />
                        Watch out for
                      </div>
                      <ul className="space-y-1.5">
                        {extraction.redFlags.map((r, i) => (
                          <li key={i} className="text-xs text-stone-700 flex items-start gap-1.5">
                            <span className="text-amber-600 mt-0.5">•</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* Company context — about the user, not extracted */}
            <Section
              icon={Building2}
              title="Your company"
              hint="About you — the AI can&apos;t extract this from the process description."
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Industry">
                  <Select value={industry} onValueChange={(v) => setIndustry(v as Industry)}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((i) => (
                        <SelectItem key={i.value} value={i.value}>
                          {i.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Company size">
                  <Select value={companySize} onValueChange={(v) => setCompanySize(v as CompanySize)}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_SIZES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Your role">
                  <Select value={roleLevel} onValueChange={(v) => setRoleLevel(v as RoleLevel)}>
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_LEVELS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </Section>

            {/* Process fields */}
            <Section icon={Edit3} title="Process details" hint="AI-extracted. Tap to adjust.">
              <div className="space-y-4">
                <Field label="Process name">
                  <Input
                    value={processName}
                    onChange={(e) => setProcessName(e.target.value)}
                    className="bg-white"
                    placeholder="e.g., Monthly vendor invoice reconciliation"
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Field label="Who performs this?">
                    <Select value={performer} onValueChange={(v) => setPerformer(v as Performer)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PERFORMERS.map((p) => (
                          <SelectItem key={p.value} value={p.value}>
                            {p.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="How often?">
                    <Select value={frequency} onValueChange={(v) => setFrequency(v as Frequency)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FREQUENCIES.map((f) => (
                          <SelectItem key={f.value} value={f.value}>
                            {f.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Occurrences per cycle">
                    <Input
                      type="number"
                      min={1}
                      value={occurrencesPerCycle}
                      onChange={(e) => setOccurrencesPerCycle(Number(e.target.value))}
                      className="bg-white"
                    />
                  </Field>
                  <Field label="Minutes per occurrence">
                    <Input
                      type="number"
                      min={1}
                      value={minutesPerOccurrence}
                      onChange={(e) => setMinutesPerOccurrence(Number(e.target.value))}
                      className="bg-white"
                    />
                  </Field>
                </div>
              </div>
            </Section>

            {/* Costs */}
            <Section icon={Edit3} title="Costs" hint="AI-estimated. Adjust to match your reality.">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Field label="Loaded $/hour">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">$</span>
                    <Input
                      type="number"
                      min={1}
                      value={hourlyCost}
                      onChange={(e) => setHourlyCost(Number(e.target.value))}
                      className="bg-white pl-7"
                    />
                  </div>
                </Field>
                <Field label="# people performing">
                  <Input
                    type="number"
                    min={1}
                    value={numberOfPeople}
                    onChange={(e) => setNumberOfPeople(Number(e.target.value))}
                    className="bg-white"
                  />
                </Field>
                <div />
              </div>
            </Section>

            {/* Approach */}
            <Section
              icon={Sparkles}
              title="Recommended approach"
              hint={extraction.approachRationale || 'AI recommended based on process characteristics.'}
            >
              <Select value={approach} onValueChange={(v) => setApproach(v as AutomationApproach)}>
                <SelectTrigger className="bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {APPROACHES.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label} — {a.typicalCost} · {a.timeToValue}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-stone-500 mt-2">
                <span className="text-stone-400">Default cost:</span> {approachMeta.typicalCost} ·{' '}
                <span className="text-stone-400">Time to value:</span> {approachMeta.timeToValue}
              </p>

              <div className="mt-4">
                <Field label={`Automation percentage: ${automationPercentage}%`}>
                  <Slider
                    value={[automationPercentage]}
                    onValueChange={(v) => setAutomationPercentage(v[0])}
                    min={10}
                    max={100}
                    step={5}
                  />
                </Field>
              </div>
            </Section>

            {/* Risk sliders */}
            <Section
              icon={AlertCircle}
              title="Risk profile"
              hint="AI-estimated based on language in your description. Adjust if needed."
            >
              <div className="space-y-5">
                <MiniSlider
                  label="Process criticality"
                  value={criticality}
                  onChange={setCriticality}
                  leftLabel="Nicety"
                  rightLabel="Mission-critical"
                />
                <MiniSlider
                  label="Error tolerance"
                  value={errorTolerance}
                  onChange={setErrorTolerance}
                  leftLabel="Zero tolerance"
                  rightLabel="Errors OK"
                />
              </div>
            </Section>

            {/* Adjacent processes suggestion */}
            {extraction.adjacentProcesses.length > 0 && (
              <Card className="border-stone-200 bg-stone-50/60 mb-6">
                <CardContent className="p-4">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-stone-700 uppercase tracking-wider mb-2">
                    <Lightbulb className="w-3 h-3" />
                    After this, you might also automate
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {extraction.adjacentProcesses.map((p, i) => (
                      <Badge key={i} variant="outline" className="bg-white text-stone-700 font-normal">
                        {p}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Generate */}
            <Card className="border-emerald-200 bg-emerald-50/40">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-700 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-stone-900 mb-1">Ready to generate</div>
                    <p className="text-sm text-stone-600 mb-4">
                      We&apos;ll run the scoring engine and produce your assessment.
                      You can edit anything afterward and re-run.
                    </p>
                    <Button
                      onClick={handleGenerate}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white w-full sm:w-auto"
                    >
                      Generate report
                      <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>

      <footer className="border-t border-stone-200/60 bg-white py-4">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-stone-600 hover:text-stone-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="text-xs text-stone-400">
            Everything is editable. Nothing is locked in.
          </div>
        </div>
      </footer>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  hint,
  children,
}: {
  icon: typeof Building2;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4 text-stone-700" />
        <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
      </div>
      {hint && <p className="text-xs text-stone-500 mb-3 ml-6">{hint}</p>}
      <div className="ml-6">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-xs font-medium text-stone-600 mb-1.5 block">{label}</Label>
      {children}
    </div>
  );
}

function MiniSlider({
  label,
  value,
  onChange,
  leftLabel,
  rightLabel,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  leftLabel: string;
  rightLabel: string;
}) {
  return (
    <div>
      <Label className="text-xs font-medium text-stone-600 mb-2 block">{label}</Label>
      <div className="flex items-center gap-3">
        <span className="text-xs text-stone-400 w-24 text-right flex-shrink-0">{leftLabel}</span>
        <Slider
          value={[value]}
          onValueChange={(v) => onChange(v[0])}
          min={1}
          max={5}
          step={1}
          className="flex-1"
        />
        <span className="text-xs text-stone-400 w-24 flex-shrink-0">{rightLabel}</span>
        <span className="text-sm font-semibold text-stone-900 w-6 text-center">{value}</span>
      </div>
    </div>
  );
}
