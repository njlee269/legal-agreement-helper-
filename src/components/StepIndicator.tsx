'use client';

import { cn } from '@/lib/utils';
import type { StepStatus, StepStatuses } from '@/types';
import { FileSearch, MessageSquare, Scale, Send } from 'lucide-react';

const STEPS = [
  { key: 'step1' as const, label: 'PDF 분석', icon: FileSearch },
  { key: 'step2' as const, label: '파트너 Q&A', icon: MessageSquare },
  { key: 'step3' as const, label: '법무검토', icon: Scale },
  { key: 'step4' as const, label: '서명 요청', icon: Send },
];

const dotColor: Record<StepStatus, string> = {
  done: 'bg-emerald-500 border-emerald-500 text-white',
  in_progress: 'bg-amber-500 border-amber-500 text-white',
  hold: 'bg-amber-400 border-amber-400 text-white',
  waiting: 'bg-white border-gray-300 text-gray-400',
};

const lineColor: Record<StepStatus, string> = {
  done: 'bg-emerald-500',
  in_progress: 'bg-amber-300',
  hold: 'bg-amber-300',
  waiting: 'bg-gray-200',
};

export default function StepIndicator({
  stepStatuses,
  activeStep,
  onStepClick,
}: {
  stepStatuses: StepStatuses;
  activeStep: number;
  onStepClick: (step: number) => void;
}) {
  return (
    <div className="flex items-center justify-between w-full">
      {STEPS.map((step, idx) => {
        const status = stepStatuses[step.key];
        const Icon = step.icon;
        const isActive = idx === activeStep;

        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => onStepClick(idx)}
              className={cn(
                'flex flex-col items-center gap-1.5 group relative',
                isActive && 'scale-105'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all',
                  dotColor[status],
                  isActive && 'ring-2 ring-offset-2 ring-black/10'
                )}
              >
                <Icon className="w-4.5 h-4.5" />
              </div>
              <span
                className={cn(
                  'text-xs font-medium whitespace-nowrap',
                  isActive ? 'text-black' : 'text-gray-500'
                )}
              >
                {step.label}
              </span>
            </button>
            {idx < STEPS.length - 1 && (
              <div className="flex-1 mx-3 mt-[-18px]">
                <div
                  className={cn(
                    'h-0.5 w-full rounded-full transition-colors',
                    lineColor[stepStatuses[STEPS[idx + 1].key]]
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
