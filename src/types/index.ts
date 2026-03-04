export interface Agreement {
  id: string;
  fileName: string;
  filePath: string;
  uploadedAt: string;
  contractName: string | null;
  counterparty: string | null;
  contractSummary: string | null;
  contractAmount: string | null;
  contractPeriod: string | null;
  status: AgreementStatus;
  stepStatuses: StepStatuses;
  summary: AnalysisSummary | null;
  questions: Question[] | null;
  answers: QAPair[] | null;
  allClear: boolean;
  legalReview: string | null;
  includeVASPCheck: boolean;
  reviewNotes: string | null;
  reviewDeadline: string | null;
  documentLink: string | null;
  historyBackground: string | null;
  opsMessage: string | null;
  signerInfo: SignerInfo | null;
  updatedAt: string;
}

export type AgreementStatus =
  | 'uploaded'
  | 'analyzing'
  | 'questions_generated'
  | 'answers_received'
  | 'legal_review_ready'
  | 'ops_ready'
  | 'complete';

export type StepStatus = 'waiting' | 'in_progress' | 'hold' | 'done';

export interface StepStatuses {
  step1: StepStatus;
  step2: StepStatus;
  step3: StepStatus;
  step4: StepStatus;
}

export interface AnalysisSummary {
  title: string;
  type: string;
  purpose: string;
  riskScore: 'high' | 'medium' | 'low';
  whatItIs: string;
  whatTheyWant: string;
  whatWeCanLose: string;
  keyTerms: string[];
  legalRisks: LegalRisk[];
}

export interface LegalRisk {
  term: string;
  explanation: string;
  severity: 'high' | 'medium' | 'low';
}

export interface Question {
  category: string;
  question_ko: string;
  question_en: string;
  severity: 'high' | 'medium' | 'low';
  context: string;
}

export interface QAPair {
  question: string;
  answer: string;
}

export interface SignerInfo {
  counterpartyContact?: string;
  counterpartyEmail?: string;
  signingMethod?: string;
  additionalContext?: string;
  includeCoCEO?: boolean;
}

export function parseAgreement(raw: Record<string, unknown>): Agreement {
  return {
    ...raw,
    stepStatuses: typeof raw.stepStatuses === 'string'
      ? JSON.parse(raw.stepStatuses as string)
      : raw.stepStatuses,
    summary: raw.summary ? JSON.parse(raw.summary as string) : null,
    questions: raw.questions ? JSON.parse(raw.questions as string) : null,
    answers: raw.answers ? JSON.parse(raw.answers as string) : null,
    signerInfo: raw.signerInfo ? JSON.parse(raw.signerInfo as string) : null,
  } as Agreement;
}
