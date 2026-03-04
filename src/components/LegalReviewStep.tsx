'use client';

import { useState } from 'react';
import { Loader2, Scale, Sparkles } from 'lucide-react';
import CopyButton from './CopyButton';

export default function LegalReviewStep({
  agreementId,
  existingReview,
  onRefresh,
}: {
  agreementId: string;
  existingReview: string | null;
  onRefresh: () => void;
}) {
  const [includeVASPCheck, setIncludeVASPCheck] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewDeadline, setReviewDeadline] = useState('');
  const [documentLink, setDocumentLink] = useState('');
  const [historyBackground, setHistoryBackground] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(existingReview || '');
  const [isEditing, setIsEditing] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch('/api/legal-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agreementId,
          includeVASPCheck,
          reviewNotes: reviewNotes || undefined,
          reviewDeadline: reviewDeadline || undefined,
          documentLink: documentLink || undefined,
          historyBackground: historyBackground || undefined,
        }),
      });
      const data = await res.json();
      if (data.legalReview) {
        setOutput(data.legalReview);
        onRefresh();
      }
    } catch (error) {
      console.error('Legal review generation failed:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-5">
        <div className="flex items-center gap-2 mb-5">
          <Scale className="w-5 h-5 text-gray-700" />
          <h4 className="font-semibold text-gray-900">법무검토 요청서 설정</h4>
        </div>

        <div className="space-y-4">
          {/* VASP Check Toggle */}
          <label className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
            <div>
              <div className="text-sm font-medium text-gray-800">
                미신고 가상자산사업자 리스트 확인
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                Notion 데이터베이스 연동 확인 포함
              </div>
            </div>
            <div
              onClick={() => setIncludeVASPCheck(!includeVASPCheck)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                includeVASPCheck ? 'bg-black' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
                  includeVASPCheck ? 'translate-x-5.5' : 'translate-x-0.5'
                }`}
              />
            </div>
          </label>

          {/* Document Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              계약서 링크 (Google Docs 등)
            </label>
            <input
              type="url"
              value={documentLink}
              onChange={(e) => setDocumentLink(e.target.value)}
              placeholder="https://docs.google.com/..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300"
            />
          </div>

          {/* Review Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              검토 요청 기한
            </label>
            <input
              type="text"
              value={reviewDeadline}
              onChange={(e) => setReviewDeadline(e.target.value)}
              placeholder="예: 2026.03.10 또는 '금주 내 검토 부탁드립니다'"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300"
            />
          </div>

          {/* Review Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              검토 요청 사항 / 특이사항
            </label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="특별히 검토가 필요한 조항이나 우려사항을 입력하세요..."
              rows={3}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 resize-none"
            />
          </div>

          {/* History / Background */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              History / Background
            </label>
            <textarea
              value={historyBackground}
              onChange={(e) => setHistoryBackground(e.target.value)}
              placeholder="계약의 배경, 히스토리, 추가 맥락 정보가 있다면 입력하세요..."
              rows={3}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 resize-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 bg-black text-white rounded-xl px-6 py-3 font-medium hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                {output ? '다시 생성' : '법무검토 요청서 생성'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output */}
      {output && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">법무검토 요청서</h4>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="text-sm text-gray-500 hover:text-gray-700 font-medium"
              >
                {isEditing ? '완료' : '수정'}
              </button>
              <CopyButton text={output} />
            </div>
          </div>

          {isEditing ? (
            <textarea
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              rows={20}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-black/5 resize-y"
            />
          ) : (
            <div className="rounded-xl bg-gray-50 border border-gray-200 px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap font-mono">
              {output}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
