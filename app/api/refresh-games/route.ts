import { NextRequest } from 'next/server';
import { Game } from '@/lib/types';

const RIOT_API_BASE = 'https://eun1.api.riotgames.com';
const RIOT_ACCOUNT_BASE = 'https://europe.api.riotgames.com';
const NOTION_API_BASE = 'https://api.notion.com/v1'; // ✅ ADDED MISSING CONSTANT

interface RiotMatch {
  metadata: {
    matchId: string;
  };
  info: {
    gameCreation: number;
    gameDuration: number;
    participants: RiotParticipant[];
  };
}

// ✅ UPDATED with correct property names from Riot API
interface RiotParticipant {
  puuid: string;
  summonerName: string;
  championName: string;
  teamPosition: string;        // ✅ ADDED
  individualPosition: string;  // ✅ ADDED
  role: string;
  lane: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
}

interface NotionGame {
  match_id: string;
  champion: string;
  result: 'WIN' | 'LOSS';
  deaths: number;
  kda: string;
  game_date: string;
}

// Helper function to fetch recent games from Riot API
async function fetchRiotRecentGames(): Promise<NotionGame[]> {
  const riotApiKey = process.env.RIOT_API_KEY;
  const gameName = 'Feraxin';
  const tagLine = 'EUNE';
  
  if (!riotApiKey) {
    throw new Error('RIOT_API_KEY not found in environment variables');
  }

  try {
    // ✅ STEP 1: Get PUUID using NEW Riot ID endpoint
    console.log(`🔍 Getting PUUID for ${gameName}#${tagLine}...`);
    const accountResponse = await fetch(
      `${RIOT_ACCOUNT_BASE}/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${riotApiKey}`
    );
    
    if (!accountResponse.ok) {
      throw new Error(`Account API error: ${accountResponse.status} - ${await accountResponse.text()}`);
    }
    
    const accountData = await accountResponse.json();
    const puuid = accountData.puuid;
    console.log(`✅ Found PUUID: ${puuid.substring(0, 10)}...`);

    // ✅ STEP 2: Get recent match IDs
    const matchListResponse = await fetch(
      `${RIOT_API_BASE}/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&type=ranked&start=0&count=10&api_key=${riotApiKey}`
    );
    
    if (!matchListResponse.ok) {
      throw new Error(`Match list API error: ${matchListResponse.status} - ${await matchListResponse.text()}`);
    }
    
    const matchIds: string[] = await matchListResponse.json();
    console.log(`✅ Found ${matchIds.length} recent matches`);

    // ✅ STEP 3: Process each match
    const games: NotionGame[] = [];
    
    for (const matchId of matchIds) {
      try {
        console.log(`🔍 Processing match: ${matchId}`);
        
        const matchResponse = await fetch(
          `${RIOT_API_BASE}/lol/match/v5/matches/${matchId}?api_key=${riotApiKey}`
        );
        
        if (!matchResponse.ok) {
          console.warn(`Failed to fetch match ${matchId}: ${matchResponse.status}`);
          continue;
        }
        
        const matchData: RiotMatch = await matchResponse.json();
        
        // Find player's participant data
        const participant = matchData.info.participants.find(
          (p: RiotParticipant) => p.puuid === puuid
        );
        
        if (!participant) {
          console.warn(`Player not found in match ${matchId}`);
          continue;
        }

        // ✅ FIXED: Proper jungle detection with correct property names
        const isJungle = participant.teamPosition === 'JUNGLE' || 
                        participant.individualPosition === 'JUNGLE' ||
                        (participant.role === 'NONE' && participant.lane === 'JUNGLE') ||
                        participant.lane === 'JUNGLE';

        if (!isJungle) {
          console.log(`Skipping non-jungle game: ${participant.teamPosition || participant.role}/${participant.lane}`);
          continue;
        }

        // Convert to Notion format
        const game: NotionGame = {
          match_id: matchId,
          champion: participant.championName,
          result: participant.win ? 'WIN' : 'LOSS',
          deaths: participant.deaths,
          kda: `${participant.kills}/${participant.deaths}/${participant.assists}`,
          game_date: new Date(matchData.info.gameCreation).toISOString().split('T')[0]
        };

        games.push(game);
        console.log(`✅ Added jungle game: ${game.champion} ${game.kda} ${game.result}`);

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 120));

      } catch (error) {
        console.error(`Error processing match ${matchId}:`, error);
        continue;
      }
    }

    console.log(`🎯 Final result: ${games.length} jungle games found`);
    return games;

  } catch (error) {
    console.error('❌ Error fetching Riot games:', error);
    throw error;
  }
}

