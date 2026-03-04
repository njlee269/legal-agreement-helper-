import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const agreements = await db.agreement.findMany({
      orderBy: { uploadedAt: 'desc' },
    });
    return NextResponse.json(agreements);
  } catch (error) {
    console.error('Fetch agreements error:', error);
    return NextResponse.json({ error: 'Failed to fetch agreements' }, { status: 500 });
  }
}
