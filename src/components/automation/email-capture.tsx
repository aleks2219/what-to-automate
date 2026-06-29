'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  FileText,
  Gift,
  Check,
  Loader2,
  Sparkles,
  ArrowRight,
  Download,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AssessmentInput, AssessmentResult } from '@/lib/automation';
import { ExtractionResult } from '@/lib/extraction-types';

interface EmailCaptureProps {
  input: AssessmentInput;
  result: AssessmentResult;
  extraction: ExtractionResult | null;
}

export function EmailCapture({ input, result, extraction }: EmailCaptureProps) {
  const [email, setEmail] = useState('');
  const [emailStatus, setEmailStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [pdfDownloading, setPdfDownloading] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);

  // Download PDF directly — NO EMAIL REQUIRED
  const handleDownloadPdf = async () => {
    setPdfDownloading(true);
    try {
      const res = await fetch('/api/generate-report-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, result, extraction }),
      });
      if (!res.ok) throw new Error('Failed to generate PDF');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const processName = input.processName || 'process-assessment';
      a.download = `autoscore-${processName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setPdfDownloaded(true);
    } catch (err) {
      console.error('PDF download error:', err);
      setErrorMessage('Could not generate PDF. Try again.');
    } finally {
      setPdfDownloading(false);
    }
  };

  // Optional email signup — never blocks the PDF
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      setEmailStatus('error');
      return;
    }
    setEmailStatus('loading');
    setErrorMessage('');
    try {
      const res = await fetch('/api/email-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          source: 'autoscore',
          input,
          result,
          extraction,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to subscribe' }));
        throw new Error(err.error || 'Failed to subscribe');
      }
      setEmailStatus('success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setErrorMessage(msg);
      setEmailStatus('error');
    }
  };

  return (
    <div className="space-y-4">
      {/* PDF Download — always available, no email required */}
      <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-stone-50/40 print:hidden">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-700 flex items-center justify-center flex-shrink-0">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-stone-900 mb-1">
                Download your full report PDF
              </h3>
              <p className="text-sm text-stone-600 mb-4">
                Multi-page report with verdict, ROI, roadmap, tool recommendations, case studies, and assessment inputs. Formatted for sharing.
              </p>
              <Button
                onClick={handleDownloadPdf}
                disabled={pdfDownloading}
                className="bg-emerald-700 hover:bg-emerald-800 text-white"
              >
                {pdfDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Generating PDF...
                  </>
                ) : pdfDownloaded ? (
                  <>
                    <Check className="w-4 h-4 mr-1.5" />
                    Downloaded — get another
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-1.5" />
                    Download PDF report
                  </>
                )}
              </Button>
              {pdfDownloaded && (
                <p className="text-xs text-emerald-700 mt-2">
                  ✓ Check your downloads folder
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optional email signup — never blocks the PDF */}
      <Card className="border-stone-200 bg-stone-50/50 print:hidden">
        <CardContent className="p-5">
          <AnimatePresence mode="wait">
            {emailStatus === 'success' ? (
              <motion.div
                key="success"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-3 py-2"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Check className="w-4 h-4 text-emerald-700" />
                </div>
                <div>
                  <div className="text-sm font-medium text-stone-900">You&apos;re subscribed!</div>
                  <div className="text-xs text-stone-500">
                    We&apos;ll notify you about new tools. No spam.
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="w-4 h-4 text-stone-400" />
                  <span className="text-sm font-medium text-stone-700">
                    Want updates when I ship new tools?
                  </span>
                </div>
                <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailStatus === 'error') setEmailStatus('idle');
                    }}
                    placeholder="you@company.com (optional)"
                    className="bg-white flex-1 h-9 text-sm"
                    disabled={emailStatus === 'loading'}
                  />
                  <Button
                    type="submit"
                    disabled={emailStatus === 'loading'}
                    variant="outline"
                    size="sm"
                    className="border-stone-300 text-stone-700"
                  >
                    {emailStatus === 'loading' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        Subscribe
                        <ArrowRight className="w-3.5 h-3.5 ml-1" />
                      </>
                    )}
                  </Button>
                </form>
                {emailStatus === 'error' && (
                  <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
                )}
                <p className="text-xs text-stone-400 mt-2">
                  Optional. I ship free tools regularly — no spam, unsubscribe anytime.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  );
}
