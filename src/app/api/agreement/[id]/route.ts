import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const agreement = await db.agreement.findUnique({ where: { id } });
    if (!agreement) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(agreement);
  } catch (error) {
    console.error('Fetch agreement error:', error);
    return NextResponse.json({ error: 'Failed to fetch agreement' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const agreement = await db.agreement.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(agreement);
  } catch (error) {
    console.error('Update agreement error:', error);
    return NextResponse.json({ error: 'Failed to update agreement' }, { status: 500 });
  }
}
