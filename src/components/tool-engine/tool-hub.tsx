'use client';

import { motion } from 'framer-motion';
import {
  Zap,
  Scale,
  Lightbulb,
  ArrowRight,
  Sparkles,
  Heart,
  Wrench,
  Clock,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TOOL_REGISTRY, getLiveTools } from '@/lib/tools-registry';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getHistory, clearHistory, HistoryItem, decodeResult } from '@/lib/shareable-results';

const ICONS: Record<string, typeof Zap> = {
  Zap,
  Scale,
  Lightbulb,
  Sparkles,
};

interface ToolHubProps {
  onAutoScore: () => void;
}

export function ToolHub({ onAutoScore }: ToolHubProps) {
  const router = useRouter();
  const liveTools = getLiveTools();
  const comingSoon = TOOL_REGISTRY.filter((t) => t.status === 'coming-soon');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const timer = setTimeout(() => setHistory(getHistory()), 0);
    return () => clearTimeout(timer);
  }, []);

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const handleOpenHistoryItem = (item: HistoryItem) => {
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(item.data))))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    router.push(`/r/${encoded}`);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-stone-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-700 flex items-center justify-center">
              <Wrench className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-stone-900 tracking-tight">Tool Hub</span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm text-stone-500">
            <span>Free · No login</span>
            <Badge variant="outline" className="text-xs">
              {liveTools.length} tools live
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-20 w-full">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium mb-6 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
              250+ AI tools · Free · No login
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-stone-900 leading-[1.05] mb-6 max-w-3xl mx-auto">
              Free tools for{' '}
              <span className="text-emerald-700">operators & leaders</span>
            </h1>
            <p className="text-lg text-stone-600 leading-relaxed mb-8 max-w-2xl mx-auto">
              AI-powered decision tools that take 60 seconds and give you
              actionable insights. No signup. New tools added regularly.
            </p>
          </motion.div>

          {/* Tool cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {/* AutoScore — links to existing full app */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <Card
                className="border-2 border-emerald-200 hover:border-emerald-300 transition-all cursor-pointer h-full group"
                onClick={onAutoScore}
              >
                <CardContent className="p-6 h-full flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-700 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
                    </div>
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      Featured
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-stone-900 text-lg mb-1">AutoScore</h3>
                  <p className="text-sm text-stone-500 mb-2">Should you automate that process?</p>
                  <p className="text-sm text-stone-600 leading-relaxed mb-4 flex-1">
                    Describe a process → get verdict, ROI, payback, risks, roadmap, and tool recommendations.
                    Includes AI tool matcher with 250+ tools.
                  </p>
                  <div className="flex items-center gap-2 flex-wrap mb-3">
                    <Badge variant="outline" className="text-xs">Assessment</Badge>
                    <Badge variant="outline" className="text-xs">Tool Matcher</Badge>
                    <Badge variant="outline" className="text-xs">PDF Export</Badge>
                  </div>
                  <div className="text-sm text-emerald-700 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Try AutoScore
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Other live tools — navigate to /tools/[slug] */}
            {liveTools
              .filter((t) => t.slug !== 'automation-evaluator')
              .map((tool, i) => {
                const Icon = ICONS[tool.icon] || Sparkles;
                return (
                  <motion.div
                    key={tool.slug}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.15 + i * 0.05 }}
                  >
                    <Card
                      className="border-stone-200 hover:border-stone-300 transition-all cursor-pointer h-full group"
                      onClick={() => router.push(`/tools/${tool.slug}`)}
                    >
                      <CardContent className="p-6 h-full flex flex-col">
                        <div className="flex items-start justify-between mb-3">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center"
                            style={{ backgroundColor: `${tool.iconColor}15` }}
                          >
                            <Icon className="w-5 h-5" style={{ color: tool.iconColor }} />
                          </div>
                          <Badge variant="outline" className="text-xs capitalize">
                            {tool.category}
                          </Badge>
                        </div>
                        <h3 className="font-semibold text-stone-900 text-lg mb-1">{tool.name}</h3>
                        <p className="text-sm text-stone-500 mb-2">{tool.tagline}</p>
                        <p className="text-sm text-stone-600 leading-relaxed mb-4 flex-1">
                          {tool.description}
                        </p>
                        <div
                          className="text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
                          style={{ color: tool.iconColor }}
                        >
                          Try {tool.name}
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}

            {/* Coming soon tools */}
            {comingSoon.map((tool, i) => {
              const Icon = ICONS[tool.icon] || Sparkles;
              return (
                <motion.div
                  key={tool.slug}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.05 }}
                >
                  <Card className="border-dashed border-stone-200 opacity-60 h-full">
                    <CardContent className="p-6 h-full flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${tool.iconColor}10` }}
                        >
                          <Icon className="w-5 h-5" style={{ color: tool.iconColor }} />
                        </div>
                        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                          Coming soon
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-stone-900 text-lg mb-1">{tool.name}</h3>
                      <p className="text-sm text-stone-500 mb-2">{tool.tagline}</p>
                      <p className="text-sm text-stone-600 leading-relaxed mb-4 flex-1">
                        {tool.description}
                      </p>
                      <div className="text-sm text-stone-400 font-medium">
                        In development
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* History (only show if user has past assessments) */}
          {history.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="max-w-5xl mx-auto mt-12"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-stone-500" />
                  <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wider">
                    Your recent assessments
                  </h2>
                </div>
                <button
                  onClick={handleClearHistory}
                  className="text-xs text-stone-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {history.slice(0, 6).map((item) => (
                  <Card
                    key={item.id}
                    className="border-stone-200 hover:border-emerald-300 transition-all cursor-pointer group"
                    onClick={() => handleOpenHistoryItem(item)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="text-xs font-medium text-stone-400">
                          {item.toolName}
                        </div>
                        <div className="text-xs text-stone-400">
                          {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-stone-900 line-clamp-2 mb-2">
                        {item.processName}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            item.verdict === 'AUTOMATE_NOW' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            item.verdict === 'PILOT_FIRST' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            'bg-stone-50 text-stone-700 border-stone-200'
                          }`}
                        >
                          {item.verdictLabel}
                        </Badge>
                        {item.annualSavings && item.annualSavings > 0 && (
                          <span className="text-xs text-stone-500">
                            {item.annualSavings >= 1000 ? `$${(item.annualSavings / 1000).toFixed(0)}K/yr` : `$${Math.round(item.annualSavings)}/yr`}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Newsletter signup */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="max-w-2xl mx-auto mt-16 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-100 text-stone-600 text-sm mb-4">
              <Heart className="w-4 h-4 text-emerald-700" />
              New tools shipped regularly
            </div>
            <p className="text-stone-600">
              Want notified when I ship a new tool?{' '}
              <a
                href="https://x.com/sodbotter"
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 font-medium hover:text-emerald-800"
              >
                Follow @sodbotter on X
              </a>
              {' '}or subscribe via any tool above.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200/60 py-6 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-xs text-stone-500 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span>Tool Hub — Free AI-powered decision tools</span>
          <span>Estimates only. Validate before acting.</span>
        </div>
      </footer>
    </div>
  );
}
