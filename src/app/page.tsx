'use client';

import { useState } from 'react';
import { Landing } from '@/components/automation/landing';
import { Wizard } from '@/components/automation/wizard';
import { Results } from '@/components/automation/results';
import { QuickInput } from '@/components/automation/quick-input';
import { ConfirmExtracted } from '@/components/automation/confirm-extracted';
import { SwipeDeck } from '@/components/automation/swipe-deck';
import { MatchResults } from '@/components/automation/match-results';
import {
  AssessmentInput,
  AssessmentResult,
  computeAssessment,
} from '@/lib/automation';
import { ExtractionResult } from '@/lib/extraction-types';
import { ToolMatch } from '@/app/api/match-deck/route';
import { Tool } from '@/lib/tools-db';

type View =
  | 'landing'
  | 'quick-input'
  | 'confirm'
  | 'wizard'
  | 'results'
  | 'matcher'
  | 'match-results';

export default function Home() {
  const [view, setView] = useState<View>('landing');
  const [input, setInput] = useState<AssessmentInput | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [originalText, setOriginalText] = useState<string>('');
  const [matchedTools, setMatchedTools] = useState<Array<{ match: ToolMatch; tool: Tool }>>([]);
  const [passedTools, setPassedTools] = useState<Array<{ match: ToolMatch; tool: Tool }>>([]);

  const handleQuickStart = () => {
    setView('quick-input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleManualStart = () => {
    setView('wizard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMatcherStart = () => {
    setView('matcher');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExtracted = (ext: ExtractionResult, text: string) => {
    setExtraction(ext);
    setOriginalText(text);
    setView('confirm');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConfirmGenerate = (assessmentInput: AssessmentInput) => {
    setInput(assessmentInput);
    setResult(computeAssessment(assessmentInput));
    setView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleWizardComplete = (assessmentInput: AssessmentInput) => {
    setInput(assessmentInput);
    setResult(computeAssessment(assessmentInput));
    setView('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMatcherComplete = (
    matched: Array<{ match: ToolMatch; tool: Tool }>,
    passed: Array<{ match: ToolMatch; tool: Tool }>
  ) => {
    setMatchedTools(matched);
    setPassedTools(passed);
    setView('match-results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRestart = () => {
    setView('landing');
    setInput(null);
    setResult(null);
    setExtraction(null);
    setOriginalText('');
    setMatchedTools([]);
    setPassedTools([]);
  };

  if (view === 'quick-input') {
    return (
      <QuickInput
        onExtracted={handleExtracted}
        onBack={handleRestart}
        onManual={handleManualStart}
      />
    );
  }

  if (view === 'confirm' && extraction) {
    return (
      <ConfirmExtracted
        extraction={extraction}
        onGenerate={handleConfirmGenerate}
        onBack={() => setView('quick-input')}
        onRestart={handleRestart}
      />
    );
  }

  if (view === 'wizard') {
    return <Wizard onComplete={handleWizardComplete} onBack={handleRestart} />;
  }

  if (view === 'results' && input && result) {
    return (
      <Results
        input={input}
        result={result}
        extraction={extraction}
        onRestart={handleRestart}
      />
    );
  }

  if (view === 'matcher') {
    return (
      <SwipeDeck
        onComplete={handleMatcherComplete}
        onBack={handleRestart}
      />
    );
  }

  if (view === 'match-results') {
    return (
      <MatchResults
        matched={matchedTools}
        passed={passedTools}
        onRestart={handleMatcherStart}
        onTryAssessment={handleQuickStart}
        onBack={handleRestart}
      />
    );
  }

  return (
    <Landing
      onStart={handleQuickStart}
      onManual={handleManualStart}
      onMatcher={handleMatcherStart}
    />
  );
}
