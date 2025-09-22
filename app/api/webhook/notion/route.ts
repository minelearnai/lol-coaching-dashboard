import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

// 🎮 DISCORD INTEGRATION
async function sendDiscordAlert(message: string) {
  if (process.env.DISCORD_WEBHOOK_URL) {
    try {
      await fetch(process.env.DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: `🎮 **LoL Coach Alert**\n${message}`
        })
      });
      console.log('✅ Discord alert sent:', message);
    } catch (error) {
      console.error('❌ Discord alert failed:', error);
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 🔍 DETAILED LOGGING FOR TOKEN DEBUG
    console.log('📨 === WEBHOOK REQUEST RECEIVED ===');
    console.log('📨 Full request body:', JSON.stringify(body, null, 2));
    console.log('📨 Body type:', body.type);
    console.log('📨 Body challenge:', body.challenge);
    console.log('📨 Body event:', body.event);
    console.log('📨 Request timestamp:', new Date().toISOString());
    
    // 🎯 NOTION VERIFICATION TOKEN CAPTURE
    if (body.type === 'url_verification') {
      const token = body.challenge;
      console.log('🎯🎯🎯 VERIFICATION TOKEN FOUND:', token);
      console.log('🎯🎯🎯 TOKEN LENGTH:', token?.length);
      console.log('🎯🎯🎯 TOKEN PREVIEW:', token?.substring(0, 20) + '...');
      console.log('🎯🎯🎯 COPY THIS EXACT TOKEN:', token);
      
      return NextResponse.json({ 
        challenge: token,
        status: 'Token received and returned successfully',
        token_info: {
          received: true,
          length: token?.length,
          preview: token?.substring(0, 10) + '...'
        }
      });
    }
    
    // 🎮 GAME DATA WEBHOOK PROCESSING  
    if (body.type === 'page' && body.event === 'updated') {
      console.log('🎮 Game update received from Notion');
      
      // Extract game data
      const props = body.properties;
      const champion = props?.champion?.rich_text?.[0]?.text?.content;
      const kda = props?.kda?.rich_text?.[0]?.text?.content;
      const result = props?.result?.select?.name;
      const deaths = parseInt(kda?.split('/')[1] || '0');
      
      console.log(`🎮 Game data: ${champion} ${kda} ${result} (${deaths} deaths)`);
      
      // 🚨 SMART COACHING ALERTS
      if (deaths > 10) {
        const alertMessage = `🚨 CRITICAL: ${deaths} deaths on ${champion}! Protocol violation detected.`;
        await sendDiscordAlert(alertMessage);
        console.log('🚨 Critical alert sent:', alertMessage);
      }
      
      if (champion === 'Karthus' || champion === 'Nocturne') {
        const alertMessage = `⚠️ WARNING: Experimental pick ${champion} detected. Return to Kindred/Briar.`;
        await sendDiscordAlert(alertMessage);
        console.log('⚠️ Experimental pick alert sent:', alertMessage);
      }
      
      if (deaths <= 3 && result === 'WIN') {
        const alertMessage = `✅ EXCELLENT: ${champion} ${kda} WIN with perfect death control!`;
        await sendDiscordAlert(alertMessage);
        console.log('✅ Success alert sent:', alertMessage);
      }
      
      // Auto-refresh dashboard with new game data
      revalidatePath('/');
      console.log('🔄 Dashboard revalidated with new game data');
      
      return NextResponse.json({ 
        success: true,
        game_processed: {
          champion,
          kda,
          result,
          deaths,
          alerts_sent: deaths > 10 || ['Karthus', 'Nocturne'].includes(champion) || (deaths <= 3 && result === 'WIN')
        }
      });
    }
    
    // Handle other webhook types
    console.log('📨 Other webhook type received:', body.type);
    return NextResponse.json({ success: true, type: body.type });
    
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    console.error('❌ Error stack:', error.stack);
    return NextResponse.json({ 
      error: 'Webhook processing failed',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ 
    status: 'Notion webhook endpoint ready',
    features: [
      '🎯 Verification token capture with detailed logging',
      '🎮 Game data processing with smart coaching alerts', 
      '📱 Discord integration for real-time notifications',
      '🔄 Automatic dashboard refresh on new games'
    ],
    endpoint: '/api/webhook/notion',
    timestamp: new Date().toISOString()
  });
}
