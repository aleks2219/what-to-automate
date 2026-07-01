'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Search,
  AlertTriangle,
  Check,
  DollarSign,
  Shield,
  Lightbulb,
  Zap,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

type Phase = 'input' | 'loading' | 'results';

interface SpyResult {
  signals: Array<{ signal: string; indicates: string; aiTool?: string; category: string; confidence: string }>;
  inferredStack: Array<{ category: string; likelyTool: string; confidence: string; reasoning: string; estimatedCost: string }>;
  estimatedMonthlyCost: string;
  costBreakdown: string;
  vulnerabilities: Array<{ pattern: string; description: string; severity: string; howToExploit: string; estimatedCost: string }>;
  yourAdvantages: string[];
  summary: string;
  confidence: string;
}

interface SpyStackProps {
  onBack: () => void;
}

export function SpyStack({ onBack }: SpyStackProps) {
  const [phase, setPhase] = useState<Phase>('input');
  const [competitorUrl, setCompetitorUrl] = useState('');
  const [yourDescription, setYourDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SpyResult | null>(null);

  const handleAnalyze = async () => {
    if (!competitorUrl.trim()) {
      setError('Please enter a competitor URL.');
      return;
    }
    setError(null);
    setPhase('loading');
    try {
      const res = await fetch('/api/spy-stack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          competitorUrl: competitorUrl.trim(),
          yourDescription: yourDescription.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Analysis failed' }));
        throw new Error(err.error || 'Analysis failed');
      }
      const data: SpyResult = await res.json();
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

  const severityColors: Record<string, string> = {
    critical: 'bg-red-50 text-red-700 border-red-200',
    high: 'bg-orange-50 text-orange-700 border-orange-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-stone-50 text-stone-700 border-stone-200',
  };

  const confidenceColors: Record<string, string> = {
    high: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-stone-50 text-stone-700 border-stone-200',
  };

  // ============ INPUT ============
  if (phase === 'input') {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50/30">
        <header className="border-b border-stone-200/60 bg-white sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
            <button onClick={onBack} className="text-sm text-stone-500 hover:text-stone-900 flex items-center gap-1.5">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Eye className="w-3.5 h-3.5 text-red-600" />
              AI Stack Guesser
            </div>
          </div>
        </header>

        <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-medium mb-4 border border-red-200">
              <Eye className="w-3 h-3" />
              Competitive Intelligence
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-stone-900 mb-2">
              What AI tools is your competitor using?
            </h1>
            <p className="text-stone-600 mb-8">
              Enter a competitor URL. We fetch their site, scan for tech signals (scripts, APIs, frameworks), and infer their likely AI stack, costs, and vulnerabilities.
            </p>

            <div className="space-y-5">
              <div>
                <Label className="text-sm font-medium text-stone-900 mb-1.5 block">
                  Competitor URL <span className="text-red-600">*</span>
                </Label>
                <Input
                  type="url"
                  value={competitorUrl}
                  onChange={(e) => setCompetitorUrl(e.target.value)}
                  placeholder="competitor.com"
                  className="bg-white"
                />
                <p className="text-xs text-stone-400 mt-1">
                  We scan their page source for AI-related scripts, APIs, and frameworks.
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-stone-900 mb-1.5 block">
                  What do you do? <span className="text-stone-400 font-normal">(optional)</span>
                </Label>
                <Textarea
                  value={yourDescription}
                  onChange={(e) => setYourDescription(e.target.value)}
                  placeholder="e.g., We are building an AI chatbot for e-commerce using GPT-4.1 mini with prompt caching. Our costs are about $2K/mo for 5K users."
                  className="bg-white min-h-[80px] resize-none"
                />
                <p className="text-xs text-stone-400 mt-1">
                  We will compare your approach to theirs and find specific advantages you could have.
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
                className="w-full bg-red-600 hover:bg-red-700 text-white h-12 text-base"
              >
                <Search className="w-4 h-4 mr-1.5" />
                Analyze competitor
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>

              <p className="text-xs text-stone-400 text-center">
                Takes ~10 seconds. Uses public signals only. Free, no login.
              </p>

              <div className="bg-stone-100 rounded-md p-3 text-xs text-stone-500 leading-relaxed">
                <strong className="text-stone-700">How it works:</strong> We fetch the competitor website and scan the HTML for tech signals (Intercom, OpenAI, Stripe, etc.). Then AI analyzes the detected signals + their product features to infer their AI stack, estimate costs, and find vulnerabilities. This is competitive intelligence from public data, not hacking.
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // ============ LOADING ============
  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50/30">
        <Loader2 className="w-10 h-10 text-red-600 animate-spin mb-4" />
        <div className="text-base font-medium text-stone-900 mb-1">Scanning competitor...</div>
        <div className="text-sm text-stone-500">Fetching their site + detecting tech signals + inferring AI stack.</div>
      </div>
    );
  }

  // ============ RESULTS ============
  if (!result) return null;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/30">
      <header className="border-b border-stone-200/60 bg-white sticky top-0 z-10 print:hidden">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-red-600 flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-stone-900 text-sm">AI Stack Analysis</span>
          </div>
          <Button variant="ghost" onClick={handleRestart} className="text-xs">New analysis</Button>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-8">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          {/* Summary hero */}
          <Card className="border-red-200 bg-red-50/30 mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-600 flex items-center justify-center flex-shrink-0">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-semibold text-stone-900 mb-1">Competitor Analysis</h2>
                  <p className="text-stone-700 leading-relaxed mb-3">{result.summary}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className="bg-red-600 text-white">
                      <DollarSign className="w-3 h-3 mr-1" />
                      Est. {result.estimatedMonthlyCost}/mo
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${confidenceColors[result.confidence] || confidenceColors.medium}`}>
                      Confidence: {result.confidence}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {result.signals?.length || 0} signals detected
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Detected signals */}
          {result.signals && result.signals.length > 0 && (
            <Card className="border-stone-200 mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
                  <Search className="w-4 h-4 text-stone-500" />
                  Detected tech signals
                </h3>
                <div className="grid sm:grid-cols-2 gap-2">
                  {result.signals.map((sig, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-stone-50 rounded-md">
                      <Badge variant="outline" className={`text-xs flex-shrink-0 ${confidenceColors[sig.confidence] || confidenceColors.medium}`}>
                        {sig.confidence}
                      </Badge>
                      <div>
                        <div className="text-sm text-stone-800">{sig.indicates}</div>
                        {sig.aiTool && <div className="text-xs text-stone-500">{sig.aiTool}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Inferred stack */}
          {result.inferredStack && result.inferredStack.length > 0 && (
            <Card className="border-stone-200 mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-700" />
                  Inferred AI stack
                </h3>
                <div className="space-y-3">
                  {result.inferredStack.map((item, i) => (
                    <div key={i} className="border border-stone-200 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <div className="font-medium text-stone-900">{item.likelyTool}</div>
                          <div className="text-xs text-stone-500 capitalize">{item.category}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <Badge variant="outline" className={`text-xs ${confidenceColors[item.confidence] || confidenceColors.medium}`}>
                            {item.confidence}
                          </Badge>
                          <span className="text-xs text-stone-500">{item.estimatedCost}</span>
                        </div>
                      </div>
                      <p className="text-sm text-stone-600">{item.reasoning}</p>
                    </div>
                  ))}
                </div>
                {result.costBreakdown && (
                  <div className="mt-4 p-3 bg-emerald-50/50 rounded-md border border-emerald-100">
                    <div className="text-xs font-medium text-emerald-800 uppercase tracking-wider mb-1">Cost breakdown</div>
                    <p className="text-sm text-stone-700">{result.costBreakdown}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Vulnerabilities */}
          {result.vulnerabilities && result.vulnerabilities.length > 0 && (
            <Card className="border-stone-200 mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-amber-600" />
                  Vulnerabilities
                </h3>
                <div className="space-y-3">
                  {result.vulnerabilities.map((vuln, i) => (
                    <div key={i} className="border border-stone-200 rounded-lg p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="font-medium text-stone-900">{vuln.pattern}</div>
                        <Badge variant="outline" className={`text-xs flex-shrink-0 ${severityColors[vuln.severity] || severityColors.medium}`}>
                          {vuln.severity}
                        </Badge>
                      </div>
                      <p className="text-sm text-stone-600 mb-2">{vuln.description}</p>
                      <div className="p-2 bg-amber-50/50 rounded border border-amber-100">
                        <div className="text-xs font-medium text-amber-800 uppercase tracking-wider mb-0.5">How to exploit</div>
                        <p className="text-sm text-stone-700">{vuln.howToExploit}</p>
                      </div>
                      <div className="text-xs text-stone-400 mt-1">Estimated cost: {vuln.estimatedCost}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Your advantages */}
          {result.yourAdvantages && result.yourAdvantages.length > 0 && (
            <Card className="border-emerald-200 bg-emerald-50/30 mb-6">
              <CardContent className="p-6">
                <h3 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-emerald-700" />
                  Your advantages
                </h3>
                <div className="space-y-2">
                  {result.yourAdvantages.map((adv, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-stone-700">{adv}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Email capture */}
          <Card className="border-stone-200 bg-stone-50/50 mb-6 print:hidden">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-1">
                <Lightbulb className="w-4 h-4 text-stone-400" />
                <span className="text-sm font-medium text-stone-700">Want updates when I ship new tools?</span>
              </div>
              <p className="text-xs text-stone-400">Follow <a href="https://x.com/sodbotter" target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">@sodbotter</a> or subscribe via any tool.</p>
            </CardContent>
          </Card>

          <div className="text-center pt-4">
            <Button variant="outline" onClick={handleRestart} className="text-sm">Analyze another competitor</Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
