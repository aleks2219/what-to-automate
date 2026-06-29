'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import {
  Heart,
  X,
  Info,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles,
  RotateCcw,
  ExternalLink,
  Check,
  Zap,
  Target,
  Clock,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TOOLS, Tool, INDUSTRIES, Industry } from '@/lib/tools-db-adapter';
import { ToolMatch } from '@/app/api/match-deck/route';

interface SwipeDeckProps {
  onComplete: (matched: Array<{ match: ToolMatch; tool: Tool }>, passed: Array<{ match: ToolMatch; tool: Tool }>) => void;
  onBack: () => void;
}

type Phase = 'input' | 'loading' | 'swiping';

export function SwipeDeck({ onComplete, onBack }: SwipeDeckProps) {
  const [phase, setPhase] = useState<Phase>('input');
  const [whatToAutomate, setWhatToAutomate] = useState('');
  const [industry, setIndustry] = useState<Industry | ''>('');
  const [currentTools, setCurrentTools] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Deck state
  const [deck, setDeck] = useState<Array<{ match: ToolMatch; tool: Tool }>>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matched, setMatched] = useState<Array<{ match: ToolMatch; tool: Tool }>>([]);
  const [passed, setPassed] = useState<Array<{ match: ToolMatch; tool: Tool }>>([]);

  const handleGenerate = async () => {
    if (whatToAutomate.trim().length < 5) {
      setError('Please tell us what you want to do (at least one sentence).');
      return;
    }
    setError(null);
    setPhase('loading');
    try {
      const res = await fetch('/api/match-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          whatToAutomate: whatToAutomate.trim(),
          industry: industry || undefined,
          currentTools: currentTools.trim() || undefined,
          companyWebsite: companyWebsite.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Match deck generation failed' }));
        throw new Error(err.error || 'Match deck generation failed');
      }
      const data = await res.json();
      // Pair each match with its full tool data
      const fullDeck = (data.matches as ToolMatch[])
        .map((m) => {
          const tool = TOOLS.find((t) => t.id === m.toolId);
          return tool ? { match: m, tool } : null;
        })
        .filter((x): x is { match: ToolMatch; tool: Tool } => x !== null);
      if (fullDeck.length < 3) {
        throw new Error('Not enough matching tools found. Try a more specific description.');
      }
      setDeck(fullDeck);
      setCurrentIndex(0);
      setMatched([]);
      setPassed([]);
      setPhase('swiping');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(`Could not generate deck: ${msg}`);
      setPhase('input');
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    const current = deck[currentIndex];
    if (!current) return;
    if (direction === 'right') {
      setMatched((prev) => [...prev, current]);
    } else {
      setPassed((prev) => [...prev, current]);
    }
    if (currentIndex + 1 >= deck.length) {
      // Deck complete — call onComplete with final arrays
      const finalMatched = direction === 'right' ? [...matched, current] : matched;
      const finalPassed = direction === 'left' ? [...passed, current] : passed;
      setTimeout(() => onComplete(finalMatched, finalPassed), 300);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  // ============ INPUT PHASE ============
  if (phase === 'input') {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50/30">
        <header className="border-b border-stone-200/60 bg-white sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
            <button
              onClick={onBack}
              className="text-sm text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              Home
            </button>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              AI Tool Discovery
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center">
          <div className="max-w-xl mx-auto px-6 py-10 w-full">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-medium mb-4 border border-emerald-100">
                <Heart className="w-3 h-3" />
                Swipe to match
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-stone-900 mb-3">
                Discover your AI tools
              </h1>
              <p className="text-stone-600 mb-8 leading-relaxed">
                Tell us what you want to do. We&apos;ll generate a personalized deck of AI tools — swipe right on the ones you want to try.
              </p>

              <div className="space-y-5">
                <div>
                  <Label className="text-sm font-medium text-stone-900 mb-1.5 block">
                    What do you want to do? <span className="text-emerald-700">*</span>
                  </Label>
                  <Textarea
                    value={whatToAutomate}
                    onChange={(e) => setWhatToAutomate(e.target.value)}
                    placeholder="e.g., Write marketing copy, generate product images, transcribe meetings, build a chatbot, analyze data..."
                    className="bg-white min-h-[100px] resize-none"
                    maxLength={2000}
                  />
                  <div className="text-xs text-stone-400 mt-1">
                    One sentence is enough. The more specific, the better the matches.
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-sm font-medium text-stone-900 mb-1.5 block">
                      Industry <span className="text-stone-400 font-normal">(optional)</span>
                    </Label>
                    <Select value={industry} onValueChange={(v) => setIndustry(v as Industry)}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Pick one" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((i) => (
                          <SelectItem key={i.value} value={i.value}>
                            {i.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-stone-900 mb-1.5 block">
                      Current tools <span className="text-stone-400 font-normal">(optional)</span>
                    </Label>
                    <Input
                      value={currentTools}
                      onChange={(e) => setCurrentTools(e.target.value)}
                      placeholder="Slack, Notion, Zapier..."
                      className="bg-white"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-stone-900 mb-1.5 block">
                    Company website <span className="text-stone-400 font-normal">(optional — we&apos;ll research it)</span>
                  </Label>
                  <Input
                    type="url"
                    value={companyWebsite}
                    onChange={(e) => setCompanyWebsite(e.target.value)}
                    placeholder="yourcompany.com"
                    className="bg-white"
                  />
                  <div className="text-xs text-stone-400 mt-1">
                    We&apos;ll fetch your site and tailor recommendations to your actual product + industry.
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-3">
                    {error}
                  </div>
                )}

                <Button
                  size="lg"
                  onClick={handleGenerate}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white h-12 text-base"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" />
                  Discover AI tools
                </Button>

                <div className="text-xs text-stone-500 text-center pt-2">
                  Takes ~5 seconds. Free, no signup.
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    );
  }

  // ============ LOADING PHASE ============
  if (phase === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50/30">
        <Loader2 className="w-10 h-10 text-emerald-700 animate-spin mb-4" />
        <div className="text-base font-medium text-stone-900 mb-1">
          Building your deck...
        </div>
        <div className="text-sm text-stone-500">
          {companyWebsite.trim() ? 'Researching your company + matching AI tools...' : 'AI is finding the best AI tools for you.'}
        </div>
      </div>
    );
  }

  // ============ SWIPING PHASE ============
  const current = deck[currentIndex];
  if (!current) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-stone-50 to-stone-100/50">
      <header className="px-6 py-4 flex items-center justify-between max-w-md mx-auto w-full">
        <button
          onClick={onBack}
          className="text-sm text-stone-500 hover:text-stone-900 transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" />
          Exit
        </button>
        <div className="text-sm font-medium text-stone-700">
          {currentIndex + 1} of {deck.length}
        </div>
        <div className="text-xs text-stone-500 flex items-center gap-1">
          <Heart className="w-3 h-3 fill-red-500 text-red-500" />
          {matched.length}
        </div>
      </header>

      {/* Progress bar */}
      <div className="max-w-md mx-auto w-full px-6">
        <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-600"
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex) / deck.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Card stack */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full">
        <div className="relative w-full" style={{ aspectRatio: '3/4', maxHeight: '70vh' }}>
          <AnimatePresence>
            {/* Render up to 3 cards stacked */}
            {deck.slice(currentIndex, currentIndex + 3).map((item, i) => {
              const isTop = i === 0;
              return (
                <SwipeCard
                  key={`${item.tool.id}-${currentIndex + i}`}
                  item={item}
                  isTop={isTop}
                  index={i}
                  onSwipe={isTop ? handleSwipe : undefined}
                />
              );
            })}
          </AnimatePresence>

          {/* Empty state if we've swiped through all (shouldn't hit because onComplete fires) */}
          {currentIndex >= deck.length && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <Check className="w-12 h-12 text-emerald-700 mx-auto mb-3" />
                <div className="text-lg font-semibold text-stone-900">That&apos;s everyone!</div>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-4 mt-6">
          <ActionButton
            onClick={() => handleSwipe('left')}
            variant="pass"
            disabled={currentIndex >= deck.length}
          >
            <X className="w-7 h-7" />
          </ActionButton>
          <ActionButton
            onClick={() => handleSwipe('right')}
            variant="match"
            disabled={currentIndex >= deck.length}
          >
            <Heart className="w-7 h-7" />
          </ActionButton>
        </div>
        <div className="text-xs text-stone-500 mt-3 text-center">
          Swipe or tap the buttons. <span className="hidden sm:inline">Drag the card on mobile.</span>
        </div>
      </main>
    </div>
  );
}

