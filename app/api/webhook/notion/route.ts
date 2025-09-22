import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// 🎮 DISCORD INTEGRATION - WKLEJ TUTAJ
async function sendDiscordAlert(message: string) {
  if (process.env.DISCORD_WEBHOOK_URL) {
    await fetch(process.env.DISCORD_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: `🎮 **LoL Coach Alert**\n${message}`
      })
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Notion verification
    if (body.type === 'url_verification') {
      return NextResponse.json({ challenge: body.challenge });
    }
    
    // Game data webhook
    if (body.type === 'page' && body.event === 'updated') {
      // Extract game data
      const props = body.properties;
      const champion = props?.champion?.rich_text?.[0]?.text?.content;
      const kda = props?.kda?.rich_text?.[0]?.text?.content;
      const result = props?.result?.select?.name;
      const deaths = parseInt(kda?.split('/')[1] || '0');
      
      // 🚨 DISCORD ALERTS - UŻYJ FUNKCJI TUTAJ
      if (deaths > 10) {
        await sendDiscordAlert(`🚨 CRITICAL: ${deaths} deaths on ${champion}! Protocol violation detected.`);
      }
      
      if (champion === 'Karthus' || champion === 'Nocturne') {
        await sendDiscordAlert(`⚠️ WARNING: Experimental pick ${champion} detected. Return to Kindred/Briar.`);
      }
      
      if (deaths <= 3 && result === 'WIN') {
        await sendDiscordAlert(`✅ EXCELLENT: ${champion} ${kda} WIN with perfect death control!`);
      }
      
      // Refresh dashboard
      revalidatePath('/');
      
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'Webhook ready with Discord alerts' });
}
