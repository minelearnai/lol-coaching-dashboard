import { getRecentGames } from '@/lib/notion';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const games = await getRecentGames(20);
    return NextResponse.json(games);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch games' },
      { status: 500 }
    );
  }
}