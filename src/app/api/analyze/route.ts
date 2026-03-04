import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { callClaudeWithPdf } from '@/lib/anthropic';
import { getPdfBase64 } from '@/lib/pdf';
import { getAnalysisPrompt } from '@/lib/prompts';

export async function POST(req: NextRequest) {
  try {
    const { agreementId } = await req.json();

    const agreement = await db.agreement.findUnique({ where: { id: agreementId } });
    if (!agreement) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await db.agreement.update({
      where: { id: agreementId },
      data: { status: 'analyzing' },
    });

    const pdfBase64 = await getPdfBase64(agreement.filePath);
    const prompt = getAnalysisPrompt();

    const result = await callClaudeWithPdf(prompt.system, prompt.user, pdfBase64);

    let parsed;
    try {
      const cleaned = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error('Failed to parse AI response:', result);
      return NextResponse.json({ error: 'AI returned invalid response' }, { status: 500 });
    }

    const stepStatuses = JSON.parse(agreement.stepStatuses);
    stepStatuses.step1 = 'done';
    if (parsed.allClearRecommendation) {
      stepStatuses.step2 = 'done';
    }

    await db.agreement.update({
      where: { id: agreementId },
      data: {
        summary: JSON.stringify(parsed.summary),
        questions: JSON.stringify(parsed.questions),
        contractName: parsed.metadata?.contractName || null,
        counterparty: parsed.metadata?.counterparty || null,
        contractAmount: parsed.metadata?.contractAmount || null,
        contractPeriod: parsed.metadata?.contractPeriod || null,
        contractSummary: parsed.summary?.purpose || null,
        status: 'questions_generated',
        stepStatuses: JSON.stringify(stepStatuses),
      },
    });

    return NextResponse.json({
      summary: parsed.summary,
      questions: parsed.questions,
      metadata: parsed.metadata,
      allClearRecommendation: parsed.allClearRecommendation,
      allClearReason: parsed.allClearReason,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
