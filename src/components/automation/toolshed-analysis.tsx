'use client';

import { motion } from 'framer-motion';
import {
  Wrench,
  Check,
  AlertTriangle,
  TrendingDown,
  Lightbulb,
  ArrowRight,
  Plus,
  Minus,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CurrentToolAnalysis,
  ConsolidationOpportunity,
  ToolshedGap,
} from '@/lib/extraction-types';
import { getToolById } from '@/lib/tools-db';

interface ToolshedAnalysisProps {
  currentToolAnalysis: CurrentToolAnalysis[];
  consolidationOpportunities: ConsolidationOpportunity[];
  toolshedGaps: ToolshedGap[];
  usesExistingTools: boolean;
  toolshedSavings: string;
}

const STATUS_CONFIG = {
  keep: {
    icon: Check,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    label: 'Keep',
  },
  replace: {
    icon: RefreshCw,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    label: 'Replace',
  },
  expand: {
    icon: Plus,
    color: 'text-purple-700',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    label: 'Expand use',
  },
  underutilized: {
    icon: Lightbulb,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    label: 'Underutilized',
  },
  redundant: {
    icon: Minus,
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    label: 'Redundant',
  },
} as const;

const PRIORITY_CONFIG = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-stone-50 text-stone-700 border-stone-200',
} as const;

const IMPORTANCE_CONFIG = {
  critical: 'bg-red-50 text-red-700 border-red-200',
  useful: 'bg-amber-50 text-amber-700 border-amber-200',
  optional: 'bg-stone-50 text-stone-700 border-stone-200',
} as const;

