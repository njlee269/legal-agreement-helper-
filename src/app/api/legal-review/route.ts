import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { callClaudeWithPdf } from '@/lib/anthropic';
import { getPdfBase64 } from '@/lib/pdf';
import { getLegalReviewPrompt } from '@/lib/prompts';

export async function POST(req: NextRequest) {
  try {
    const {
      agreementId,
      includeVASPCheck,
      reviewNotes,
      reviewDeadline,
      documentLink,
      historyBackground,
    } = await req.json();

    const agreement = await db.agreement.findUnique({ where: { id: agreementId } });
    if (!agreement) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const metadata = {
      contractName: agreement.contractName,
      counterparty: agreement.counterparty,
      contractSummary: agreement.contractSummary,
      contractAmount: agreement.contractAmount,
      contractPeriod: agreement.contractPeriod,
    };

    const pdfBase64 = await getPdfBase64(agreement.filePath);
    const prompt = getLegalReviewPrompt(metadata, {
      includeVASPCheck,
      reviewNotes,
      reviewDeadline,
      documentLink,
      historyBackground,
    });

    const result = await callClaudeWithPdf(prompt.system, prompt.user, pdfBase64);

    const stepStatuses = JSON.parse(agreement.stepStatuses);
    stepStatuses.step3 = 'done';

    await db.agreement.update({
      where: { id: agreementId },
      data: {
        legalReview: result,
        includeVASPCheck: includeVASPCheck || false,
        reviewNotes: reviewNotes || null,
        reviewDeadline: reviewDeadline || null,
        documentLink: documentLink || null,
        historyBackground: historyBackground || null,
        status: 'legal_review_ready',
        stepStatuses: JSON.stringify(stepStatuses),
      },
    });

    return NextResponse.json({ legalReview: result });
  } catch (error) {
    console.error('Legal review error:', error);
    return NextResponse.json({ error: 'Legal review generation failed' }, { status: 500 });
  }
}