// Helper function to get existing games from Notion
async function getExistingGames(): Promise<NotionGame[]> {
  const notionToken = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_GAMES_DB;
  
  if (!notionToken || !dbId) {
    throw new Error('Missing Notion environment variables');
  }

  try {
    const response = await fetch(`${NOTION_API_BASE}/databases/${dbId}/query`, {
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

    if (!response.ok) {
      throw new Error(`Notion API error: ${response.status}`);
    }

    const data = await response.json();
    
    return data.results.map((page: any) => ({
      match_id: page.properties.match_id?.title?.[0]?.text?.content || '',
      champion: page.properties.champion?.rich_text?.[0]?.text?.content || '',
      result: page.properties.result?.select?.name === 'Win' ? 'WIN' : 'LOSS',
      deaths: parseInt(page.properties.kda?.rich_text?.[0]?.text?.content?.split('/')[1] || '0'),
      kda: page.properties.kda?.rich_text?.[0]?.text?.content || '',
      game_date: page.properties.game_date?.date?.start || ''
    })) as NotionGame[];

  } catch (error) {
    console.error('Error fetching existing games from Notion:', error);
    throw error;
  }
}

// Helper function to add a game to Notion
async function addGameToNotion(game: NotionGame): Promise<void> {
  const notionToken = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_GAMES_DB;
  
  if (!notionToken || !dbId) {
    throw new Error('Missing Notion environment variables');
  }

  try {
    const response = await fetch(`${NOTION_API_BASE}/pages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: dbId },
        properties: {
          match_id: {
            title: [{ text: { content: game.match_id } }]
          },
          champion: {
            rich_text: [{ text: { content: game.champion } }]
          },
          result: {
            select: { name: game.result === 'WIN' ? 'Win' : 'Loss' }
          },
          kda: {
            rich_text: [{ text: { content: game.kda } }]
          },
          role: {
            select: { name: 'JUNGLE' }
          },
          game_date: {
            date: { start: game.game_date }
          },
          analyzed: {
            checkbox: false
          },
          session: {
            rich_text: [{ text: { content: 'Auto-sync' } }]
          }
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to add game to Notion: ${response.status} - ${errorText}`);
    }

  } catch (error) {
    console.error(`Error adding game ${game.match_id} to Notion:`, error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      const sendUpdate = (data: any) => {
        const chunk = encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
        controller.enqueue(chunk);
      };

      (async () => {
        try {
          // Step 1: Fetch from Riot API
          sendUpdate({
            status: 'fetching',
            progress: 20,
            message: 'Getting recent matches from Riot API...'
          });

          const riotGames = await fetchRiotRecentGames();
          
          sendUpdate({
            status: 'processing',
            progress: 40,
            message: 'Processing match data...',
            gamesFound: riotGames.length
          });

          // Step 2: Check which are new
          const existingGames = await getExistingGames();
          const newGames = riotGames.filter((game: NotionGame) => 
            !existingGames.some((existing: NotionGame) => existing.match_id === game.match_id)
          );

          sendUpdate({
            status: 'processing', 
            progress: 60,
            message: `Found ${newGames.length} new games to add...`,
            gamesFound: riotGames.length
          });

          // Step 3: Add new games to Notion
          let addedCount = 0;
          for (const game of newGames) {
            await addGameToNotion(game);
            addedCount++;
            
            sendUpdate({
              status: 'processing',
              progress: 60 + (addedCount / newGames.length) * 35,
              message: `Adding games to database... (${addedCount}/${newGames.length})`,
              gamesFound: riotGames.length,
              gamesAdded: addedCount
            });

            // Rate limiting
            await new Promise(resolve => setTimeout(resolve, 200));
          }

          // Step 4: Success
          sendUpdate({
            status: 'success',
            progress: 100,
            message: `✅ Successfully added ${addedCount} new games!`,
            gamesFound: riotGames.length,
            gamesAdded: addedCount
          });

        } catch (error) {
          sendUpdate({
            status: 'error',
            progress: 0,
            message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
        }

        controller.close();
      })();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

export async function GET() {
  return Response.json({
    message: 'Riot API Game Refresh Endpoint',
    usage: 'POST to this endpoint to fetch new games from Riot API and sync to Notion',
    requirements: ['RIOT_API_KEY', 'NOTION_TOKEN', 'NOTION_GAMES_DB'],
    version: '2.0 - Fixed with Riot ID migration'
  });
}
