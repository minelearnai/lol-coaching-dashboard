import { getCurrentSession } from '@/lib/notion';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getCurrentSession();
    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}