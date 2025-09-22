import { NextRequest, NextResponse } from 'next/server';
import { createFeraxinScraper } from '@/lib/scraper/MatchScraper';
import { Client } from '@notionhq/client';
import { revalidateTag } from 'next/cache';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

/**
 * Webhook endpoint for automated match updates
 * POST /api/riot-webhook
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Riot webhook triggered');
    
    // Verify webhook secret for security
    const webhookSecret = request.headers.get('x-webhook-secret');
    if (webhookSecret !== process.env.WEBHOOK_SECRET) {
      console.log('❌ Invalid webhook secret');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, matchId, puuid } = body;

    if (action === 'match_completed' && matchId && puuid) {
      await handleMatchCompleted(matchId, puuid);
    } else if (action === 'refresh_recent') {
      await handleRefreshRecent();
    } else {
      console.log('⚠️ Unknown webhook action:', action);
      return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }

    // Trigger dashboard refresh
    revalidateTag('dashboard-data');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Handle new match completion
 */
async function handleMatchCompleted(matchId: string, puuid: string) {
  try {
    console.log(`🎯 Processing completed match: ${matchId}`);
    
    const scraper = await createFeraxinScraper();
    if (!scraper) {
      throw new Error('Could not create match scraper');
    }

    // Get match data
    const matchData = await scraper.scrapeMatch(matchId);
    if (!matchData) {
      console.log('⚠️ Match not found or not a jungle game, skipping');
      return;
    }

    console.log(`✅ Jungle match found: ${matchData.champion} ${matchData.kda} ${matchData.result}`);

    // Save to Notion database
    await saveMatchToNotion(matchData);
    
    console.log('✅ Match saved to Notion successfully');
  } catch (error) {
    console.error('❌ Error handling match completion:', error);
    throw error;
  }
}

/**
 * Handle refresh of recent games
 */
async function handleRefreshRecent() {
  try {
    console.log('🔄 Refreshing recent games...');
    
    const scraper = await createFeraxinScraper();
    if (!scraper) {
      throw new Error('Could not create match scraper');
    }

    // Get recent jungle games
    const recentGames = await scraper.scrapeRecentMatches(10);
    console.log(`🎯 Found ${recentGames.length} recent jungle games`);

    // Save each game to Notion (avoid duplicates)
    for (const game of recentGames) {
      try {
        await saveMatchToNotion(game, true); // Skip if exists
      } catch (error) {
        console.log(`⚠️ Skipping game ${game.matchId}:`, error);
      }
    }
    
    console.log('✅ Recent games refresh completed');
  } catch (error) {
    console.error('❌ Error refreshing recent games:', error);
    throw error;
  }
}

/**
 * Save match data to Notion database
 */
async function saveMatchToNotion(matchData: any, skipIfExists: boolean = false) {
  try {
    const gamesDbId = process.env.NOTION_GAMES_DB;
    if (!gamesDbId) {
      throw new Error('NOTION_GAMES_DB not configured');
    }

    // Check if match already exists (if skipIfExists is true)
    if (skipIfExists) {
      const existing = await notion.databases.query({
        database_id: gamesDbId,
        filter: {
          property: 'match_id',
          rich_text: {
            equals: matchData.matchId
          }
        },
        page_size: 1
      });

      if (existing.results.length > 0) {
        console.log(`⚠️ Match ${matchData.matchId} already exists, skipping`);
        return;
      }
    }

    // Create new page in Notion
    await notion.pages.create({
      parent: {
        database_id: gamesDbId
      },
      properties: {
        // Adjust property names to match your Notion database schema
        champion: {
          rich_text: [
            {
              text: {
                content: matchData.champion
              }
            }
          ]
        },
        result: {
          select: {
            name: matchData.result === 'WIN' ? 'Win' : 'Loss'
          }
        },
        kda: {
          rich_text: [
            {
              text: {
                content: matchData.kda
              }
            }
          ]
        },
        deaths: {
          number: matchData.deaths
        },
        game_date: {
          date: {
            start: matchData.gameDate.toISOString().split('T')[0]
          }
        },
        role: {
          select: {
            name: 'JUNGLE'
          }
        },
        match_id: {
          rich_text: [
            {
              text: {
                content: matchData.matchId
              }
            }
          ]
        },
        // Additional jungle-specific metrics
        jungle_cs: {
          number: matchData.jungleCS
        },
        vision_score: {
          number: matchData.visionScore
        },
        objectives_damage: {
          number: matchData.objectivesDamage
        },
        gold_earned: {
          number: matchData.goldEarned
        },
        game_duration: {
          number: Math.floor(matchData.gameDuration / 60000) // Convert to minutes
        }
      }
    });

    console.log(`✅ Saved ${matchData.champion} ${matchData.result} to Notion`);
  } catch (error) {
    console.error('❌ Error saving to Notion:', error);
    throw error;
  }
}

/**
 * Manual refresh endpoint
 * GET /api/riot-webhook?action=refresh
 */
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const action = url.searchParams.get('action');
    
    if (action === 'refresh') {
      await handleRefreshRecent();
      revalidateTag('dashboard-data');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Manual refresh completed',
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({ 
      message: 'Riot API Webhook Endpoint',
      availableActions: ['match_completed', 'refresh_recent'],
      usage: {
        POST: 'Send webhook with action and data',
        GET: 'Manual refresh with ?action=refresh'
      }
    });
  } catch (error) {
    console.error('❌ GET webhook error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}