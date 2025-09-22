import { Game, Session } from './types';

const NOTION_API_BASE = 'https://api.notion.com/v1';

export const getRecentGames = async (limit = 10): Promise<Game[]> => {
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_GAMES_DB;
  
  console.log('🔍 Fetching games from Notion API...');
  console.log('🔍 Database ID:', dbId);
  console.log('🔍 Token exists:', !!token);

  if (!token || !dbId) {
    throw new Error('Missing NOTION_TOKEN or NOTION_GAMES_DB environment variables');
  }

  try {
    // Exact format from Notion API docs
    const response = await fetch(`${NOTION_API_BASE}/databases/${dbId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Notion-Version': '2022-06-28',  // Critical version header
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filter: {
          property: 'role',
          select: {
            equals: 'JUNGLE'  // Exact case match from your schema
          }
        },
        sorts: [
          {
            property: 'game_date',
            direction: 'descending'
          }
        ],
        page_size: Math.min(limit, 100)  // Notion API limit
      })
    });

    // Detailed error handling per docs
    if (!response.ok) {
      const errorText = await response.text();
      const errorDetail = `HTTP ${response.status}: ${response.statusText}\n${errorText}`;
      console.error('❌ Notion API Error:', errorDetail);
      throw new Error(`Notion API Error: ${errorDetail}`);
    }

    const data = await response.json();
    console.log('✅ API Response:', {
      resultCount: data.results?.length,
      hasMore: data.has_more,
      nextCursor: data.next_cursor
    });

    // Parse response exactly as documented
    const games = data.results.map((page: any) => {
      const props = page.properties;
      
      // Extract data according to Notion property types
      const champion = props.champion?.rich_text?.[0]?.text?.content || 'Unknown';
      const resultValue = props.result?.select?.name;
      const result = resultValue === 'Win' ? 'WIN' : 'LOSS';  // Convert to your format
      const kda = props.kda?.rich_text?.[0]?.text?.content || '0/0/0';
      const deaths = parseInt(kda.split('/')[1] || '0');
      const gameDate = props.game_date?.date?.start || new Date().toISOString();

      console.log(`📊 Parsed game: ${champion} ${kda} ${result}`);

      return {
        id: page.id,
        champion,
        result,
        deaths,
        kda,
        game_date: gameDate
      } as Game;
    });

    console.log(`✅ Successfully parsed ${games.length} games`);
    return games;

  } catch (error) {
    console.error('❌ Fatal error in getRecentGames:', error);
    throw error;
  }
};

export const getCurrentSession = async (): Promise<Session | null> => {
  const token = process.env.NOTION_TOKEN;
  const dbId = process.env.NOTION_SESSIONS_DB;

  if (!token || !dbId) {
    console.log('Sessions database not configured, using fallback');
    // Return fallback session instead of null
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

    // Fallback if no active session found
    return {
      name: 'Death Binary Protocol',
      focus_area: 'Champion Mechanics',
      target_games: 10,
      start_date: '2025-09-22'
    };

  } catch (error) {
    console.error('Session API Error, using fallback:', error);
    
    // Always return fallback session instead of null
    return {
      name: 'Death Binary Protocol',
      focus_area: 'Champion Mechanics',
      target_games: 10,
      start_date: '2025-09-22'
    };
  }
};