// ============== SWIPE CARD ==============

interface SwipeCardProps {
  item: { match: ToolMatch; tool: Tool };
  isTop: boolean;
  index: number;
  onSwipe?: (direction: 'left' | 'right') => void;
}

function SwipeCard({ item, isTop, index, onSwipe }: SwipeCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [exitX, setExitX] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-15, 15]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0.5, 1, 1, 1, 0.5]);

  // Heart opacity (right swipe indicator)
  const heartOpacity = useTransform(x, [20, 100], [0, 1]);
  const xOpacity = useTransform(x, [-100, -20], [1, 0]);

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const threshold = 100;
    if (info.offset.x > threshold) {
      setExitX(300);
      setTimeout(() => onSwipe?.('right'), 100);
    } else if (info.offset.x < -threshold) {
      setExitX(-300);
      setTimeout(() => onSwipe?.('left'), 100);
    }
  };

  const matchScore = item.match.matchScore;
  const matchColor =
    matchScore >= 85 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
    matchScore >= 70 ? 'text-blue-700 bg-blue-50 border-blue-200' :
    'text-stone-700 bg-stone-50 border-stone-200';

  // Stack offset for cards behind
  const stackOffset = index * 8;
  const stackScale = 1 - index * 0.04;

  return (
    <motion.div
      className="absolute inset-0"
      style={{
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        opacity: isTop ? opacity : 1,
        zIndex: 10 - index,
        translateY: stackOffset,
        scale: stackScale,
      }}
      drag={isTop && !flipped ? 'x' : false}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.7}
      onDragEnd={isTop ? handleDragEnd : undefined}
      onClick={(e) => {
        // Only flip if click, not drag
        if (isTop && Math.abs(x.get()) < 5) {
          setFlipped(!flipped);
        }
      }}
      animate={
        exitX !== 0
          ? { x: exitX, opacity: 0, transition: { duration: 0.3 } }
          : { x: 0, opacity: 1 }
      }
      initial={{ scale: stackScale, y: stackOffset }}
    >
      <Card className={`w-full h-full border-stone-200 shadow-xl overflow-hidden ${isTop ? 'cursor-grab active:cursor-grabbing' : ''}`}>
        <CardContent className="p-0 h-full flex flex-col">
          {/* Front of card */}
          {!flipped && (
            <div className="h-full flex flex-col">
              {/* Header with logo + match score */}
              <div className="p-5 border-b border-stone-100">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-base font-bold flex-shrink-0"
                      style={{ backgroundColor: item.tool.logoColor }}
                    >
                      {item.tool.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-stone-900 text-lg leading-tight">
                        {item.tool.name}
                      </div>
                      <div className="text-xs text-stone-500 mt-0.5">{item.tool.tagline}</div>
                    </div>
                  </div>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-sm font-bold ${matchColor}`}>
                  <Target className="w-3.5 h-3.5" />
                  {matchScore}% match
                </div>
              </div>

              {/* Highlight tagline */}
              <div className="px-5 py-4 bg-emerald-50/40 border-b border-emerald-100">
                <div className="text-xs font-medium text-emerald-800 uppercase tracking-wider mb-1">
                  Why it matches
                </div>
                <div className="text-base font-medium text-stone-900 leading-snug">
                  {item.match.highlight}
                </div>
              </div>

              {/* Body — key info at a glance */}
              <div className="flex-1 p-5 space-y-4 overflow-y-auto">
                <p className="text-sm text-stone-700 leading-relaxed">
                  {item.match.whyItMatches}
                </p>

                <div className="grid grid-cols-3 gap-2">
                  <MiniMetric icon={DollarSign} value={item.tool.startingPrice} label="Price" />
                  <MiniMetric icon={Clock} value={item.tool.timeToValue} label="To value" />
                  <MiniMetric icon={Zap} value={effortLabel(item.tool.userEffort)} label="Effort" />
                </div>

                {item.tool.freeTier && (
                  <div className="flex items-start gap-2 text-xs text-stone-600 bg-stone-50 p-2 rounded-md">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>{item.tool.freeTier}</span>
                  </div>
                )}

                {/* Tap to flip hint */}
                <div className="text-center text-xs text-stone-400 pt-2 flex items-center justify-center gap-1">
                  <Info className="w-3 h-3" />
                  Tap card for full details
                </div>
              </div>
            </div>
          )}

          {/* Back of card — full details */}
          {flipped && (
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: item.tool.logoColor }}
                  >
                    {item.tool.name.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="font-bold text-stone-900">{item.tool.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setFlipped(false);
                  }}
                  className="text-xs text-stone-500 hover:text-stone-900"
                >
                  ← Back
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <div className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">
                    Best for
                  </div>
                  <p className="text-sm text-stone-800 leading-relaxed">{item.tool.bestFor}</p>
                </div>

                <div>
                  <div className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1">
                    What you do
                  </div>
                  <p className="text-sm text-stone-800 leading-relaxed">{item.tool.whatYouDo}</p>
                </div>

                <div>
                  <div className="text-xs font-medium text-stone-500 uppercase tracking-wider mb-1.5">
                    Capabilities
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {item.tool.capabilities.slice(0, 6).map((cap) => (
                      <Badge key={cap} variant="outline" className="text-xs">
                        {cap.replace(/-/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-xs font-medium text-emerald-700 mb-1">Pros</div>
                    <ul className="space-y-0.5">
                      {item.tool.pros.slice(0, 3).map((p, i) => (
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
                      {item.tool.cons.slice(0, 3).map((c, i) => (
                        <li key={i} className="text-xs text-stone-600 flex items-start gap-1">
                          <X className="w-3 h-3 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-stone-100">
                <a
                  href={item.tool.getStartedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="block"
                >
                  <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white" size="sm">
                    Visit {item.tool.name}
                    <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </a>
              </div>
            </div>
          )}

          {/* Swipe indicators overlay (only on top card, front side) */}
          {isTop && !flipped && (
            <>
              <motion.div
                style={{ opacity: heartOpacity }}
                className="absolute top-6 right-6 pointer-events-none"
              >
                <div className="px-3 py-1.5 rounded-md bg-emerald-600 text-white text-sm font-bold rotate-12 flex items-center gap-1">
                  <Heart className="w-4 h-4 fill-white" />
                  MATCH
                </div>
              </motion.div>
              <motion.div
                style={{ opacity: xOpacity }}
                className="absolute top-6 left-6 pointer-events-none"
              >
                <div className="px-3 py-1.5 rounded-md bg-red-500 text-white text-sm font-bold -rotate-12 flex items-center gap-1">
                  <X className="w-4 h-4" />
                  PASS
                </div>
              </motion.div>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============== ACTION BUTTON ==============

function ActionButton({
  children,
  onClick,
  variant,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant: 'match' | 'pass';
  disabled?: boolean;
}) {
  const styles = {
    match: 'bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 shadow-lg shadow-emerald-100',
    pass: 'bg-white text-red-500 border-red-200 hover:bg-red-50 hover:border-red-300 shadow-lg shadow-red-100',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed ${styles[variant]}`}
    >
      {children}
    </button>
  );
}

// ============== HELPERS ==============

function MiniMetric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof DollarSign;
  value: string;
  label: string;
}) {
  return (
    <div className="text-center p-2 bg-stone-50 rounded-md">
      <Icon className="w-3.5 h-3.5 text-stone-500 mx-auto mb-1" />
      <div className="text-xs font-medium text-stone-900 leading-tight">{value}</div>
      <div className="text-[10px] text-stone-500 mt-0.5">{label}</div>
    </div>
  );
}

function effortLabel(effort: string): string {
  const labels: Record<string, string> = {
    'upload-and-go': 'Upload',
    configure: 'Config',
    'build-visually': 'Build',
    'write-code': 'Code',
  };
  return labels[effort] || effort;
}
