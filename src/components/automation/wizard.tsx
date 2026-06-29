'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  ClipboardList,
  DollarSign,
  Cpu,
  ShieldAlert,
  Check,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

interface WizardProps {
  onComplete: (input: AssessmentInput) => void;
  onBack: () => void;
}

const STEPS = [
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'process', label: 'Process', icon: ClipboardList },
  { id: 'costs', label: 'Costs', icon: DollarSign },
  { id: 'approach', label: 'Approach', icon: Cpu },
  { id: 'risk', label: 'Risk', icon: ShieldAlert },
] as const;

const DEFAULT_INPUT: AssessmentInput = {
  industry: 'technology',
  companySize: 'mid',
  roleLevel: 'director',
  processName: '',
  processDescription: '',
  performer: 'specialist',
  frequency: 'daily',
  occurrencesPerCycle: 1,
  minutesPerOccurrence: 30,
  hourlyCost: 75,
  numberOfPeople: 1,
  implementationCost: 0,
  approach: 'integration',
  automationPercentage: 70,
  criticality: 3,
  errorTolerance: 3,
  changeCapacity: 3,
};

export function Wizard({ onComplete, onBack }: WizardProps) {
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<AssessmentInput>(DEFAULT_INPUT);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const update = <K extends keyof AssessmentInput>(
    key: K,
    value: AssessmentInput[K]
  ) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const isStepValid = (stepIndex: number): boolean => {
    switch (stepIndex) {
      case 0:
        return !!input.industry && !!input.companySize && !!input.roleLevel;
      case 1:
        return (
          input.processName.trim().length > 0 &&
          input.occurrencesPerCycle > 0 &&
          input.minutesPerOccurrence > 0
        );
      case 2:
        return input.hourlyCost > 0 && input.numberOfPeople > 0;
      case 3:
        return !!input.approach && input.automationPercentage > 0;
      case 4:
        return true; // risk sliders always valid
      default:
        return true;
    }
  };

  const handleNext = () => {
    setTouched((prev) => ({ ...prev, [`step${step}`]: true }));
    if (!isStepValid(step)) return;
    if (step < STEPS.length - 1) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onComplete(input);
    }
  };

  const handleBack = () => {
    if (step === 0) {
      onBack();
    } else {
      setStep(step - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const currentStepInvalid = touched[`step${step}`] && !isStepValid(step);

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/30">
      {/* Header */}
      <header className="border-b border-stone-200/60 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-700 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-stone-900 tracking-tight">AutoScore</span>
          </div>
          <button
            onClick={onBack}
            className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
          >
            Cancel
          </button>
        </div>
        {/* Stepper */}
        <div className="max-w-4xl mx-auto px-6 pb-4">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = i === step;
              const isComplete = i < step;
              return (
                <div key={s.id} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1.5">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        isComplete
                          ? 'bg-emerald-700 text-white'
                          : isActive
                          ? 'bg-stone-900 text-white'
                          : 'bg-stone-100 text-stone-400'
                      }`}
                    >
                      {isComplete ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <span
                      className={`text-xs hidden sm:block ${
                        isActive ? 'text-stone-900 font-medium' : 'text-stone-400'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-px mx-2 sm:mx-3 mb-5 ${
                        i < step ? 'bg-emerald-600' : 'bg-stone-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              {step === 0 && (
                <StepCompany input={input} update={update} />
              )}
              {step === 1 && (
                <StepProcess input={input} update={update} />
              )}
              {step === 2 && (
                <StepCosts input={input} update={update} />
              )}
              {step === 3 && (
                <StepApproach input={input} update={update} />
              )}
              {step === 4 && (
                <StepRisk input={input} update={update} />
              )}
            </motion.div>
          </AnimatePresence>

          {currentStepInvalid && (
            <div className="mt-6 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
              Please complete the required fields before continuing.
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/60 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handleBack}
            className="text-stone-600 hover:text-stone-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {step === 0 ? 'Home' : 'Back'}
          </Button>
          <div className="text-sm text-stone-500">
            Step {step + 1} of {STEPS.length}
          </div>
          <Button
            onClick={handleNext}
            className="bg-emerald-700 hover:bg-emerald-800 text-white"
          >
            {step === STEPS.length - 1 ? 'Generate report' : 'Continue'}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </footer>
    </div>
  );
}

// ============== STEP COMPONENTS ==============

type StepProps = {
  input: AssessmentInput;
  update: <K extends keyof AssessmentInput>(key: K, value: AssessmentInput[K]) => void;
};

function StepHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mb-8">
      <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-stone-900 mb-2">
        {title}
      </h1>
      <p className="text-stone-600">{description}</p>
    </div>
  );
}

