'use client';

import { useState } from 'react';
import { Loader2, Send, Sparkles } from 'lucide-react';
import CopyButton from './CopyButton';

export default function OpsMessageStep({
  agreementId,
  existingMessage,
  onRefresh,
}: {
  agreementId: string;
  existingMessage: string | null;
  onRefresh: () => void;
}) {
  const [counterpartyContact, setCounterpartyContact] = useState('');
  const [counterpartyEmail, setCounterpartyEmail] = useState('');
  const [signingMethod, setSigningMethod] = useState('DocuSign');
  const [additionalContext, setAdditionalContext] = useState('');
  const [includeCoCEO, setIncludeCoCEO] = useState(true);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(existingMessage || '');
  const [isEditing, setIsEditing] = useState(false);

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch('/api/ops-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agreementId,
          counterpartyContact,
          counterpartyEmail,
          signingMethod,
          additionalContext,
          includeCoCEO,
        }),
      });
      const data = await res.json();
      if (data.opsMessage) {
        setOutput(data.opsMessage);
        onRefresh();
      }
    } catch (error) {
      console.error('Ops message generation failed:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-5">
        <div className="flex items-center gap-2 mb-5">
          <Send className="w-5 h-5 text-gray-700" />
          <h4 className="font-semibold text-gray-900">운영팀 서명 요청 설정</h4>
        </div>

        <div className="space-y-4">
          {/* Counterparty Contact */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                상대방 담당자명
              </label>
              <input
                type="text"
                value={counterpartyContact}
                onChange={(e) => setCounterpartyContact(e.target.value)}
                placeholder="예: Jozef"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                상대방 이메일
              </label>
              <input
                type="email"
                value={counterpartyEmail}
                onChange={(e) => setCounterpartyEmail(e.target.value)}
                placeholder="contact@example.com"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300"
              />
            </div>
          </div>

          {/* Signing Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              서명 방식
            </label>
            <select
              value={signingMethod}
              onChange={(e) => setSigningMethod(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 appearance-none"
            >
              <option value="DocuSign">DocuSign (전자서명)</option>
              <option value="physical">물리적 서명</option>
              <option value="email">이메일 교환</option>
              <option value="other">기타</option>
            </select>
          </div>

          {/* Additional Context */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              추가 맥락 / 참고사항
            </label>
            <textarea
              value={additionalContext}
              onChange={(e) => setAdditionalContext(e.target.value)}
              placeholder="긴급성, 배경 정보, 특별 요청사항 등..."
              rows={3}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-300 resize-none"
            />
          </div>

          {/* Co-CEO Toggle */}
          <label className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors">
            <div>
              <div className="text-sm font-medium text-gray-800">
                Co-CEO 서명 포함
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                김지윤, 서병윤 Co-CEO 서명권자 안내 포함
              </div>
            </div>
            <div
              onClick={() => setIncludeCoCEO(!includeCoCEO)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                includeCoCEO ? 'bg-black' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform shadow-sm ${
                  includeCoCEO ? 'translate-x-5.5' : 'translate-x-0.5'
                }`}
              />
            </div>
          </label>

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
                {output ? '다시 생성' : '운영팀 메시지 생성'}
              </>
            )}
          </button>
        </div>
      </div>

      {/* Output */}
      {output && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-5">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">운영팀 메시지</h4>
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
              rows={15}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-black/5 resize-y"
            />
          ) : (
            <div className="rounded-xl bg-gray-50 border border-gray-200 px-5 py-4 text-sm leading-relaxed whitespace-pre-wrap">
              {output}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
