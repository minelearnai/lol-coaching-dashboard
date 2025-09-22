import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    // Revalidate homepage to fetch fresh data
    revalidatePath('/');
    
    console.log('✅ Dashboard revalidated manually');
    
    return NextResponse.json({ 
      revalidated: true, 
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Revalidation failed:', error);
    return NextResponse.json(
      { error: 'Revalidation failed' }, 
      { status: 500 }
    );
  }
}
