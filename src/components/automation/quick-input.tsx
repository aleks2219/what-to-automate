'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  PenLine,
  FileText,
  Mic,
  Square,
  Loader2,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExtractionResult } from '@/lib/extraction-types';

type InputMode = 'describe' | 'paste' | 'talk';

interface QuickInputProps {
  onExtracted: (extraction: ExtractionResult, originalText: string) => void;
  onBack: () => void;
  onManual: () => void;
}

const EXAMPLES = [
  'Every Monday, our marketing manager spends ~3 hours pulling analytics from 4 different dashboards into a weekly report for the leadership team.',
  'Our finance team reconciles ~200 vendor invoices every week. Each one takes 10-15 minutes of matching against POs in NetSuite.',
  'Sales reps spend ~30 min after every customer call logging notes into Salesforce, often with incomplete info.',
  'HR manually reviews ~50 resumes per role, screens for must-have skills, then emails qualified candidates.',
];

export function QuickInput({ onExtracted, onBack, onManual }: QuickInputProps) {
  const [mode, setMode] = useState<InputMode>('describe');
  const [text, setText] = useState('');
  const [pasted, setPasted] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (timerRef.current) clearInterval(timerRef);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleDescribe = async () => {
    if (text.trim().length < 5) {
      setError('Please describe the process in at least one sentence.');
      return;
    }
    await runExtraction(text.trim(), 'describe');
  };

  const handlePaste = async () => {
    if (pasted.trim().length < 20) {
      setError('Please paste at least a paragraph of content.');
      return;
    }
    await runExtraction(pasted.trim(), 'paste');
  };

  const runExtraction = async (input: string, mode: 'describe' | 'paste' | 'voice') => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: input, mode }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Extraction failed' }));
        throw new Error(err.error || 'Extraction failed');
      }
      const data: ExtractionResult = await res.json();
      onExtracted(data, input);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Could not extract: ${msg}. Try again or use manual entry.`);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Pick a mimeType the browser supports; fall back gracefully
      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const recorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        });
        // Stop the stream tracks
        streamRef.current?.getTracks().forEach((t) => t.stop());

        if (blob.size < 1000) {
          setError('Recording too short. Please try again.');
          return;
        }

        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = reader.result as string;
          setTranscribing(true);
          try {
            const transcriptRes = await fetch('/api/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ audio: base64Audio }),
            });
            if (!transcriptRes.ok) {
              const err = await transcriptRes.json().catch(() => ({ error: 'Transcription failed' }));
              throw new Error(err.error || 'Transcription failed');
            }
            const { transcript } = await transcriptRes.json();
            // Now run extraction on the transcript
            await runExtraction(transcript, 'voice');
          } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Unknown error';
            setError(`Voice transcription failed: ${msg}. Try typing instead.`);
          } finally {
            setTranscribing(false);
          }
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((s) => {
          if (s >= 60) {
            stopRecording();
            return s;
          }
          return s + 1;
        });
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Microphone access failed';
      setError(`Could not access microphone: ${msg}. Check browser permissions.`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);
  };

  const busy = loading || transcribing;

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/30">
      <header className="border-b border-stone-200/60 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-emerald-700 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold text-stone-900 tracking-tight">AutoScore</span>
          </div>
          <button
            onClick={onBack}
            className="text-sm text-stone-500 hover:text-stone-900 transition-colors"
          >
            Home
          </button>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium mb-4 border border-emerald-100">
              <Sparkles className="w-3 h-3" />
              AI-assisted
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-stone-900 mb-3">
              Tell us about your process
            </h1>
            <p className="text-stone-600 mb-8 leading-relaxed">
              Pick whatever&apos;s easiest. Our AI extracts the details — you just confirm what&apos;s right.
            </p>

            <Tabs value={mode} onValueChange={(v) => setMode(v as InputMode)}>
              <TabsList className="grid w-full grid-cols-3 bg-stone-100">
                <TabsTrigger value="describe" className="data-[state=active]:bg-white">
                  <PenLine className="w-3.5 h-3.5 mr-1.5" />
                  Describe
                </TabsTrigger>
                <TabsTrigger value="paste" className="data-[state=active]:bg-white">
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  Paste doc
                </TabsTrigger>
                <TabsTrigger value="talk" className="data-[state=active]:bg-white">
                  <Mic className="w-3.5 h-3.5 mr-1.5" />
                  Talk
                </TabsTrigger>
              </TabsList>

              {/* Describe tab */}
              <TabsContent value="describe" className="mt-6">
                <Card className="border-stone-200">
                  <CardContent className="p-5">
                    <label className="text-sm font-medium text-stone-900 mb-2 block">
                      Describe the process in your own words
                    </label>
                    <Textarea
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="e.g., Every Monday our marketing manager spends 3 hours pulling analytics from 4 dashboards into a weekly report for leadership..."
                      className="bg-white min-h-[140px] resize-none"
                      maxLength={5000}
                    />
                    <div className="flex justify-between text-xs text-stone-400 mt-2">
                      <span>One sentence is enough. The more detail, the better the assessment.</span>
                      <span>{text.length}/5000</span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-stone-100">
                      <div className="text-xs text-stone-500 mb-2">Try an example:</div>
                      <div className="flex flex-wrap gap-2">
                        {EXAMPLES.map((ex, i) => (
                          <button
                            key={i}
                            onClick={() => setText(ex)}
                            className="text-xs px-2.5 py-1 rounded-md bg-stone-50 hover:bg-stone-100 text-stone-600 border border-stone-200 transition-colors text-left"
                          >
                            {ex.slice(0, 50)}…
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-5 flex justify-end">
                  <Button
                    onClick={handleDescribe}
                    disabled={busy || text.trim().length < 5}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        Analyzing…
                      </>
                    ) : (
                      <>
                        Extract & continue
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* Paste tab */}
              <TabsContent value="paste" className="mt-6">
                <Card className="border-stone-200">
                  <CardContent className="p-5">
                    <label className="text-sm font-medium text-stone-900 mb-2 block">
                      Paste an SOP, Slack thread, job description, or meeting notes
                    </label>
                    <Textarea
                      value={pasted}
                      onChange={(e) => setPasted(e.target.value)}
                      placeholder={"Paste content here. Examples:\n• A Notion SOP document\n• A Slack thread where someone described the workflow\n• A job description that mentions the process\n• Notes from a process review meeting"}
                      className="bg-white min-h-[200px] resize-none font-mono text-xs"
                      maxLength={10000}
                    />
                    <div className="flex justify-between text-xs text-stone-400 mt-2">
                      <span>AI will identify the process and extract relevant details.</span>
                      <span>{pasted.length}/10000</span>
                    </div>
                  </CardContent>
                </Card>

                <div className="mt-5 flex justify-end">
                  <Button
                    onClick={handlePaste}
                    disabled={busy || pasted.trim().length < 20}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                        Analyzing…
                      </>
                    ) : (
                      <>
                        Extract & continue
                        <ArrowRight className="w-4 h-4 ml-1.5" />
                      </>
                    )}
                  </Button>
                </div>
              </TabsContent>

              {/* Talk tab */}
              <TabsContent value="talk" className="mt-6">
                <Card className="border-stone-200">
                  <CardContent className="p-8 text-center">
                    <div className="text-sm font-medium text-stone-900 mb-1">
                      Record a 30–60 second voice memo
                    </div>
                    <p className="text-xs text-stone-500 mb-6 max-w-md mx-auto">
                      Just talk naturally: who does the process, how often, how long it takes,
                      and what tools are involved. No script needed.
                    </p>

                    {!isRecording && !transcribing && recordingSeconds === 0 && (
                      <Button
                        onClick={startRecording}
                        className="bg-emerald-700 hover:bg-emerald-800 text-white h-14 w-14 rounded-full p-0"
                        aria-label="Start recording"
                      >
                        <Mic className="w-6 h-6" />
                      </Button>
                    )}

                    {isRecording && (
                      <div className="flex flex-col items-center gap-4">
                        <Button
                          onClick={stopRecording}
                          className="bg-red-600 hover:bg-red-700 text-white h-14 w-14 rounded-full p-0 animate-pulse"
                          aria-label="Stop recording"
                        >
                          <Square className="w-5 h-5" fill="currentColor" />
                        </Button>
                        <div className="text-sm font-medium text-stone-900">
                          {formatTime(recordingSeconds)}
                          <span className="text-stone-400 font-normal ml-2">recording…</span>
                        </div>
                        <div className="text-xs text-stone-500">
                          Tap to stop. We&apos;ll transcribe and extract automatically.
                        </div>
                      </div>
                    )}

                    {transcribing && (
                      <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-10 h-10 text-emerald-700 animate-spin" />
                        <div className="text-sm font-medium text-stone-900">
                          Transcribing & analyzing…
                        </div>
                        <div className="text-xs text-stone-500">
                          This takes ~5 seconds.
                        </div>
                      </div>
                    )}

                    <div className="mt-6 pt-4 border-t border-stone-100 text-xs text-stone-400 max-w-sm mx-auto">
                      Audio is sent securely for transcription and not stored.
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {error && (
              <div className="mt-5 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
                {error}
              </div>
            )}

            {/* Manual fallback */}
            <div className="mt-10 pt-6 border-t border-stone-200 text-center">
              <div className="text-xs text-stone-500 mb-2">Prefer to fill in fields yourself?</div>
              <button
                onClick={onManual}
                className="text-sm text-emerald-700 hover:text-emerald-800 font-medium"
              >
                Use the manual form →
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="border-t border-stone-200/60 bg-white py-4">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-stone-600 hover:text-stone-900"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <div className="text-xs text-stone-400">
            Powered by AI • Free • No login
          </div>
        </div>
      </footer>
    </div>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