function StepCompany({ input, update }: StepProps) {
  return (
    <div>
      <StepHeader
        title="Tell us about your company"
        description="Used to tailor the report's framing and benchmarks. None of this data leaves your browser."
      />
      <div className="space-y-6">
        <Field label="Industry" required>
          <Select
            value={input.industry}
            onValueChange={(v) => update('industry', v as Industry)}
          >
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
          <RadioGroup
            value={input.companySize}
            onValueChange={(v) => update('companySize', v as CompanySize)}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
          >
            {COMPANY_SIZES.map((s) => (
              <RadioCard
                key={s.value}
                value={s.value}
                label={s.label}
                sub={s.sub}
                selected={input.companySize === s.value}
              />
            ))}
          </RadioGroup>
        </Field>

        <Field label="Your role" hint="Helps us pitch the report at the right altitude.">
          <Select
            value={input.roleLevel}
            onValueChange={(v) => update('roleLevel', v as RoleLevel)}
          >
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
    </div>
  );
}

function StepProcess({ input, update }: StepProps) {
  return (
    <div>
      <StepHeader
        title="Describe the process"
        description="Plain-English description. No process map required — just enough to characterize the workflow."
      />
      <div className="space-y-6">
        <Field label="Process name" required>
          <Input
            value={input.processName}
            onChange={(e) => update('processName', e.target.value)}
            placeholder="e.g. Monthly vendor invoice reconciliation"
            className="bg-white"
          />
        </Field>

        <Field
          label="Brief description"
          hint="Optional but improves report quality. What does the process do?"
        >
          <Textarea
            value={input.processDescription}
            onChange={(e) => update('processDescription', e.target.value)}
            placeholder="e.g. Each month, the AP team pulls invoices from 3 systems, matches them to POs in NetSuite, codes exceptions, and routes approvals..."
            className="bg-white min-h-[90px]"
          />
        </Field>

        <Field label="Who primarily performs this?">
          <RadioGroup
            value={input.performer}
            onValueChange={(v) => update('performer', v as Performer)}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {PERFORMERS.map((p) => (
              <RadioCard
                key={p.value}
                value={p.value}
                label={p.label}
                sub={p.sub}
                selected={input.performer === p.value}
              />
            ))}
          </RadioGroup>
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="How often?" hint="Frequency of the workflow.">
            <Select
              value={input.frequency}
              onValueChange={(v) => update('frequency', v as Frequency)}
            >
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

          <Field
            label="Occurrences per cycle"
            hint="e.g. 50 invoices per day, 4 reports per week."
            required
          >
            <Input
              type="number"
              min={1}
              value={input.occurrencesPerCycle}
              onChange={(e) => update('occurrencesPerCycle', Number(e.target.value))}
              className="bg-white"
            />
          </Field>
        </div>

        <Field
          label="Minutes per occurrence"
          hint="Average time one instance takes. Include handoffs and review time."
          required
        >
          <Input
            type="number"
            min={1}
            value={input.minutesPerOccurrence}
            onChange={(e) => update('minutesPerOccurrence', Number(e.target.value))}
            className="bg-white"
          />
        </Field>
      </div>
    </div>
  );
}

