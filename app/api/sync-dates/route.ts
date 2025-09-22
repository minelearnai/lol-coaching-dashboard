import { NextRequest, NextResponse } from 'next/server';

const RIOT_API_BASE = 'https://eun1.api.riotgames.com';
const NOTION_API_BASE = 'https://api.notion.com/v1';

export async function POST() {
  console.log('🔄 Starting Riot API date sync...');
  
  const riotKey = process.env.RIOT_API_KEY;
  const notionToken = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_GAMES_DB;
  
  if (!riotKey || !notionToken || !dbId) {
    return NextResponse.json({ 
      error: 'Missing API keys - need RIOT_API_KEY, NOTION_TOKEN, NOTION_GAMES_DB' 
    }, { status: 400 });
  }

  try {
    // 1. GET ALL GAMES FROM NOTION
    console.log('📊 Fetching games from Notion...');
    const notionResponse = await fetch(`${NOTION_API_BASE}/databases/${dbId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          property: 'role',
          select: { equals: 'JUNGLE' }
        },
        page_size: 100
      })
    });

    const notionData = await notionResponse.json();
    console.log(`✅ Found ${notionData.results.length} games in Notion`);

    const results = [];
    let updated = 0;
    let errors = 0;

    // 2. FOR EACH GAME, GET REAL DATE FROM RIOT API
    for (const page of notionData.results) {
      const props = page.properties;
      const matchId = props.match_id?.title?.[0]?.text?.content;
      const currentDate = props.game_date?.date?.start;
      
      if (!matchId) {
        console.log('⚠️ Skipping page without match_id');
        continue;
      }

      // Skip if already has date
      if (currentDate) {
        console.log(`✅ ${matchId} already has date: ${currentDate}`);
        results.push({ matchId, status: 'Already has date', date: currentDate });
        continue;
      }

      console.log(`🔍 Fetching date for ${matchId} from Riot API...`);

      try {
        // 3. CALL RIOT API MATCH-V5
        const riotResponse = await fetch(
          `${RIOT_API_BASE}/lol/match/v5/matches/${matchId}?api_key=${riotKey}`
        );

        if (!riotResponse.ok) {
          console.log(`❌ Riot API error for ${matchId}: ${riotResponse.status}`);
          results.push({ matchId, status: 'Riot API error', code: riotResponse.status });
          errors++;
          continue;
        }

        const matchData = await riotResponse.json();
        
        // Extract game creation timestamp (Unix timestamp in milliseconds)
        const gameCreation = matchData.info.gameCreation;
        const gameDate = new Date(gameCreation).toISOString().split('T')[0]; // YYYY-MM-DD format
        
        console.log(`📅 ${matchId} game date: ${gameDate}`);

        // 4. UPDATE NOTION WITH REAL DATE
        const updateResponse = await fetch(`${NOTION_API_BASE}/pages/${page.id}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${notionToken}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            properties: {
              game_date: {
                date: { start: gameDate }
              }
            }
          })
        });

        if (updateResponse.ok) {
          console.log(`✅ Updated ${matchId} with date ${gameDate}`);
          results.push({ matchId, status: 'Updated', date: gameDate });
          updated++;
        } else {
          console.log(`❌ Failed to update ${matchId} in Notion`);
          results.push({ matchId, status: 'Notion update failed' });
          errors++;
        }

        // Rate limiting - don't spam Riot API
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`❌ Error processing ${matchId}:`, error);
        results.push({ matchId, status: 'Processing error' });
        errors++;
      }
    }

    console.log(`🏁 Sync complete: ${updated} updated, ${errors} errors`);

    return NextResponse.json({
      success: true,
      summary: {
        total: notionData.results.length,
        updated,
        errors,
        details: results
      }
    });

  } catch (error) {
    console.error('❌ Sync failed:', error);
    return NextResponse.json({
      error: 'Sync failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Riot API Date Sync Endpoint',
    usage: 'POST to this endpoint to sync game dates from Riot API to Notion',
    requirements: ['RIOT_API_KEY', 'NOTION_TOKEN', 'NOTION_GAMES_DB']
  });
}
