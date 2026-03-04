import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { step, status } = await req.json();

    const agreement = await db.agreement.findUnique({ where: { id } });
    if (!agreement) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const stepStatuses = JSON.parse(agreement.stepStatuses);
    stepStatuses[step] = status;

    const updated = await db.agreement.update({
      where: { id },
      data: { stepStatuses: JSON.stringify(stepStatuses) },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Status update error:', error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}
