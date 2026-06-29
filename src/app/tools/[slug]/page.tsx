'use client';

import { useParams, useRouter } from 'next/navigation';
import { ToolEngine } from '@/components/tool-engine/tool-engine';
import { getToolBySlug } from '@/lib/tools-registry';
import { ArrowLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function ToolPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const tool = getToolBySlug(slug);

  if (!tool) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-stone-900 mb-2">Tool not found</h1>
          <p className="text-stone-500 mb-6">The tool "{slug}" doesn&apos;t exist or has been moved.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-emerald-700 hover:text-emerald-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all tools
          </Link>
        </div>
      </div>
    );
  }

  if (tool.status === 'coming-soon') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <div className="text-center max-w-md px-6">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: `${tool.iconColor}15` }}
          >
            <Sparkles className="w-8 h-8" style={{ color: tool.iconColor }} />
          </div>
          <h1 className="text-3xl font-semibold text-stone-900 mb-2">{tool.name}</h1>
          <p className="text-stone-500 mb-2">{tool.tagline}</p>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium mb-6 border border-amber-200">
            Coming soon
          </div>
          <p className="text-stone-600 mb-6">{tool.description}</p>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-emerald-700 hover:text-emerald-800 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to all tools
          </Link>
        </div>
      </div>
    );
  }

  return <ToolEngine config={tool} onBack={() => router.push('/')} />;
}
