'use client';

import { motion } from 'framer-motion';
import { Wrench, ExternalLink, Check, ListChecks } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  WorkflowTemplate,
  WORKFLOW_TEMPLATES,
} from '@/lib/workflow-templates-db';
import { getToolsByIds } from '@/lib/tools-db';

interface TemplatesSectionProps {
  templateIds: string[];
}

export function TemplatesSection({ templateIds }: TemplatesSectionProps) {
  const templates = templateIds
    .map((id) => WORKFLOW_TEMPLATES.find((t) => t.id === id))
    .filter((t): t is WorkflowTemplate => t !== undefined);

  if (templates.length === 0) return null;

  return (
    <Card className="border-stone-200 print:shadow-none">
      <CardContent className="p-6 print:p-0">
        <div className="flex items-center gap-2 mb-1">
          <Wrench className="w-4 h-4 text-stone-700" />
          <h2 className="text-lg font-semibold text-stone-900">Starter templates</h2>
        </div>
        <p className="text-sm text-stone-500 mb-5">
          Pre-built workflow blueprints you can clone and customize. Saves hours of setup.
        </p>

        <div className="space-y-4">
          {templates.map((template, i) => (
            <TemplateCard key={template.id} template={template} delay={i * 0.05} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TemplateCard({
  template,
  delay = 0,
}: {
  template: WorkflowTemplate;
  delay?: number;
}) {
  const tools = getToolsByIds(template.toolsNeeded);

  const typeLabels: Record<string, string> = {
    'pre-built': 'Pre-built — clone & customize',
    blueprint: 'Blueprint — step-by-step guide',
    'build-from-scratch': 'Build from scratch — full guide',
  };

  const typeColors: Record<string, string> = {
    'pre-built': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    blueprint: 'bg-blue-50 text-blue-700 border-blue-200',
    'build-from-scratch': 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="border border-stone-200 rounded-lg p-5 bg-white"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-stone-900 mb-1">{template.title}</h3>
          <p className="text-sm text-stone-600 leading-relaxed">{template.description}</p>
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 flex-wrap mb-4">
        <Badge variant="outline" className={`text-xs ${typeColors[template.templateType]}`}>
          {typeLabels[template.templateType]}
        </Badge>
        <Badge variant="outline" className="text-xs">
          {template.timeToBuild}
        </Badge>
        <Badge variant="outline" className="text-xs">
          Difficulty: {template.difficulty}/5
        </Badge>
      </div>

      {/* Tools needed */}
      {tools.length > 0 && (
        <div className="mb-4">
          <div className="text-xs text-stone-500 mb-1.5">Tools you&apos;ll need</div>
          <div className="flex items-center gap-2 flex-wrap">
            {tools.map((tool) => (
              <Badge key={tool.id} variant="outline" className="text-xs">
                {tool.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Steps preview */}
      <div className="mb-4">
        <div className="text-xs text-stone-500 mb-2 flex items-center gap-1">
          <ListChecks className="w-3.5 h-3.5" />
          What&apos;s involved ({template.steps.length} steps)
        </div>
        <ol className="space-y-1.5">
          {template.steps.slice(0, 4).map((step, i) => (
            <li key={i} className="text-sm text-stone-700 flex items-start gap-2">
              <span className="text-xs font-mono text-stone-400 mt-0.5 flex-shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span>{step}</span>
            </li>
          ))}
          {template.steps.length > 4 && (
            <li className="text-xs text-stone-500 pl-7 italic">
              + {template.steps.length - 4} more steps in the full template
            </li>
          )}
        </ol>
      </div>

      {/* Prerequisites */}
      {template.prerequisites.length > 0 && (
        <div className="mb-4 p-3 bg-stone-50 rounded-md">
          <div className="text-xs font-medium text-stone-700 mb-1.5">Before you start</div>
          <ul className="space-y-1">
            {template.prerequisites.map((p, i) => (
              <li key={i} className="text-xs text-stone-600 flex items-start gap-1.5">
                <Check className="w-3 h-3 text-stone-400 mt-0.5 flex-shrink-0" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* CTA */}
      <a href={template.templateUrl} target="_blank" rel="noopener noreferrer">
        <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white">
          {template.templateType === 'pre-built' ? 'Clone template' : 'View full guide'}
          <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
        </Button>
      </a>
    </motion.div>
  );
}
