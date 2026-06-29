'use client';

import { useState } from 'react';
import { Landing } from '@/components/automation/landing';
import { Wizard } from '@/components/automation/wizard';
import { Results } from '@/components/automation/results';
import { QuickInput } from '@/components/automation/quick-input';
import { ConfirmExtracted } from '@/components/automation/confirm-extracted';
import {
  AssessmentInput,
  AssessmentResult,
  computeAssessment,
} from '@/lib/automation';
import { ExtractionResult } from '@/lib/extraction-types';

type View =
  | 'landing'
  | 'quick-input'
  | 'confirm'
  | 'wizard'
  | 'results';

export default function Home() {
  const [view, setView] = useState<View>('landing');
  const [input, setInput] = useState<AssessmentInput | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [extraction, setExtraction] = useState<ExtractionResult | null>(null);
  const [originalText, setOriginalText] = useState<string>('');

  const handleQuickStart = () => {
    setView('quick-input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleManualStart = () => {
    setView('wizard');
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

  const handleRestart = () => {
    setView('landing');
    setInput(null);
    setResult(null);
    setExtraction(null);
    setOriginalText('');
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
    return <Results input={input} result={result} onRestart={handleRestart} />;
  }

  return <Landing onStart={handleQuickStart} onManual={handleManualStart} />;
}
