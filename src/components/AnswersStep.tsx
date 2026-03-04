'use client';

import { useState } from 'react';
import { CheckCircle2, Loader2, SkipForward } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Question, QAPair } from '@/types';

const severityDot = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-blue-500',
};

export default function AnswersStep({
  agreementId,
  questions,
  existingAnswers,
  allClear,
  allClearRecommendation,
  onRefresh,
}: {
  agreementId: string;
  questions: Question[] | null;
  existingAnswers: QAPair[] | null;
  allClear: boolean;
  allClearRecommendation?: boolean;
  onRefresh: () => void;
}) {
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    if (existingAnswers) {
      const map: Record<number, string> = {};
      existingAnswers.forEach((a, i) => {
        map[i] = a.answer;
      });
      return map;
    }
    return {};
  });
  const [loading, setLoading] = useState(false);

  if (allClear || existingAnswers) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          {allClear ? '질문 없이 진행' : '답변 완료'}
        </h3>
        <p className="text-sm text-gray-500">
          {allClear
            ? '해당 계약서는 특이사항 없이 바로 법무검토 단계로 진행합니다.'
            : '파트너 답변이 처리되었습니다. 법무검토 단계로 진행하세요.'}
        </p>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        먼저 PDF 분석을 완료해주세요.
      </div>
    );
  }

  async function handleSubmit() {
    setLoading(true);
    try {
      const qaPairs = questions!.map((q, i) => ({
        question: q.question_ko,
        answer: answers[i] || '',
      }));

      await fetch('/api/process-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agreementId, answers: qaPairs }),
      });
      onRefresh();
    } catch (error) {
      console.error('Submit failed:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAllClear() {
    setLoading(true);
    try {
      await fetch('/api/process-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agreementId, allClear: true }),
      });
      onRefresh();
    } catch (error) {
      console.error('All clear failed:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* All Clear Option */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">질문 없이 진행</h4>
            <p className="text-sm text-gray-500 mt-0.5">
              {allClearRecommendation
                ? 'AI가 특이사항이 없다고 판단했습니다. 바로 법무검토로 진행할 수 있습니다.'
                : '파트너에게 확인할 사항이 없다면 바로 법무검토로 진행하세요.'}
            </p>
          </div>
          <button
            onClick={handleAllClear}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            <SkipForward className="w-4 h-4" />
            All Clear
          </button>
        </div>
      </div>

      {/* Questions with Answer Inputs */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-5">
        <h4 className="font-semibold text-gray-900 mb-4">
          파트너 답변 입력 ({questions.length}개 질문)
        </h4>

        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={i} className="rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn('w-2 h-2 rounded-full', severityDot[q.severity])} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {q.category}
                </span>
              </div>
              <p className="text-sm font-medium text-gray-800 mb-1">{q.question_ko}</p>
              <p className="text-xs text-gray-500 mb-3">{q.question_en}</p>
              <textarea
                value={answers[i] || ''}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, [i]: e.target.value }))
                }
                placeholder="파트너 답변을 입력하세요..."
                rows={2}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 resize-none"
              />
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-2 bg-black text-white rounded-xl px-6 py-3 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                처리 중...
              </>
            ) : (
              '답변 제출'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
