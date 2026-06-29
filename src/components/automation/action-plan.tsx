'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Check, AlertCircle, DollarSign, Clock, Lightbulb, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tool, TOOLS } from '@/lib/tools-db';

interface ActionPlanProps {
  recommendedToolIds: string[];
  toolRationale: string;
  firstStep: string;
  budgetBreakdown: {
    tooling: string;
    implementation: string;
    ongoing: string;
    totalYear1: string;
  };
  industryBenchmarks: {
    maturity: string;
    commonPatterns: string[];
    averageRoi: string;
  };
}

export function ActionPlan({
  recommendedToolIds,
  toolRationale,
  firstStep,
  budgetBreakdown,
  industryBenchmarks,
}: ActionPlanProps) {
  const tools = recommendedToolIds
    .map((id) => TOOLS.find((t) => t.id === id))
    .filter((t): t is Tool => t !== undefined);

  if (tools.length === 0 && !firstStep) return null;

  return (
    <div className="space-y-6">
      {/* Tool recommendations */}
      {tools.length > 0 && (
        <Card className="border-stone-200 print:shadow-none">
          <CardContent className="p-6 print:p-0">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-emerald-700" />
              <h2 className="text-lg font-semibold text-stone-900">Recommended tools</h2>
            </div>
            <p className="text-sm text-stone-500 mb-5">
              Specific tools that fit your process — with pricing and where to start.
            </p>

            {toolRationale && (
              <div className="mb-5 p-3 rounded-md bg-emerald-50/50 border border-emerald-100">
                <div className="text-xs font-medium text-emerald-800 uppercase tracking-wider mb-1">
                  Why these
                </div>
                <p className="text-sm text-stone-700 leading-relaxed">{toolRationale}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              {tools.map((tool, i) => (
                <ToolCard key={tool.id} tool={tool} delay={i * 0.05} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* First step */}
      {firstStep && (
        <Card className="border-emerald-200 bg-emerald-50/40 print:shadow-none">
          <CardContent className="p-6 print:p-0">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-md bg-emerald-700 text-white flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-medium text-emerald-800 uppercase tracking-wider mb-1">
                  Your first step today (~15-30 min)
                </div>
                <p className="text-stone-800 leading-relaxed">{firstStep}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget breakdown */}
      {budgetBreakdown && (budgetBreakdown.tooling || budgetBreakdown.implementation) && (
        <Card className="border-stone-200 print:shadow-none">
          <CardContent className="p-6 print:p-0">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-4 h-4 text-stone-700" />
              <h2 className="text-lg font-semibold text-stone-900">Budget breakdown</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <BudgetItem label="Tooling" value={budgetBreakdown.tooling} />
              <BudgetItem label="Implementation" value={budgetBreakdown.implementation} />
              <BudgetItem label="Ongoing (annual)" value={budgetBreakdown.ongoing} />
              <BudgetItem
                label="Year 1 total"
                value={budgetBreakdown.totalYear1}
                highlight
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Industry benchmarks */}
      {industryBenchmarks && (industryBenchmarks.maturity || industryBenchmarks.averageRoi) && (
        <Card className="border-stone-200 print:shadow-none">
          <CardContent className="p-6 print:p-0">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-stone-700" />
              <h2 className="text-lg font-semibold text-stone-900">How you compare</h2>
            </div>
            <div className="space-y-3">
              {industryBenchmarks.maturity && (
                <div>
                  <div className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">
                    Automation maturity
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {industryBenchmarks.maturity}
                  </p>
                </div>
              )}
              {industryBenchmarks.commonPatterns && industryBenchmarks.commonPatterns.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">
                    Common patterns in your industry
                  </div>
                  <ul className="space-y-1">
                    {industryBenchmarks.commonPatterns.map((p, i) => (
                      <li key={i} className="text-sm text-stone-700 flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {industryBenchmarks.averageRoi && (
                <div>
                  <div className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">
                    Typical ROI
                  </div>
                  <p className="text-sm text-stone-700 leading-relaxed">
                    {industryBenchmarks.averageRoi}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ToolCard({ tool, delay = 0 }: { tool: Tool; delay?: number }) {
  const categoryColors: Record<string, string> = {
    integration: 'bg-blue-50 text-blue-700 border-blue-200',
    ai: 'bg-purple-50 text-purple-700 border-purple-200',
    rpa: 'bg-amber-50 text-amber-700 border-amber-200',
    custom: 'bg-stone-100 text-stone-700 border-stone-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="border border-stone-200 rounded-lg overflow-hidden hover:border-stone-300 transition-colors bg-white"
    >
      {/* Header with logo placeholder + name */}
      <div className="p-4 border-b border-stone-100">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ backgroundColor: tool.logoColor }}
          >
            {tool.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-stone-900 truncate">{tool.name}</div>
            <div className="text-xs text-stone-500 mt-0.5 line-clamp-2">{tool.tagline}</div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={`${categoryColors[tool.category]} text-xs`}>
            {tool.category.toUpperCase()}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {tool.startingPrice}
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {tool.timeToValue}
          </Badge>
        </div>

        <div>
          <div className="text-xs text-stone-500 mb-1">Best for</div>
          <p className="text-sm text-stone-700 leading-relaxed">{tool.bestFor}</p>
        </div>

        {tool.freeTier && (
          <div className="flex items-start gap-2 text-xs text-stone-600">
            <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <span>{tool.freeTier}</span>
          </div>
        )}

        {/* Pros/cons — collapsed on print */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-stone-100 print:hidden">
          <div>
            <div className="text-xs font-medium text-emerald-700 mb-1">Pros</div>
            <ul className="space-y-0.5">
              {tool.pros.slice(0, 2).map((p, i) => (
                <li key={i} className="text-xs text-stone-600 flex items-start gap-1">
                  <span className="text-emerald-600">+</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-xs font-medium text-amber-700 mb-1">Cons</div>
            <ul className="space-y-0.5">
              {tool.cons.slice(0, 2).map((c, i) => (
                <li key={i} className="text-xs text-stone-600 flex items-start gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="p-4 pt-0 print:hidden">
        <a href={tool.getStartedUrl} target="_blank" rel="noopener noreferrer">
          <Button
            variant="outline"
            className="w-full border-stone-300 text-stone-700 hover:bg-stone-50 hover:border-stone-400"
          >
            Get started
            <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </a>
      </div>
    </motion.div>
  );
}

function BudgetItem({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  if (!value) return null;
  return (
    <div
      className={`p-3 rounded-md ${
        highlight ? 'bg-emerald-50 border border-emerald-200' : 'bg-stone-50'
      }`}
    >
      <div className="text-xs text-stone-500 mb-1">{label}</div>
      <div className={`text-sm font-semibold ${highlight ? 'text-emerald-800' : 'text-stone-900'}`}>
        {value}
      </div>
    </div>
  );
}
