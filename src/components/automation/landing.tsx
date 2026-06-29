'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Clock,
  FileText,
  ShieldCheck,
  TrendingUp,
  Zap,
  Building2,
  LineChart,
  Sparkles,
  Heart,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface LandingProps {
  onStart: () => void;
  onManual: () => void;
  onMatcher: () => void;
}

export function Landing({ onStart, onManual, onMatcher }: LandingProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-stone-200/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-700 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-stone-900 tracking-tight">
              AutoScore
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-stone-600">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> No login required
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> 60-second input
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex items-center">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium mb-6 border border-emerald-100">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                125+ AI tools · Free · No login
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-stone-900 leading-[1.05] mb-6">
                Find the{' '}
                <span className="text-emerald-700">AI tools</span> that
                actually fit your work
              </h1>
              <p className="text-lg text-stone-600 leading-relaxed mb-8 max-w-xl">
                Tell us what you want to do. Swipe through a personalized deck of
                AI tools — match scores, real pros/cons, and direct links to try them.
                Or run a full assessment on a specific process for ROI + roadmap.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  onClick={onMatcher}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white h-12 px-7 text-base"
                >
                  <Heart className="w-4 h-4 mr-1.5" />
                  Swipe through AI tools
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onStart}
                  className="border-emerald-300 text-emerald-800 hover:bg-emerald-50 h-12 px-7 text-base"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Full assessment
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onManual}
                  className="border-stone-300 text-stone-700 hover:bg-stone-50 h-12 px-7 text-base"
                >
                  Manual form
                </Button>
              </div>

              <div className="mt-4 text-sm text-stone-500 flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  No login
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Free
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  PDF export
                </span>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-6">
                <Stat value="125+" label="AI tools curated" />
                <Stat value="< 1 min" label="To your matches" />
                <Stat value="Free" label="No login required" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <SampleResult />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-stone-200/60 bg-stone-50/50">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-stone-900 mb-3">
              How it works
            </h2>
            <p className="text-stone-600 max-w-2xl mx-auto">
              Three steps. Swipe through AI tools, save the ones you love, get links to try them.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <Step
              icon={Sparkles}
              step="01"
              title="Tell us what you want to do"
              description="One sentence is enough. 'Write marketing copy', 'generate product images', 'transcribe meetings' — anything you'd want an AI tool for."
            />
            <Step
              icon={Heart}
              step="02"
              title="Swipe through AI tool matches"
              description="Get 5-8 personalized AI tools with match scores. Swipe right on the ones you want to try, left on the ones you don't."
            />
            <Step
              icon={FileText}
              step="03"
              title="Save your matches + try them"
              description="Email yourself the list with direct links to try each tool. Or run a full assessment for ROI + roadmap."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200/60 py-6 bg-white">
        <div className="max-w-6xl mx-auto px-6 text-sm text-stone-500 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span>AutoScore — Decision tools for operators</span>
          <span>Assessments are estimates, not financial advice.</span>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-2xl font-semibold text-stone-900">{value}</div>
      <div className="text-xs text-stone-500 mt-1">{label}</div>
    </div>
  );
}

function Step({
  icon: Icon,
  step,
  title,
  description,
}: {
  icon: typeof Building2;
  step: string;
  title: string;
  description: string;
}) {
  return (
    <Card className="bg-white border-stone-200/70 hover:border-emerald-200 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 rounded-md bg-emerald-50 flex items-center justify-center">
            <Icon className="w-5 h-5 text-emerald-700" />
          </div>
          <span className="text-xs font-mono text-stone-400">{step}</span>
        </div>
        <h3 className="font-semibold text-stone-900 mb-2">{title}</h3>
        <p className="text-sm text-stone-600 leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

function SampleResult() {
  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-gradient-to-br from-emerald-100/40 to-stone-100/40 rounded-3xl blur-2xl" />
      <Card className="relative bg-white border-stone-200/80 shadow-xl shadow-stone-200/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-5">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
              Sample verdict
            </span>
            <span className="text-xs text-stone-400">Q3 assessment</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-700 text-white text-sm font-semibold mb-5">
            <TrendingUp className="w-4 h-4" />
            AUTOMATE NOW
          </div>

          <p className="text-sm text-stone-600 leading-relaxed mb-6">
            Payback of <span className="font-semibold text-stone-900">8 months</span> and
            risk-adjusted score of <span className="font-semibold text-stone-900">8.4/10</span> make this
            a clear near-term investment.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <Metric value="$127K" label="Annual savings" />
            <Metric value="640 hrs" label="Hours reclaimed" />
            <Metric value="218%" label="3-yr ROI" />
          </div>

          <div className="border-t border-stone-100 pt-4 space-y-2">
            <SampleBullet text="Reclaims ~640 hours of specialist capacity annually" />
            <SampleBullet text="Standardizes a process across 4 team members" />
            <SampleBullet text="Scales to 2x volume at near-zero marginal cost" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-xl font-semibold text-stone-900">{value}</div>
      <div className="text-xs text-stone-500 mt-0.5">{label}</div>
    </div>
  );
}

function SampleBullet({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2 text-sm text-stone-600">
      <div className="w-1 h-1 rounded-full bg-emerald-600 mt-2 flex-shrink-0" />
      <span>{text}</span>
    </div>
  );
}