function StepCosts({ input, update }: StepProps) {
  return (
    <div>
      <StepHeader
        title="What does this process cost today?"
        description="Loaded cost = salary + benefits + overhead. Use ballpark numbers — the goal is order of magnitude."
      />
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Loaded cost per hour (USD)"
            hint="Specialist ~$75–150. Manager ~$100–200. Vendor ~$80–250."
            required
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">$</span>
              <Input
                type="number"
                min={1}
                value={input.hourlyCost}
                onChange={(e) => update('hourlyCost', Number(e.target.value))}
                className="bg-white pl-7"
              />
            </div>
          </Field>

          <Field
            label="Number of people who do this"
            hint="Across the team, not just one person."
            required
          >
            <Input
              type="number"
              min={1}
              value={input.numberOfPeople}
              onChange={(e) => update('numberOfPeople', Number(e.target.value))}
              className="bg-white"
            />
          </Field>
        </div>

        <Field
          label="Implementation cost (USD)"
          hint="Leave at 0 to use the approach default. Update on the next step if needed."
        >
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">$</span>
            <Input
              type="number"
              min={0}
              value={input.implementationCost}
              onChange={(e) => update('implementationCost', Number(e.target.value))}
              className="bg-white pl-7"
            />
          </div>
        </Field>

        {/* Live preview */}
        <Card className="bg-emerald-50/50 border-emerald-100">
          <CardContent className="p-5">
            <div className="text-xs font-medium text-emerald-800 uppercase tracking-wider mb-3">
              Live estimate
            </div>
            <div className="grid grid-cols-3 gap-4">
              <LiveMetric
                value={calcAnnualHours(input).toLocaleString()}
                label="Annual hours"
              />
              <LiveMetric
                value={`$${calcAnnualCost(input).toLocaleString()}`}
                label="Annual cost"
              />
              <LiveMetric
                value={`${(calcAnnualHours(input) / 2000).toFixed(1)}`}
                label="FTE equivalent"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StepApproach({ input, update }: StepProps) {
  const selected = APPROACHES.find((a) => a.value === input.approach)!;
  return (
    <div>
      <StepHeader
        title="How would you automate this?"
        description="Each approach has different cost, speed-to-value, and risk tradeoffs. Pick the one that fits the process."
      />
      <div className="space-y-6">
        <RadioGroup
          value={input.approach}
          onValueChange={(v) => update('approach', v as AutomationApproach)}
          className="grid grid-cols-1 gap-3"
        >
          {APPROACHES.map((a) => (
            <ApproachCard
              key={a.value}
              value={a.value}
              approach={a}
              selected={input.approach === a.value}
            />
          ))}
        </RadioGroup>

        <Field
          label={`What % of the process can be automated? (${input.automationPercentage}%)`}
          hint="Few processes are 100% automatable. Edge cases, exceptions, and human judgment often remain. 60–80% is typical for first pass."
        >
          <Slider
            value={[input.automationPercentage]}
            onValueChange={(v) => update('automationPercentage', v[0])}
            min={10}
            max={100}
            step={5}
            className="mt-3"
          />
          <div className="flex justify-between text-xs text-stone-400 mt-1">
            <span>10%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </Field>

        {input.implementationCost === 0 && (
          <Card className="bg-stone-50 border-stone-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <DollarSign className="w-4 h-4 text-stone-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-stone-600">
                  Defaulting implementation cost to{' '}
                  <span className="font-semibold text-stone-900">
                    {selected.typicalCost}
                  </span>{' '}
                  for {selected.label}. You can override this on the previous step.
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function StepRisk({ input, update }: StepProps) {
  return (
    <div>
      <StepHeader
        title="Risk and change context"
        description="These factors adjust the verdict. A high-criticality process with low error tolerance gets a more cautious recommendation."
      />
      <div className="space-y-8">
        <RiskSlider
          label="How critical is this process to the business?"
          value={input.criticality}
          onChange={(v) => update('criticality', v)}
          leftLabel="Operational nicety"
          rightLabel="Mission-critical"
        />
        <RiskSlider
          label="How tolerant are you of errors?"
          value={input.errorTolerance}
          onChange={(v) => update('errorTolerance', v)}
          leftLabel="Zero tolerance"
          rightLabel="Errors are fine"
        />
        <RiskSlider
          label="How much change capacity does the team have?"
          value={input.changeCapacity}
          onChange={(v) => update('changeCapacity', v)}
          leftLabel="At capacity"
          rightLabel="Bandwidth to adopt"
        />

        <Card className="bg-emerald-50/50 border-emerald-100">
          <CardContent className="p-5">
            <div className="text-xs font-medium text-emerald-800 uppercase tracking-wider mb-3">
              Ready to generate
            </div>
            <p className="text-sm text-stone-700 leading-relaxed">
              You&apos;ll get a verdict (Automate / Pilot / Not yet), annual savings,
              payback period, strategic value callouts, risks, and a phased
              rollout roadmap. Exportable to PDF.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============== HELPERS ==============

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-sm font-medium text-stone-900 mb-1.5 block">
        {label}
        {required && <span className="text-emerald-700 ml-1">*</span>}
      </Label>
      {children}
      {hint && <p className="text-xs text-stone-500 mt-1.5">{hint}</p>}
    </div>
  );
}

function RadioCard({
  value,
  label,
  sub,
  selected,
}: {
  value: string;
  label: string;
  sub: string;
  selected: boolean;
}) {
  return (
    <Label
      className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all ${
        selected
          ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
          : 'border-stone-200 bg-white hover:border-stone-300'
      }`}
    >
      <RadioGroupItem value={value} className="mt-1" />
      <div>
        <div className="font-medium text-stone-900 text-sm">{label}</div>
        <div className="text-xs text-stone-500 mt-0.5">{sub}</div>
      </div>
    </Label>
  );
}

function ApproachCard({
  value,
  approach,
  selected,
}: {
  value: string;
  approach: (typeof APPROACHES)[number];
  selected: boolean;
}) {
  return (
    <Label
      className={`flex items-start gap-4 p-5 rounded-lg border cursor-pointer transition-all ${
        selected
          ? 'border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500'
          : 'border-stone-200 bg-white hover:border-stone-300'
      }`}
    >
      <RadioGroupItem value={value} className="mt-1" />
      <div className="flex-1">
        <div className="flex items-baseline justify-between gap-3 mb-1">
          <div className="font-semibold text-stone-900">{approach.label}</div>
          <div className="text-xs text-stone-500 flex gap-3 flex-shrink-0">
            <span>{approach.typicalCost}</span>
            <span className="text-stone-300">|</span>
            <span>{approach.timeToValue}</span>
          </div>
        </div>
        <div className="text-sm text-stone-600 mb-2">{approach.description}</div>
        <div className="text-xs text-stone-500">
          <span className="text-stone-400">Best for:</span> {approach.bestFor}
        </div>
      </div>
    </Label>
  );
}

function RiskSlider({
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
      <Label className="text-sm font-medium text-stone-900 mb-3 block">{label}</Label>
      <div className="flex items-center gap-4">
        <span className="text-xs text-stone-500 w-24 text-right flex-shrink-0">{leftLabel}</span>
        <Slider
          value={[value]}
          onValueChange={(v) => onChange(v[0])}
          min={1}
          max={5}
          step={1}
          className="flex-1"
        />
        <span className="text-xs text-stone-500 w-24 flex-shrink-0">{rightLabel}</span>
        <span className="text-sm font-semibold text-stone-900 w-6 text-center">
          {value}
        </span>
      </div>
    </div>
  );
}

function LiveMetric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-lg font-semibold text-stone-900">{value}</div>
      <div className="text-xs text-stone-500 mt-0.5">{label}</div>
    </div>
  );
}

function calcAnnualHours(input: AssessmentInput): number {
  const f = FREQUENCIES.find((x) => x.value === input.frequency)!;
  return (input.occurrencesPerCycle * f.cyclesPerYear * input.minutesPerOccurrence * input.numberOfPeople) / 60;
}

function calcAnnualCost(input: AssessmentInput): number {
  return calcAnnualHours(input) * input.hourlyCost;
}
