'use client';

import { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Loader2,
  Shield,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AnalysisSummary, Question } from '@/types';

const severityColor = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-blue-50 text-blue-700 border-blue-200',
};

const riskScoreConfig = {
  high: { label: '높음', color: 'text-red-600 bg-red-50 border-red-200', icon: AlertTriangle },
  medium: { label: '보통', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: Shield },
  low: { label: '낮음', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
};

export default function AnalysisStep({
  agreementId,
  summary,
  questions,
  status,
  allClear,
  onRefresh,
}: {
  agreementId: string;
  summary: AnalysisSummary | null;
  questions: Question[] | null;
  status: string;
  allClear: boolean;
  onRefresh: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [showQuestions, setShowQuestions] = useState(true);

  async function handleAnalyze() {
    setLoading(true);
    try {
      await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agreementId }),
      });
      onRefresh();
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setLoading(false);
    }
  }

  if (!summary && status === 'uploaded') {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Sparkles className="w-12 h-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          AI 분석 시작
        </h3>
        <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
          업로드된 PDF를 AI가 분석하여 요약, 주요 조건, 리스크, 확인 질문을 생성합니다.
        </p>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="inline-flex items-center gap-2 bg-black text-white rounded-xl px-6 py-3 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              분석 중... (1-2분 소요)
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              PDF 분석 시작
            </>
          )}
        </button>
      </div>
    );
  }

  if (loading || status === 'analyzing') {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-12 h-12 text-gray-400 animate-spin mb-4" />
        <p className="text-sm text-gray-600">AI가 계약서를 분석하고 있습니다...</p>
        <p className="text-xs text-gray-400 mt-1">1-2분 정도 소요됩니다</p>
      </div>
    );
  }

  if (!summary) return null;

  const riskConfig = riskScoreConfig[summary.riskScore];
  const RiskIcon = riskConfig.icon;

  return (
    <div className="space-y-5">
      {/* Risk Score */}
      <div className={cn('flex items-center gap-3 rounded-xl border px-4 py-3', riskConfig.color)}>
        <RiskIcon className="w-5 h-5" />
        <span className="font-semibold">리스크 수준: {riskConfig.label}</span>
      </div>

      {/* Summary Card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-lg text-gray-900">{summary.title}</h3>
          <span className="inline-block mt-1 text-xs font-medium text-gray-500 bg-gray-100 rounded-full px-2.5 py-0.5">
            {summary.type}
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          <SummaryRow label="계약 개요" content={summary.whatItIs} />
          <SummaryRow label="상대방 요구사항" content={summary.whatTheyWant} />
          <SummaryRow label="우리 리스크" content={summary.whatWeCanLose} highlight />
          <SummaryRow label="계약 목적" content={summary.purpose} />
        </div>
      </div>

      {/* Key Terms */}
      {summary.keyTerms.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-5">
          <h4 className="font-semibold text-gray-900 mb-3">주요 조건</h4>
          <div className="flex flex-wrap gap-2">
            {summary.keyTerms.map((term, i) => (
              <span
                key={i}
                className="bg-gray-100 text-gray-700 rounded-lg px-3 py-1 text-sm"
              >
                {term}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Legal Risks */}
      {summary.legalRisks.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-5">
          <h4 className="font-semibold text-gray-900 mb-3">법적 리스크</h4>
          <div className="space-y-2">
            {summary.legalRisks.map((risk, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-xl border px-4 py-3',
                  severityColor[risk.severity]
                )}
              >
                <div className="font-medium text-sm">{risk.term}</div>
                <div className="text-sm mt-0.5 opacity-80">{risk.explanation}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions */}
      {questions && questions.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-5">
          <button
            onClick={() => setShowQuestions(!showQuestions)}
            className="flex items-center justify-between w-full"
          >
            <h4 className="font-semibold text-gray-900">
              확인 필요 질문 ({questions.length})
            </h4>
            {showQuestions ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {showQuestions && (
            <div className="space-y-3 mt-4">
              {questions.map((q, i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-xl border px-4 py-3',
                    severityColor[q.severity]
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                      {q.category}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{q.question_ko}</p>
                  <p className="text-xs mt-1 opacity-70">{q.question_en}</p>
                  {q.context && (
                    <p className="text-xs mt-1.5 opacity-60 italic">{q.context}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Clear indicator */}
      {allClear && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-emerald-700">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium text-sm">질문 없음 — 바로 법무검토로 진행 가능</span>
        </div>
      )}
    </div>
  );
}

function SummaryRow({
  label,
  content,
  highlight,
}: {
  label: string;
  content: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn('px-5 py-3.5', highlight && 'bg-red-50/30')}>
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className={cn('text-sm text-gray-700 leading-relaxed', highlight && 'text-red-700 font-medium')}>
        {content}
      </div>
    </div>
  );
}
