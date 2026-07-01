'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Building2,
  Check,
  DollarSign,
  Layers,
  AlertTriangle,
  Calendar,
  ExternalLink,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DepartmentStack } from '@/app/api/analyze-stack/route';

interface StackAnalysis {
  departments: DepartmentStack[];
  totalMonthlyCost: string;
  consolidationOpportunities: string[];
  gaps: string[];
  phasedPlan: string[];
  summary: string;
  confidence: 'high' | 'medium' | 'low';
}

type Phase = 'input' | 'loading' | 'results';

interface StackAnalyzerProps {
  onBack: () => void;
}

export function StackAnalyzer({ onBack }: StackAnalyzerProps) {
  const [phase, setPhase] = useState<Phase>('input');
  const [companyDescription, setCompanyDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [currentTools, setCurrentTools] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<StackAnalysis | null>(null);

  const handleAnalyze = async () => {
    if (companyDescription.trim().length < 10) {
      setError('Please describe your company in at least one sentence.');
      return;
    }
    setError(null);
    setPhase('loading');
    try {
      const res = await fetch('/api/analyze-stack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyDescription: companyDescription.trim(),
          industry: industry || undefined,
          companySize: companySize || undefined,
          currentTools: currentTools.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Analysis failed' }));
        throw new Error(err.error || 'Analysis failed');
      }
      const data: StackAnalysis = await res.json();
      setResult(data);
      setPhase('results');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
      setPhase('input');
    }
  };

  const handleRestart = () => {
    setPhase('input');
    setResult(null);
    setError(null);
  };

  // ============ INPUT PHASE ============
  if (phase === 'input') {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50/30">
        <header className="border-b border-stone-200/60 bg-white sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={onBack}
              className="text-sm text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Building2 className="w-3.5 h-3.5 text-emerald-700" />
              AI Stack Analyzer
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-stone-900 mb-2">
              What AI tools should your whole company use?
            </h1>
            <p className="text-stone-600 mb-8">
              Describe your company. We will recommend a complete AI tool stack organized by department, with pricing, priorities, and a phased rollout plan.
            </p>

            <div className="space-y-5">
              <div>
                <Label className="text-sm font-medium text-stone-900 mb-1.5 block">
                  Describe your company <span className="text-emerald-700">*</span>
                </Label>
                <Textarea
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  placeholder="e.g., We are a 50-person B2B SaaS company building project management software. We have engineering, sales, marketing, customer support, and finance teams. Currently using Slack, Google Workspace, Salesforce, and Notion. Looking to adopt AI tools across the company."
                  className="bg-white min-h-[140px] resize-none"
                  maxLength={5000}
                />
                <p className="text-xs text-stone-400 mt-1">
                  Include: what you do, team size, departments, and current tools. The more detail, the better the recommendations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label className="text-sm font-medium text-stone-900 mb-1.5 block">
                    Industry <span className="text-stone-400 font-normal">(optional)</span>
                  </Label>
                  <Input
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g., Technology, Finance"
                    className="bg-white"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium text-stone-900 mb-1.5 block">
                    Company size <span className="text-stone-400 font-normal">(optional)</span>
                  </Label>
                  <Select value={companySize} onValueChange={setCompanySize}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Pick one" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="startup">Startup (1-10)</SelectItem>
                      <SelectItem value="small">Small (11-50)</SelectItem>
                      <SelectItem value="mid">Mid-market (51-250)</SelectItem>
                      <SelectItem value="large">Large (251-1000)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (1000+)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-stone-900 mb-1.5 block">
                  Current tools <span className="text-stone-400 font-normal">(optional)</span>
                </Label>
                <Input
                  value={currentTools}
                  onChange={(e) => setCurrentTools(e.target.value)}
                  placeholder="Slack, Notion, Salesforce, Google Workspace..."
                  className="bg-white"
                />
                <p className="text-xs text-stone-400 mt-1">
                  We will find consolidation opportunities and avoid recommending tools you already have.
                </p>
              </div>

              {error && (
                <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
                  {error}
                </div>
              )}

              <Button
                size="lg"
                onClick={handleAnalyze}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white h-12 text-base"
              >
                <Building2 className="w-4 h-4 mr-1.5" />
                Analyze my company stack
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>

              <p className="text-xs text-stone-400 text-center">
                Takes ~10 seconds. Free, no signup.
              </p>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // ============ LOADING PHASE ============
  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50/30">
        <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mb-4" />
        <div className="text-base font-medium text-stone-900 mb-1">
          Analyzing your company...
        </div>
        <div className="text-sm text-stone-500">
          AI is mapping your departments to the best tools across 256+ options.
        </div>
      </div>
    );
  }

  // ============ RESULTS PHASE ============
  if (!result) return null;

  const priorityColors: Record<string, string> = {
    high: 'bg-red-50 text-red-700 border-red-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-stone-50 text-stone-700 border-stone-200',
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/30">
      <header className="border-b border-stone-200/60 bg-white sticky top-0 z-10 print:hidden">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-emerald-700 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-stone-900 text-sm">AI Stack Analysis</span>
          </div>
          <Button variant="ghost" onClick={handleRestart} className="text-xs">
            New analysis
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Summary hero */}
          <Card className="border-emerald-200 bg-emerald-50/40 mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-emerald-700 flex items-center justify-center flex-shrink-0">
                  <Layers className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-stone-900 mb-1">Your recommended AI stack</h2>
                  <p className="text-stone-700 leading-relaxed mb-3">{result.summary}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge className="bg-emerald-700 text-white">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {result.totalMonthlyCost}/mo estimated
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {result.departments?.length || 0} departments
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Confidence: {result.confidence}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Department stacks */}
          {result.departments?.map((dept, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Card className="border-stone-200 mb-4">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-stone-900 text-lg">{dept.department}</h3>
                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        {dept.functions?.map((fn, j) => (
                          <Badge key={j} variant="outline" className="text-xs">
                            {fn}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <Badge
                        variant="outline"
                        className={`text-xs ${priorityColors[dept.priority] || priorityColors.medium}`}
                      >
                        {dept.priority} priority
                      </Badge>
                      <span className="text-xs text-stone-500">{dept.monthlyCost}</span>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    {dept.recommendedTools?.map((tool, j) => (
                      <div key={j} className="border border-stone-200 rounded-lg p-4 bg-white">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className="font-medium text-stone-900">{tool.toolName}</div>
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {tool.pricing}
                          </Badge>
                        </div>
                        <p className="text-sm text-stone-600 leading-relaxed mb-2">{tool.why}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs bg-stone-50">
                            {tool.effort}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Consolidation opportunities */}
          {result.consolidationOpportunities?.length > 0 && (
            <Card className="border-emerald-200 bg-emerald-50/30 mb-4">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-semibold text-stone-900">Consolidation opportunities</h3>
                </div>
                <div className="space-y-2">
                  {result.consolidationOpportunities.map((opp, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-stone-700">{opp}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gaps */}
          {result.gaps?.length > 0 && (
            <Card className="border-amber-200 bg-amber-50/30 mb-4">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h3 className="font-semibold text-stone-900">Gaps in your stack</h3>
                </div>
                <div className="space-y-2">
                  {result.gaps.map((gap, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-stone-700">{gap}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Phased plan */}
          {result.phasedPlan?.length > 0 && (
            <Card className="border-stone-200 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-stone-700" />
                  <h3 className="font-semibold text-stone-900">Phased rollout plan</h3>
                </div>
                <div className="space-y-3">
                  {result.phasedPlan.map((phase, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                        {i + 1}
                      </div>
                      <span className="text-sm text-stone-700 leading-relaxed pt-1">{phase}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Email capture */}
          <Card className="border-stone-200 bg-stone-50/50 mb-6 print:hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-stone-400" />
                <span className="text-sm font-medium text-stone-700">
                  Want updates when I ship new tools?
                </span>
              </div>
              <p className="text-xs text-stone-400">
                I ship free AI tools regularly. Follow <a href="https://x.com/sodbotter" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">@sodbotter</a> or subscribe via any tool.
              </p>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center pt-4">
            <Button variant="outline" onClick={handleRestart} className="text-sm">
              Analyze another company
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
