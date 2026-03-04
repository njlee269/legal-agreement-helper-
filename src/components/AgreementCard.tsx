'use client';

import { cn } from '@/lib/utils';
import type { StepStatus, StepStatuses } from '@/types';
import { FileText, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const dotColor: Record<StepStatus, string> = {
  done: 'bg-emerald-500',
  in_progress: 'bg-amber-500',
  hold: 'bg-amber-400',
  waiting: 'bg-gray-300',
};

export default function AgreementCard({
  agreement,
}: {
  agreement: {
    id: string;
    fileName: string;
    contractName: string | null;
    counterparty: string | null;
    uploadedAt: string;
    stepStatuses: string;
    status: string;
  };
}) {
  const statuses: StepStatuses = JSON.parse(agreement.stepStatuses);
  const title = agreement.contractName || agreement.fileName.replace('.pdf', '');
  const date = new Date(agreement.uploadedAt).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <Link href={`/agreement/${agreement.id}`}>
      <div className="group bg-white rounded-2xl border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.04)] p-5 hover:shadow-[0_4px_30px_rgba(0,0,0,0.08)] hover:border-gray-200 transition-all cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
              <FileText className="w-5 h-5 text-gray-600" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">{title}</h3>
              {agreement.counterparty && (
                <p className="text-sm text-gray-500 mt-0.5 truncate">
                  {agreement.counterparty}
                </p>
              )}
              <p className="text-xs text-gray-400 mt-1">{date}</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0 mt-2" />
        </div>

        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-gray-100">
          {(['step1', 'step2', 'step3', 'step4'] as const).map((step, idx) => (
            <div key={step} className="flex items-center gap-1.5">
              <div className={cn('w-2 h-2 rounded-full', dotColor[statuses[step]])} />
              <span className="text-[10px] text-gray-400">
                {['분석', 'Q&A', '법무', '서명'][idx]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}
