'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Results } from '@/components/automation/results';
import { decodeResult, ShareableResult } from '@/lib/shareable-results';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function SharedResultPage() {
  const params = useParams();
  const router = useRouter();
  const encoded = params.encoded as string;
  const [data, setData] = useState<ShareableResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const decode = () => {
      if (!encoded) {
        setError('No result data found in URL.');
        setLoading(false);
        return;
      }

      const decoded = decodeResult(encoded);
      if (!decoded || !decoded.input || !decoded.result) {
        setError('Could not decode this shared result. The link may be corrupted or truncated.');
        setLoading(false);
        return;
      }

      setData(decoded);
      setLoading(false);
    };

    // Defer to avoid synchronous setState in effect body
    const timer = setTimeout(decode, 0);
    return () => clearTimeout(timer);
  }, [encoded]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50">
        <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mb-4" />
        <div className="text-sm text-stone-500">Loading shared result...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 px-6">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-stone-900 mb-2">Result not found</h1>
          <p className="text-stone-500 mb-6">{error || 'This shared result could not be loaded.'}</p>
          <Link href="/">
            <Button className="bg-emerald-700 hover:bg-emerald-800 text-white">
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Go to Tool Hub
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Add a shared-result banner at the top
  return (
    <div>
      {/* Shared result banner */}
      <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 text-center print:hidden">
        <p className="text-xs text-emerald-800">
          This is a shared AutoScore result.{' '}
          <Link href="/" className="font-medium underline hover:no-underline">
            Run your own assessment
          </Link>
        </p>
      </div>

      <Results
        input={data.input}
        result={data.result}
        extraction={data.extraction}
        onRestart={() => router.push('/')}
      />
    </div>
  );
}
