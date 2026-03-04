'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';
import StepIndicator from '@/components/StepIndicator';
import StatusBadge from '@/components/StatusBadge';
import AnalysisStep from '@/components/AnalysisStep';
import AnswersStep from '@/components/AnswersStep';
import LegalReviewStep from '@/components/LegalReviewStep';
import OpsMessageStep from '@/components/OpsMessageStep';
import type { StepStatuses, StepStatus, AnalysisSummary, Question, QAPair } from '@/types';

const STEP_KEYS = ['step1', 'step2', 'step3', 'step4'] as const;
const STEP_LABELS = ['PDF 분석', '파트너 Q&A', '법무검토', '서명 요청'];

const STATUS_CYCLE: StepStatus[] = ['waiting', 'in_progress', 'hold', 'done'];

export default function AgreementPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [agreement, setAgreement] = useState<any>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchAgreement = useCallback(async () => {
    try {
      const res = await fetch(`/api/agreement/${id}`);
      if (!res.ok) {
        router.push('/');
        return;
      }
      const data = await res.json();
      setAgreement(data);

      const statuses: StepStatuses = JSON.parse(data.stepStatuses);
      if (statuses.step4 === 'done' || statuses.step4 === 'hold') setActiveStep(3);
      else if (statuses.step3 === 'done' || statuses.step3 === 'hold') setActiveStep(3);
      else if (statuses.step2 === 'done') setActiveStep(2);
      else if (statuses.step1 === 'done') setActiveStep(1);
      else setActiveStep(0);
    } catch {
      router.push('/');
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchAgreement();
  }, [fetchAgreement]);

  async function handleStatusChange(stepKey: string) {
    if (!agreement) return;
    const statuses: StepStatuses = JSON.parse(agreement.stepStatuses);
    const current = statuses[stepKey as keyof StepStatuses];
    const nextIdx = (STATUS_CYCLE.indexOf(current) + 1) % STATUS_CYCLE.length;
    const next = STATUS_CYCLE[nextIdx];

    try {
      await fetch(`/api/agreement/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: stepKey, status: next }),
      });
      fetchAgreement();
    } catch (error) {
      console.error('Status change failed:', error);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
        <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  if (!agreement) return null;

  const stepStatuses: StepStatuses = JSON.parse(agreement.stepStatuses);
  const title = agreement.contractName || agreement.fileName.replace('.pdf', '');
  const summary: AnalysisSummary | null = agreement.summary
    ? JSON.parse(agreement.summary)
    : null;
  const questions: Question[] | null = agreement.questions
    ? JSON.parse(agreement.questions)
    : null;
  const answers: QAPair[] | null = agreement.answers
    ? JSON.parse(agreement.answers)
    : null;

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => router.push('/')}
              className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2.5 min-w-0">
              <FileText className="w-5 h-5 text-gray-500 flex-shrink-0" />
              <h1 className="font-bold text-gray-900 truncate">{title}</h1>
            </div>
          </div>
          <StepIndicator
            stepStatuses={stepStatuses}
            activeStep={activeStep}
            onStepClick={setActiveStep}
          />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Step Status Control */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-sm font-medium text-gray-500">
            {STEP_LABELS[activeStep]}
          </span>
          <StatusBadge status={stepStatuses[STEP_KEYS[activeStep]]} />
          <button
            onClick={() => handleStatusChange(STEP_KEYS[activeStep])}
            className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1 hover:bg-gray-50 transition-colors"
          >
            상태 변경
          </button>
        </div>

        {/* Step Content */}
        <div className="animate-fade-in">
          {activeStep === 0 && (
            <AnalysisStep
              agreementId={id}
              summary={summary}
              questions={questions}
              status={agreement.status}
              allClear={agreement.allClear}
              onRefresh={fetchAgreement}
            />
          )}
          {activeStep === 1 && (
            <AnswersStep
              agreementId={id}
              questions={questions}
              existingAnswers={answers}
              allClear={agreement.allClear}
              onRefresh={fetchAgreement}
            />
          )}
          {activeStep === 2 && (
            <LegalReviewStep
              agreementId={id}
              existingReview={agreement.legalReview}
              onRefresh={fetchAgreement}
            />
          )}
          {activeStep === 3 && (
            <OpsMessageStep
              agreementId={id}
              existingMessage={agreement.opsMessage}
              onRefresh={fetchAgreement}
            />
          )}
        </div>
      </main>
    </div>
  );
}
