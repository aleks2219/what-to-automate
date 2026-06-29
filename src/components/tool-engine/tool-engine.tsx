'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  AlertTriangle,
  Lightbulb,
  Target,
  Download,
  Mail,
  Sparkles,
  Zap,
  Scale,
  Calculator,
  FileText,
  ExternalLink,
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
import { ToolConfig, ToolAnalysisResult } from '@/lib/tool-config';

// Icon mapping — add new icons here as needed
const ICONS: Record<string, typeof Zap> = {
  Zap,
  Scale,
  Calculator,
  Lightbulb,
  Target,
  FileText,
  Sparkles,
};

type Phase = 'landing' | 'input' | 'loading' | 'results';

interface ToolEngineProps {
  config: ToolConfig;
  onBack: () => void;
}

export function ToolEngine({ config, onBack }: ToolEngineProps) {
  const [phase, setPhase] = useState<Phase>('landing');
  const [input, setInput] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ToolAnalysisResult | null>(null);

  const Icon = ICONS[config.icon] || Sparkles;

  const handleStart = () => {
    setPhase('input');
  };

  const handleAnalyze = async () => {
    if (input.trim().length < 5) {
      setError('Please provide at least one sentence of detail.');
      return;
    }
    setError(null);
    setPhase('loading');
    try {
      const res = await fetch('/api/analyze-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: config.slug,
          input: input.trim(),
          fields,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Analysis failed' }));
        throw new Error(err.error || 'Analysis failed');
      }
      const data: ToolAnalysisResult = await res.json();
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
    setPhase('landing');
    setInput('');
    setFields({});
    setResult(null);
    setError(null);
  };

  // ============ LANDING PHASE ============
  if (phase === 'landing') {
    return (
      <div className="min-h-screen flex flex-col">
        <header className="border-b border-stone-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={onBack}
              className="text-sm text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              All tools
            </button>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Sparkles className="w-3.5 h-3.5" />
              Free · No login
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl w-full py-16"
          >
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
              style={{ backgroundColor: `${config.iconColor}15` }}
            >
              <Icon className="w-8 h-8" style={{ color: config.iconColor }} />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 text-stone-600 text-xs font-medium mb-4">
              {config.category}
            </div>

            <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-stone-900 mb-4 leading-tight">
              {config.tagline}
            </h1>

            <p className="text-lg text-stone-600 leading-relaxed mb-8 max-w-xl">
              {config.description}
            </p>

            <Button
              size="lg"
              onClick={handleStart}
              className="text-base h-12 px-7"
              style={{ backgroundColor: config.iconColor, borderColor: config.iconColor }}
            >
              <Icon className="w-4 h-4 mr-1.5" />
              Try {config.name}
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>

            <div className="mt-8 flex items-center gap-6 text-sm text-stone-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Free
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                No login
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                AI-powered
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                PDF export
              </span>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  // ============ INPUT PHASE ============
  if (phase === 'input') {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50/30">
        <header className="border-b border-stone-200/60 bg-white sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center"
                style={{ backgroundColor: config.iconColor }}
              >
                <Icon className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold text-stone-900">{config.name}</span>
            </div>
            <button
              onClick={handleRestart}
              className="text-sm text-stone-500 hover:text-stone-900"
            >
              Cancel
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-stone-900 mb-2">
              {config.tagline}
            </h1>
            <p className="text-stone-600 mb-8">Tell us about your situation. Our AI analyzes it instantly.</p>

            <div className="space-y-5">
              <div>
                <Label className="text-sm font-medium text-stone-900 mb-1.5 block">
                  {config.inputLabel} <span style={{ color: config.iconColor }}>*</span>
                </Label>
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={config.inputPlaceholder}
                  className="bg-white min-h-[120px] resize-none"
                  maxLength={5000}
                />
                {config.inputHint && (
                  <p className="text-xs text-stone-400 mt-1">{config.inputHint}</p>
                )}
              </div>

              {config.additionalFields?.map((field) => (
                <div key={field.id}>
                  <Label className="text-sm font-medium text-stone-900 mb-1.5 block">
                    {field.label}
                    {field.required && <span style={{ color: config.iconColor }}> *</span>}
                  </Label>
                  {field.type === 'select' ? (
                    <Select
                      value={fields[field.id] || ''}
                      onValueChange={(v) => setFields((prev) => ({ ...prev, [field.id]: v }))}
                    >
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder={field.placeholder || 'Pick one'} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      type={field.type}
                      value={fields[field.id] || ''}
                      onChange={(e) => setFields((prev) => ({ ...prev, [field.id]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="bg-white"
                    />
                  )}
                  {field.helpText && (
                    <p className="text-xs text-stone-400 mt-1">{field.helpText}</p>
                  )}
                </div>
              ))}

              {error && (
                <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
                  {error}
                </div>
              )}

              <Button
                size="lg"
                onClick={handleAnalyze}
                className="w-full text-base h-12"
                style={{ backgroundColor: config.iconColor, borderColor: config.iconColor }}
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                Analyze
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>

              <p className="text-xs text-stone-400 text-center">
                Takes ~5 seconds. Free, no signup.
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
        <Loader2
          className="w-10 h-10 animate-spin mb-4"
          style={{ color: config.iconColor }}
        />
        <div className="text-base font-medium text-stone-900 mb-1">
          Analyzing...
        </div>
        <div className="text-sm text-stone-500">
          {config.name} is processing your input with AI.
        </div>
      </div>
    );
  }

  // ============ RESULTS PHASE ============
  if (!result) return null;

  const verdictColors: Record<string, { bg: string; text: string; accent: string }> = {
    high: { bg: '#047857', text: 'text-white', accent: 'text-emerald-700', section: 'border-emerald-200 bg-emerald-50/40' },
    medium: { bg: '#d97706', text: 'text-white', accent: 'text-amber-700', section: 'border-amber-200 bg-amber-50/40' },
    low: { bg: '#57534e', text: 'text-white', accent: 'text-stone-700', section: 'border-stone-200 bg-stone-50/60' },
  };
  const colors = verdictColors[result.verdict] || verdictColors.medium;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/30">
      <header className="border-b border-stone-200/60 bg-white sticky top-0 z-10 print:hidden">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ backgroundColor: config.iconColor }}
            >
              <Icon className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-stone-900 text-sm">{config.name}</span>
          </div>
          <Button variant="ghost" onClick={handleRestart} className="text-xs">
            New analysis
          </Button>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Verdict hero */}
          <Card className={`border-2 ${colors.section} mb-6`}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold tracking-wide flex-shrink-0"
                  style={{ backgroundColor: colors.bg }}
                >
                  <Check className="w-4 h-4 text-white" />
                  <span className="text-white">{result.verdictLabel}</span>
                </div>
                <div className="flex-1">
                  <div className="text-3xl font-bold text-stone-900 mb-1">
                    {result.score}/100
                  </div>
                  <div className="text-xs text-stone-500 uppercase tracking-wider">
                    Recommendation strength · Confidence: {result.confidence}
                  </div>
                </div>
              </div>
              <p className="text-stone-700 leading-relaxed mt-4">{result.summary}</p>
            </CardContent>
          </Card>

          {/* Key insights */}
          {result.keyInsights.length > 0 && (
            <Card className="border-stone-200 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="w-4 h-4 text-stone-700" />
                  <h2 className="text-lg font-semibold text-stone-900">Key insights</h2>
                </div>
                <div className="space-y-3">
                  {result.keyInsights.map((insight, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span
                        className="text-sm font-bold mt-0.5 flex-shrink-0"
                        style={{ color: config.iconColor }}
                      >
                        {i + 1}.
                      </span>
                      <span className="text-sm text-stone-700 leading-relaxed">{insight}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <Card className="border-stone-200 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-4 h-4 text-stone-700" />
                  <h2 className="text-lg font-semibold text-stone-900">Recommendations</h2>
                </div>
                <div className="space-y-3">
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check
                        className="w-4 h-4 mt-0.5 flex-shrink-0"
                        style={{ color: config.iconColor }}
                      />
                      <span className="text-sm text-stone-700 leading-relaxed">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action items */}
          {result.actionItems.length > 0 && (
            <Card
              className="border-2 mb-6"
              style={{ borderColor: `${config.iconColor}40`, backgroundColor: `${config.iconColor}08` }}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-4 h-4" style={{ color: config.iconColor }} />
                  <h2 className="text-lg font-semibold text-stone-900">Do this today</h2>
                </div>
                <div className="space-y-3">
                  {result.actionItems.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span
                        className="w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: config.iconColor }}
                      >
                        {i + 1}
                      </span>
                      <span className="text-sm text-stone-800 leading-relaxed pt-0.5">{item}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risks */}
          {result.risks.length > 0 && (
            <Card className="border-stone-200 mb-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <h2 className="text-lg font-semibold text-stone-900">Risks & caveats</h2>
                </div>
                <div className="space-y-2">
                  {result.risks.map((risk, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-stone-600 leading-relaxed">{risk}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Email capture */}
          <ToolEmailCapture config={config} result={result} input={input} />

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-stone-200 text-center">
            <p className="text-xs text-stone-400 mb-3">
              Generated by {config.name} — {new Date().toLocaleDateString()}
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="outline" size="sm" onClick={handleRestart} className="text-xs">
                New analysis
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.print()} className="text-xs">
                <FileText className="w-3 h-3 mr-1" />
                Print
              </Button>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

// ============ EMAIL CAPTURE (inline for tool engine) ============
function ToolEmailCapture({
  config,
  result,
  input,
}: {
  config: ToolConfig;
  result: ToolAnalysisResult;
  input: string;
}) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setErrorMessage('');
    try {
      const res = await fetch('/api/email-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          source: config.slug,
        }),
      });
      if (!res.ok) throw new Error('Failed to subscribe');
      setStatus('success');
    } catch {
      setErrorMessage('Failed to subscribe. Please try again.');
      setStatus('error');
    }
  };

  return (
    <Card
      className="border-2 mb-6 print:hidden"
      style={{ borderColor: `${config.iconColor}40`, backgroundColor: `${config.iconColor}05` }}
    >
      <CardContent className="p-6">
        {status === 'success' ? (
          <div className="text-center py-2">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: `${config.iconColor}15` }}
            >
              <Check className="w-6 h-6" style={{ color: config.iconColor }} />
            </div>
            <h3 className="text-base font-semibold text-stone-900 mb-1">You&apos;re in!</h3>
            <p className="text-sm text-stone-600">
              We&apos;ll notify you when we ship new tools. Check your inbox.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-md flex items-center justify-center"
                style={{ backgroundColor: config.iconColor }}
              >
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-stone-900">
                  Get notified about new tools
                </h3>
                <p className="text-xs text-stone-500">
                  I ship free tools regularly. No spam, unsubscribe anytime.
                </p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 mt-3">
              <Input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                placeholder="you@company.com"
                className="bg-white flex-1"
                disabled={status === 'loading'}
              />
              <Button
                type="submit"
                disabled={status === 'loading'}
                style={{ backgroundColor: config.iconColor, borderColor: config.iconColor }}
              >
                {status === 'loading' ? (
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                ) : (
                  <>
                    Subscribe
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </Button>
            </form>
            {status === 'error' && (
              <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
