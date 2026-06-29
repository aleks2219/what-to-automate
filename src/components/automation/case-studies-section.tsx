'use client';

import { motion } from 'framer-motion';
import { Quote, TrendingUp, Clock, Target } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CaseStudy, CASE_STUDIES } from '@/lib/case-studies-db';
import { getToolsByIds } from '@/lib/tools-db';

interface CaseStudiesSectionProps {
  caseStudyIds: string[];
}

export function CaseStudiesSection({ caseStudyIds }: CaseStudiesSectionProps) {
  const studies = caseStudyIds
    .map((id) => CASE_STUDIES.find((c) => c.id === id))
    .filter((c): c is CaseStudy => c !== undefined);

  if (studies.length === 0) return null;

  return (
    <Card className="border-stone-200 print:shadow-none">
      <CardContent className="p-6 print:p-0">
        <div className="flex items-center gap-2 mb-1">
          <Quote className="w-4 h-4 text-stone-700" />
          <h2 className="text-lg font-semibold text-stone-900">Similar companies, real results</h2>
        </div>
        <p className="text-sm text-stone-500 mb-5">
          Companies with similar processes who already automated. Real metrics, not estimates.
        </p>

        <div className="space-y-4">
          {studies.map((study, i) => (
            <CaseStudyCard key={study.id} study={study} delay={i * 0.05} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CaseStudyCard({ study, delay = 0 }: { study: CaseStudy; delay?: number }) {
  const toolsUsed = getToolsByIds(study.toolsUsed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="border border-stone-200 rounded-lg p-5 bg-white hover:border-stone-300 transition-colors"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs">
              {study.industry}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {study.companySize}
            </Badge>
          </div>
          <h3 className="font-semibold text-stone-900 text-sm leading-snug">{study.title}</h3>
        </div>
      </div>

      {/* Process + approach */}
      <div className="mb-3">
        <div className="text-xs text-stone-500 mb-1">What they automated</div>
        <p className="text-sm text-stone-700">{study.processAutomated}</p>
      </div>

      {/* Results — 3 metric cards */}
      <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-stone-50 rounded-md">
        <Metric
          icon={Clock}
          label="Time saved"
          value={study.results.timeSaved}
        />
        <Metric
          icon={TrendingUp}
          label="Cost saved"
          value={study.results.costSaved}
        />
        <Metric
          icon={Target}
          label="Errors reduced"
          value={study.results.errorReduction}
        />
      </div>

      {/* Summary */}
      <p className="text-sm text-stone-600 leading-relaxed mb-3">{study.summary}</p>

      {/* Key learning */}
      <div className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-md mb-3">
        <div className="text-xs font-medium text-emerald-800 uppercase tracking-wider mb-1">
          Key learning
        </div>
        <p className="text-sm text-stone-700 leading-relaxed">{study.keyLearning}</p>
      </div>

      {/* Tools used */}
      {toolsUsed.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-stone-100">
          <span className="text-xs text-stone-500">Tools used:</span>
          {toolsUsed.map((tool) => (
            <Badge key={tool.id} variant="outline" className="text-xs">
              {tool.name}
            </Badge>
          ))}
        </div>
      )}
    </motion.div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1 text-xs text-stone-500 mb-1">
        <Icon className="w-3 h-3" />
        <span>{label}</span>
      </div>
      <div className="text-xs font-semibold text-stone-900 leading-tight">{value}</div>
    </div>
  );
}
