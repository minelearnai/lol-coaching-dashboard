import { Game } from './types';

const NOTION_API_BASE = 'https://api.notion.com/v1';

export const getRecentGames = async (limit = 10): Promise<Game[]> => {
  console.log('🔍 Attempting to fetch games from Notion API...');
  
  if (!process.env.NOTION_TOKEN) {
    console.error('❌ NOTION_TOKEN missing in environment variables');
    throw new Error('Notion token not configured');
  }
  
  if (!process.env.NOTION_GAMES_DB) {
    console.error('❌ NOTION_GAMES_DB missing in environment variables');
    throw new Error('Games database ID not configured');
  }

  try {
    console.log('🔍 Making direct API call to Notion...');
    console.log('🔍 Database ID:', process.env.NOTION_GAMES_DB);
    
    const response = await fetch(`${NOTION_API_BASE}/databases/${process.env.NOTION_GAMES_DB}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
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
            direction: 'descending',
          },
        ],
        page_size: limit,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Notion API HTTP Error:', response.status, errorText);
      throw new Error(`Notion API Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Notion API response received:', data.results?.length, 'games');
    
    const games = data.results.map((page: any) => {
      const props = page.properties;
      
      // Debug logging
      console.log('📊 Processing game:', {
        champion: props.champion?.rich_text?.[0]?.text?.content,
        result: props.result?.select?.name,
        kda: props.kda?.rich_text?.[0]?.text?.content
      });
      
      return {
        id: page.id,
        champion: props.champion?.rich_text?.[0]?.text?.content || 'Unknown',
        result: (props.result?.select?.name as 'WIN' | 'LOSS') || 'LOSS',
        deaths: parseInt(props.kda?.rich_text?.[0]?.text?.content?.split('/')[1]) || 0,
        kda: props.kda?.rich_text?.[0]?.text?.content || '0/0/0',
        game_date: props.game_date?.date?.start || new Date().toISOString()
      };
    });

    console.log('✅ Successfully processed', games.length, 'games from Notion');
    return games;

  } catch (error) {
    console.error('❌ Fatal Notion API Error:', error);
    throw error; // Re-throw to force handling upstream
  }
};

export const getCurrentSession = async () => {
  if (!process.env.NOTION_TOKEN || !process.env.NOTION_SESSIONS_DB) {
    console.error('❌ Session API credentials missing');
    throw new Error('Session database not configured');
  }

  try {
    const response = await fetch(`${NOTION_API_BASE}/databases/${process.env.NOTION_SESSIONS_DB}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.NOTION_TOKEN}`,
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
      throw new Error(`Session API Error: ${response.status}`);
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
    return null;

  } catch (error) {
    console.error('❌ Session API Error:', error);
    throw error;
  }
};
