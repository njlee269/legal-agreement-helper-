import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { callClaudeWithPdf } from '@/lib/anthropic';
import { getPdfBase64 } from '@/lib/pdf';
import { getOpsMessagePrompt } from '@/lib/prompts';

export async function POST(req: NextRequest) {
  try {
    const {
      agreementId,
      counterpartyContact,
      counterpartyEmail,
      signingMethod,
      additionalContext,
      includeCoCEO,
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
      legalReview: agreement.legalReview,
    };

    const pdfBase64 = await getPdfBase64(agreement.filePath);
    const prompt = getOpsMessagePrompt(metadata, {
      counterpartyContact,
      counterpartyEmail,
      signingMethod,
      additionalContext,
      includeCoCEO,
    });

    const result = await callClaudeWithPdf(prompt.system, prompt.user, pdfBase64);

    const signerInfo = JSON.stringify({
      counterpartyContact,
      counterpartyEmail,
      signingMethod,
      additionalContext,
      includeCoCEO,
    });

    const stepStatuses = JSON.parse(agreement.stepStatuses);
    stepStatuses.step4 = 'done';

    await db.agreement.update({
      where: { id: agreementId },
      data: {
        opsMessage: result,
        signerInfo,
        status: 'ops_ready',
        stepStatuses: JSON.stringify(stepStatuses),
      },
    });

    return NextResponse.json({ opsMessage: result });
  } catch (error) {
    console.error('Ops message error:', error);
    return NextResponse.json({ error: 'Ops message generation failed' }, { status: 500 });
  }
}
