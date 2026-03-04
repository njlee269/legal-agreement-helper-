'use client';

import { cn } from '@/lib/utils';
import type { StepStatus } from '@/types';

const statusConfig: Record<StepStatus, { label: string; classes: string; dot: string }> = {
  done: {
    label: '완료',
    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  in_progress: {
    label: '진행 중',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  hold: {
    label: '대기 중',
    classes: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  waiting: {
    label: '대기',
    classes: 'bg-gray-50 text-gray-500 border-gray-200',
    dot: 'bg-gray-400',
  },
};

export default function StatusBadge({
  status,
  className,
}: {
  status: StepStatus;
  className?: string;
}) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        config.classes,
        className
      )}
    >
      <span className={cn('h-1.5 w-1.5 rounded-full', config.dot)} />
      {config.label}
    </span>
  );
}