export function ToolshedAnalysis({
  currentToolAnalysis,
  consolidationOpportunities,
  toolshedGaps,
  usesExistingTools,
  toolshedSavings,
}: ToolshedAnalysisProps) {
  // Don't render anything if user didn't provide current tools
  if (currentToolAnalysis.length === 0 && !usesExistingTools) return null;

  return (
    <div className="space-y-6">
      {/* Hero: total savings + uses existing tools */}
      {(toolshedSavings !== 'None identified' || usesExistingTools) && (
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-stone-50/40 print:shadow-none">
          <CardContent className="p-6 print:p-0">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-md bg-emerald-700 text-white flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-stone-900 mb-1">
                  {usesExistingTools
                    ? 'You already have the tools you need'
                    : 'Toolshed consolidation opportunities'}
                </h3>
                <p className="text-sm text-stone-700 leading-relaxed mb-3">
                  {usesExistingTools
                    ? 'Good news — your current toolshed already covers this process. You don\'t need to buy anything new. See the action plan below for how to use what you have.'
                    : `We found opportunities to consolidate your toolshed and save an estimated ${toolshedSavings} per year — without losing capability.`}
                </p>
                {toolshedSavings !== 'None identified' && !usesExistingTools && (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-emerald-200">
                    <TrendingDown className="w-4 h-4 text-emerald-700" />
                    <span className="font-semibold text-emerald-800">
                      Estimated annual savings: {toolshedSavings}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current toolshed analysis */}
      {currentToolAnalysis.length > 0 && (
        <Card className="border-stone-200 print:shadow-none">
          <CardContent className="p-6 print:p-0">
            <div className="flex items-center gap-2 mb-1">
              <Wrench className="w-4 h-4 text-stone-700" />
              <h2 className="text-lg font-semibold text-stone-900">Your current toolshed</h2>
              <Badge variant="outline" className="ml-1 text-xs">
                {currentToolAnalysis.length} tools
              </Badge>
            </div>
            <p className="text-sm text-stone-500 mb-5">
              Status of each tool — what it&apos;s doing well, what could be replaced, what&apos;s underutilized.
            </p>

            <div className="space-y-3">
              {currentToolAnalysis.map((tool, i) => (
                <ToolAnalysisRow key={i} tool={tool} delay={i * 0.05} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Consolidation opportunities */}
      {consolidationOpportunities.length > 0 && (
        <Card className="border-stone-200 print:shadow-none">
          <CardContent className="p-6 print:p-0">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-emerald-700" />
              <h2 className="text-lg font-semibold text-stone-900">Consolidation opportunities</h2>
            </div>
            <p className="text-sm text-stone-500 mb-5">
              Where you can drop, replace, or merge tools to save money without losing capability.
            </p>

            <div className="space-y-3">
              {consolidationOpportunities.map((opp, i) => (
                <ConsolidationRow key={i} opp={opp} delay={i * 0.05} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gaps in toolshed */}
      {toolshedGaps.length > 0 && (
        <Card className="border-stone-200 print:shadow-none">
          <CardContent className="p-6 print:p-0">
            <div className="flex items-center gap-2 mb-1">
              <Plus className="w-4 h-4 text-stone-700" />
              <h2 className="text-lg font-semibold text-stone-900">Gaps in your toolshed</h2>
            </div>
            <p className="text-sm text-stone-500 mb-5">
              Capabilities you&apos;re missing that would help with this process (and beyond).
            </p>

            <div className="space-y-3">
              {toolshedGaps.map((gap, i) => (
                <GapRow key={i} gap={gap} delay={i * 0.05} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ToolAnalysisRow({ tool, delay = 0 }: { tool: CurrentToolAnalysis; delay?: number }) {
  const config = STATUS_CONFIG[tool.status];
  const Icon = config.icon;
  const matchedTool = tool.toolId !== 'unknown' ? getToolById(tool.toolId) : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      className={`flex items-start gap-3 p-3 rounded-md border ${config.bg} ${config.border}`}
    >
      <div className={`w-8 h-8 rounded-md bg-white flex items-center justify-center flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="font-medium text-stone-900">
            {matchedTool?.name || tool.toolName}
          </span>
          <Badge variant="outline" className={`text-xs ${config.bg} ${config.color} ${config.border}`}>
            {config.label}
          </Badge>
          {tool.estimatedCost && tool.estimatedCost !== 'Unknown' && (
            <Badge variant="outline" className="text-xs">
              {tool.estimatedCost}
            </Badge>
          )}
        </div>
        <p className="text-sm text-stone-700 leading-relaxed mb-1">{tool.detectedUse}</p>
        <p className="text-xs text-stone-500 leading-relaxed">{tool.statusReason}</p>

        {/* If matched in catalog, show get-started link for replacement/expand tools */}
        {matchedTool && (tool.status === 'replace' || tool.status === 'expand') && (
          <a
            href={matchedTool.getStartedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 mt-2 print:hidden"
          >
            {tool.status === 'replace' ? 'See replacement options' : 'Learn what else it can do'}
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </motion.div>
  );
}

function ConsolidationRow({
  opp,
  delay = 0,
}: {
  opp: ConsolidationOpportunity;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      className="border border-stone-200 rounded-md p-4 bg-white"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-sm text-stone-800 leading-relaxed flex-1">{opp.description}</p>
        <Badge
          variant="outline"
          className={`text-xs flex-shrink-0 ${PRIORITY_CONFIG[opp.priority]}`}
        >
          {opp.priority}
        </Badge>
      </div>
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5 text-emerald-700">
          <TrendingDown className="w-3.5 h-3.5" />
          <span className="font-semibold">{opp.savings}</span>
        </div>
        <div className="flex items-center gap-1.5 text-stone-500">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{opp.effort}</span>
        </div>
      </div>
    </motion.div>
  );
}

function GapRow({ gap, delay = 0 }: { gap: ToolshedGap; delay?: number }) {
  const suggestedTools = gap.suggestedToolIds
    .map((id) => getToolById(id))
    .filter((t): t is NonNullable<typeof t> => t !== undefined);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay }}
      className="border border-stone-200 rounded-md p-4 bg-white"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <p className="text-sm font-medium text-stone-900 leading-relaxed flex-1">
          {gap.capability}
        </p>
        <Badge
          variant="outline"
          className={`text-xs flex-shrink-0 ${IMPORTANCE_CONFIG[gap.importance]}`}
        >
          {gap.importance}
        </Badge>
      </div>
      {suggestedTools.length > 0 && (
        <div className="mt-2">
          <div className="text-xs text-stone-500 mb-1.5">Tools that could fill this gap:</div>
          <div className="flex items-center gap-2 flex-wrap">
            {suggestedTools.map((tool) => (
              <a
                key={tool.id}
                href={tool.getStartedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-stone-50 hover:bg-stone-100 text-stone-700 border border-stone-200 transition-colors print:hidden"
              >
                {tool.name}
                <ExternalLink className="w-3 h-3" />
              </a>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
