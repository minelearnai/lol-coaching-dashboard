import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const gameData = await request.json();
  const deaths = gameData.deaths;
  const champion = gameData.champion;
  
  // Instant coaching feedback
  const alerts = [];
  
  if (deaths > 10) {
    alerts.push({
      type: 'critical',
      message: `🚨 CRITICAL: ${deaths} deaths on ${champion}! Review replay immediately.`,
      action: 'Focus on positioning and map awareness'
    });
  }
  
  if (champion === 'Karthus') {
    alerts.push({
      type: 'warning', 
      message: `⚠️ Experimental pick detected: ${champion}`,
      action: 'Return to Kindred/Briar for consistency'
    });
  }
  
  if (deaths <= 3) {
    alerts.push({
      type: 'success',
      message: `✅ Excellent death control: ${deaths} deaths!`,
      action: 'Maintain this level of positioning'
    });
  }
  
  return NextResponse.json({ alerts });
}