import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { callClaudeWithPdf } from '@/lib/anthropic';
import { getPdfBase64 } from '@/lib/pdf';
import { getProcessAnswersPrompt } from '@/lib/prompts';

export async function POST(req: NextRequest) {
  try {
    const { agreementId, answers, allClear } = await req.json();

    const agreement = await db.agreement.findUnique({ where: { id: agreementId } });
    if (!agreement) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const stepStatuses = JSON.parse(agreement.stepStatuses);

    if (allClear) {
      stepStatuses.step2 = 'done';
      await db.agreement.update({
        where: { id: agreementId },
        data: {
          allClear: true,
          status: 'answers_received',
          stepStatuses: JSON.stringify(stepStatuses),
        },
      });
      return NextResponse.json({ allClear: true });
    }

    const pdfBase64 = await getPdfBase64(agreement.filePath);
    const prompt = getProcessAnswersPrompt(answers);

    const result = await callClaudeWithPdf(prompt.system, prompt.user, pdfBase64);

    let parsed;
    try {
      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse AI response:', result);
      return NextResponse.json({ error: 'AI returned invalid response' }, { status: 500 });
    }

    stepStatuses.step2 = 'done';

    await db.agreement.update({
      where: { id: agreementId },
      data: {
        answers: JSON.stringify(answers),
        contractName: parsed.contractName || agreement.contractName,
        counterparty: parsed.counterparty || agreement.counterparty,
        contractSummary: parsed.contractSummary || agreement.contractSummary,
        contractAmount: parsed.contractAmount || agreement.contractAmount,
        contractPeriod: parsed.contractPeriod || agreement.contractPeriod,
        status: 'answers_received',
        stepStatuses: JSON.stringify(stepStatuses),
      },
    });

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Process answers error:', error);
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 });
  }
}
