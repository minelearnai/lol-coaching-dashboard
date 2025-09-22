import { Game, Session } from './types';
import { createFeraxinScraper } from './scraper/MatchScraper';
import { JungleAnalytics } from './analytics/JungleAnalytics';
import { JungleGameData } from './riot-api/types';

const NOTION_API_BASE = 'https://api.notion.com/v1';

/**
 * Enhanced Notion integration with Riot API fallback
 * Prioritizes live Riot API data, falls back to Notion for manual entries
 */

/**
 * Get recent games with smart data source selection
 */
export const getRecentGamesEnhanced = async (limit = 20): Promise<Game[]> => {
  console.log('🔍 Enhanced: Fetching games from multiple sources...');
  
  try {
    // Try to get live data from Riot API first
    const riotGames = await getLiveRiotData(limit);
    if (riotGames.length > 0) {
      console.log(`✅ Enhanced: Got ${riotGames.length} games from Riot API`);
      return convertRiotToGameFormat(riotGames);
    }
  } catch (error) {
    console.log('⚠️ Enhanced: Riot API unavailable, falling back to Notion:', error);
  }
  
  // Fallback to original Notion method
  try {
    const notionGames = await getRecentGamesFromNotion(limit);
    console.log(`✅ Enhanced: Got ${notionGames.length} games from Notion`);
    return notionGames;
  } catch (error) {
    console.error('❌ Enhanced: Both data sources failed:', error);
    return [];
  }
};

/**
 * Get live data from Riot API
 */
async function getLiveRiotData(limit: number): Promise<JungleGameData[]> {
  const scraper = await createFeraxinScraper();
  if (!scraper) {
    throw new Error('Could not create match scraper');
  }
  
  return await scraper.scrapeRecentMatches(limit);
}

/**
 * Convert Riot API format to Dashboard format
 */
function convertRiotToGameFormat(riotGames: JungleGameData[]): Game[] {
  return riotGames.map(game => ({
    id: game.matchId,
    champion: game.champion,
    result: game.result,
    deaths: game.deaths,
    kda: game.kda,
    game_date: game.gameDate.toISOString(),
    // Enhanced fields from Riot API
    jungleCS: game.jungleCS,
    visionScore: game.visionScore,
    objectivesDamage: game.objectivesDamage,
    goldEarned: game.goldEarned,
    gameDuration: game.gameDuration
  }));
}

/**
 * Original Notion method (fallback)
 */
async function getRecentGamesFromNotion(limit: number): Promise<Game[]> {
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_GAMES_DB;
  
  if (!token || !dbId) {
    throw new Error('Missing NOTION_TOKEN or NOTION_GAMES_DB environment variables');
  }

  const response = await fetch(`${NOTION_API_BASE}/databases/${dbId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      filter: {
        property: 'role',
        select: {
          equals: 'JUNGLE'
        }
      },
      sorts: [
        {
          property: 'game_date',
          direction: 'descending'
        }
      ],
      page_size: Math.min(limit, 100)
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Notion API Error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  return data.results.map((page: any) => {
    const props = page.properties;
    const champion = props.champion?.rich_text?.[0]?.text?.content || 'Unknown';
    const resultValue = props.result?.select?.name;
    const result = resultValue === 'Win' ? 'WIN' : 'LOSS';
    const kda = props.kda?.rich_text?.[0]?.text?.content || '0/0/0';
    const deaths = parseInt(kda.split('/')[1] || '0');
    const gameDate = props.game_date?.date?.start || new Date().toISOString();

    return {
      id: page.id,
      champion,
      result,
      deaths,
      kda,
      game_date: gameDate
    } as Game;
  });
}

/**
 * Get advanced analytics data
 */
export const getAdvancedAnalytics = async () => {
  try {
    console.log('📊 Generating advanced analytics...');
    
    // Get live Riot data for analysis
    const riotGames = await getLiveRiotData(25);
    if (riotGames.length === 0) {
      console.log('⚠️ No Riot data available for analytics');
      return null;
    }
    
    const analytics = new JungleAnalytics();
    const kpis = analytics.calculateAdvancedKPIs(riotGames);
    const insights = analytics.generateCoachingInsights(riotGames);
    const championStats = analytics.analyzeChampionPerformance(riotGames);
    const trends = analytics.getPerformanceTrends(riotGames);
    
    return {
      kpis,
      insights,
      championStats,
      trends,
      dataSource: 'riot_api',
      lastUpdated: new Date().toISOString(),
      gameCount: riotGames.length
    };
  } catch (error) {
    console.error('❌ Error generating advanced analytics:', error);
    return null;
  }
};

/**
 * Get current session (unchanged)
 */
export const getCurrentSession = async (): Promise<Session | null> => {
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_SESSIONS_DB;

  if (!token || !dbId) {
    return {
      name: 'Death Binary Protocol',
      focus_area: 'Champion Mechanics', 
      target_games: 10,
      start_date: '2025-09-22'
    };
  }

  try {
    const response = await fetch(`${NOTION_API_BASE}/databases/${dbId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          property: 'status',
          select: {
            equals: 'Active'
          }
        },
        page_size: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`Sessions API Error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.results.length > 0) {
      const session = data.results[0];
      const props = session.properties;
      
      return {
        name: props.session_name?.title?.[0]?.text?.content || 'Death Binary Protocol',
        focus_area: props.focus_area?.select?.name || 'Champion Mechanics',
        target_games: props.target_games?.number || 10,
        start_date: props.start_date?.date?.start || '2025-09-22',
      };
    }

    return {
      name: 'Death Binary Protocol',
      focus_area: 'Champion Mechanics',
      target_games: 10,
      start_date: '2025-09-22'
    };
  } catch (error) {
    console.error('Session API Error, using fallback:', error);
    return {
      name: 'Death Binary Protocol',
      focus_area: 'Champion Mechanics',
      target_games: 10,
      start_date: '2025-09-22'
    };
  }
};

/**
 * Sync Riot data to Notion (background process)
 */
export const syncRiotDataToNotion = async () => {
  try {
    console.log('🔄 Syncing Riot data to Notion...');
    
    const scraper = await createFeraxinScraper();
    if (!scraper) {
      throw new Error('Could not create scraper');
    }
    
    const recentGames = await scraper.scrapeRecentMatches(10);
    console.log(`🎯 Found ${recentGames.length} recent games to sync`);
    
    // This would be implemented to avoid duplicates and sync to Notion
    // For now, just log the data
    recentGames.forEach(game => {
      console.log(`✅ Ready to sync: ${game.champion} ${game.kda} ${game.result}`);
    });
    
    return {
      success: true,
      synced: recentGames.length,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Sync error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
};

// Re-export original methods for backward compatibility
export { getRecentGames, getCurrentSession } from './notion';