'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Scale, FileText } from 'lucide-react';
import PdfDropzone from '@/components/PdfDropzone';
import AgreementCard from '@/components/AgreementCard';

export default function Dashboard() {
  const router = useRouter();
  const [agreements, setAgreements] = useState<any[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchAgreements = useCallback(async () => {
    try {
      const res = await fetch('/api/agreements');
      const data = await res.json();
      setAgreements(data);
    } catch (error) {
      console.error('Failed to fetch agreements:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgreements();
  }, [fetchAgreements]);

  function handleUpload(id: string) {
    router.push(`/agreement/${id}`);
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center">
              <Scale className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg leading-tight">Legal Bot</h1>
              <p className="text-xs text-gray-500">DSRV Labs</p>
            </div>
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="inline-flex items-center gap-2 bg-black text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            <Plus className="w-4 h-4" />
            새 계약서
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Upload Area */}
        {showUpload && (
          <div className="mb-8 animate-fade-in">
            <PdfDropzone onUpload={handleUpload} />
          </div>
        )}

        {/* Agreements List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-black rounded-full animate-spin" />
          </div>
        ) : agreements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-700 mb-1">
              아직 계약서가 없습니다
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              PDF 파일을 업로드하여 시작하세요
            </p>
            {!showUpload && (
              <button
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center gap-2 bg-black text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-4 h-4" />
                첫 계약서 업로드
              </button>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
              계약서 목록 ({agreements.length})
            </h2>
            <div className="grid gap-3">
              {agreements.map((agreement) => (
                <AgreementCard key={agreement.id} agreement={agreement} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
