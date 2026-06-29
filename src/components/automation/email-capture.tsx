'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, FileText, Gift, Check, Loader2, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface EmailCaptureProps {
  // Pass the report data so we can include it in the email trigger
  processName: string;
  verdict: string;
  annualSavings: string;
}

export function EmailCapture({ processName, verdict, annualSavings }: EmailCaptureProps) {
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
          processName,
          verdict,
          annualSavings,
          source: 'autoscore',
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

  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-stone-50/40 print:hidden">
      <CardContent className="p-6">
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-emerald-700" />
                </div>
                <h3 className="text-lg font-semibold text-stone-900 mb-2">
                  You&apos;re in! Check your inbox.
                </h3>
                <p className="text-sm text-stone-600 mb-4 max-w-md mx-auto">
                  We&apos;ve sent your report summary + the automation playbook to{' '}
                  <span className="font-medium text-stone-900">{email}</span>.
                  The 5-day email course starts tomorrow.
                </p>
                <div className="bg-white/60 rounded-md p-3 max-w-sm mx-auto">
                  <div className="text-xs font-medium text-stone-700 mb-1">
                    Want a PDF of this report right now?
                  </div>
                  <Button
                    onClick={handlePrintPdf}
                    variant="outline"
                    size="sm"
                    className="border-stone-300 text-stone-700"
                  >
                    <FileText className="w-3.5 h-3.5 mr-1.5" />
                    Save as PDF
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-md bg-emerald-700 flex items-center justify-center">
                  <Gift className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-stone-900">
                    Get the PDF + automation playbook
                  </h3>
                  <p className="text-xs text-stone-500">Free. No spam. Unsubscribe anytime.</p>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <Perk
                  icon={FileText}
                  title="This report as PDF"
                  description="Print-ready version with all sections, formatted for sharing."
                />
                <Perk
                  icon={Sparkles}
                  title="Industry automation playbook"
                  description="20 automation ideas specific to your industry — only available via email."
                />
                <Perk
                  icon={Mail}
                  title="5-day email course"
                  description="How to actually implement your first automation — one short email per day."
                />
              </div>

              <form onSubmit={handleSubmit} className="space-y-2">
                <Label htmlFor="email" className="sr-only">
                  Email address
                </Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    id="email"
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
                        Send me the PDF
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
                By subscribing, you&apos;ll receive the report, the playbook, and the 5-day course.
                You&apos;ll also get notified when I ship new free tools. No spam, unsubscribe anytime.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

function Perk({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof FileText;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-md bg-emerald-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-3.5 h-3.5 text-emerald-700" />
      </div>
      <div>
        <div className="text-sm font-medium text-stone-900">{title}</div>
        <div className="text-xs text-stone-600 leading-relaxed">{description}</div>
      </div>
    </div>
  );
}
