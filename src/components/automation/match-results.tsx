'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  Mail,
  Loader2,
  Check,
  ArrowRight,
  RotateCcw,
  FileText,
  Sparkles,
  ExternalLink,
  Target,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tool } from '@/lib/tools-db';
import { ToolMatch } from '@/app/api/match-deck/route';

interface MatchResultsProps {
  matched: Array<{ match: ToolMatch; tool: Tool }>;
  passed: Array<{ match: ToolMatch; tool: Tool }>;
  onRestart: () => void;
  onTryAssessment: () => void;
  onBack: () => void;
}

export function MatchResults({
  matched,
  passed,
  onRestart,
  onTryAssessment,
  onBack,
}: MatchResultsProps) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
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
          source: 'matcher',
          matchedToolIds: matched.map((m) => m.tool.id).join(','),
          matchedToolNames: matched.map((m) => m.tool.name).join(', '),
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to subscribe' }));
        throw new Error(err.error || 'Failed to subscribe');
      }

      setStatus('success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setErrorMessage(msg);
      setStatus('error');
    }
  };

  const sortedMatches = [...matched].sort((a, b) => b.match.matchScore - a.match.matchScore);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-emerald-50/40 to-stone-50/30">
      <header className="px-6 py-4 flex items-center justify-between max-w-2xl mx-auto w-full">
        <button
          onClick={onBack}
          className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
        >
          ← Home
        </button>
        <div className="text-xs text-stone-500">Tool Matcher</div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Hero */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-emerald-700 fill-emerald-700" />
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-stone-900 mb-2">
              You matched with {matched.length} {matched.length === 1 ? 'tool' : 'tools'}
            </h1>
            <p className="text-stone-600">
              {matched.length === 0
                ? "No matches this time — try a different process or check the tools you passed on."
                : "Sorted by match score. Email them to yourself so you don't lose them."}
            </p>
          </div>

          {/* Matched tools list */}
          {sortedMatches.length > 0 && (
            <div className="space-y-4 mb-8">
              {sortedMatches.map((item, i) => (
                <MatchedToolCard key={item.tool.id} item={item} delay={i * 0.05} />
              ))}
            </div>
          )}

          {/* Empty state */}
          {matched.length === 0 && passed.length > 0 && (
            <Card className="border-stone-200 mb-8">
              <CardContent className="p-6 text-center">
                <div className="text-base font-medium text-stone-900 mb-2">
                  No matches — but you passed on {passed.length} {passed.length === 1 ? 'tool' : 'tools'}
                </div>
                <p className="text-sm text-stone-600 mb-4">
                  Want to revisit any of them? Or try again with a different process?
                </p>
                <Button onClick={onRestart} variant="outline" className="border-stone-300">
                  <RotateCcw className="w-4 h-4 mr-1.5" />
                  Try again
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Email capture — only if matched > 0 and not yet submitted */}
          {matched.length > 0 && status !== 'success' && (
            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-stone-50/40 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-md bg-emerald-700 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-stone-900">
                      Email me my matches
                    </h3>
                    <p className="text-xs text-stone-500">
                      Get a list of your matched tools + links to try them.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-2 mt-4">
                  <div className="flex flex-col sm:flex-row gap-2">
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
                      className="bg-emerald-700 hover:bg-emerald-800 text-white"
                    >
                      {status === 'loading' ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          Email my matches
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </>
                      )}
                    </Button>
                  </div>
                  {status === 'error' && (
                    <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
                  )}
                </form>

                <p className="text-xs text-stone-500 mt-3 leading-relaxed">
                  You&apos;ll also get notified when I ship new free tools. No spam, unsubscribe anytime.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Success state for email */}
          {status === 'success' && (
            <Card className="border-emerald-200 bg-emerald-50/60 mb-8">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-emerald-700" />
                </div>
                <h3 className="text-base font-semibold text-stone-900 mb-1">
                  Check your inbox!
                </h3>
                <p className="text-sm text-stone-600">
                  We sent your matched tools list to <span className="font-medium text-stone-900">{email}</span>.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Next steps */}
          <div className="grid sm:grid-cols-2 gap-4">
            <Card className="border-stone-200 hover:border-stone-300 transition-colors cursor-pointer" onClick={onTryAssessment}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-md bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <div className="font-semibold text-stone-900 text-sm mb-1">
                      Get a full assessment
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed mb-2">
                      Run a specific process through AutoScore to get ROI, payback, and a phased roadmap.
                    </p>
                    <div className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                      Try it <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-stone-200 hover:border-stone-300 transition-colors cursor-pointer" onClick={onRestart}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-md bg-stone-100 flex items-center justify-center flex-shrink-0">
                    <RotateCcw className="w-4 h-4 text-stone-700" />
                  </div>
                  <div>
                    <div className="font-semibold text-stone-900 text-sm mb-1">
                      Swipe again
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed mb-2">
                      Try matching with a different process or industry.
                    </p>
                    <div className="text-xs text-stone-700 font-medium flex items-center gap-1">
                      New deck <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

function MatchedToolCard({
  item,
  delay = 0,
}: {
  item: { match: ToolMatch; tool: Tool };
  delay?: number;
}) {
  const matchScore = item.match.matchScore;
  const matchColor =
    matchScore >= 85 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
    matchScore >= 70 ? 'bg-blue-50 text-blue-700 border-blue-200' :
    'bg-stone-50 text-stone-700 border-stone-200';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
    >
      <Card className="border-stone-200">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: item.tool.logoColor }}
            >
              {item.tool.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <div className="font-semibold text-stone-900">{item.tool.name}</div>
                <Badge variant="outline" className={`text-xs ${matchColor}`}>
                  <Target className="w-3 h-3 mr-1" />
                  {matchScore}% match
                </Badge>
              </div>
              <div className="text-xs text-stone-500 mb-2">{item.tool.tagline}</div>
              <p className="text-sm text-stone-700 leading-relaxed mb-3">
                {item.match.whyItMatches}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  {item.tool.startingPrice}
                </Badge>
                {item.tool.freeTier && (
                  <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                    Free tier
                  </Badge>
                )}
                <a
                  href={item.tool.getStartedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button size="sm" variant="outline" className="text-xs h-7 border-stone-300">
                    Try it
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
