import { Client } from '@notionhq/client';
import { Game } from './types';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const GAMES_DB_ID = process.env.NOTION_GAMES_DB!;
const SESSIONS_DB_ID = process.env.NOTION_SESSIONS_DB!;

export const getRecentGames = async (limit = 10): Promise<Game[]> => {
  try {
    // @ts-ignore - Notion SDK types issue
    const response = await notion.databases.query({
      database_id: GAMES_DB_ID,
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
    });
    
    // @ts-ignore - Notion response typing
    return response.results.map((page: any) => {
      const props = page.properties;
      return {
        id: page.id,
        champion: props.champion?.rich_text?.[0]?.text?.content || 'Unknown',
        result: props.result?.select?.name as 'WIN' | 'LOSS' || 'LOSS',
        deaths: parseInt(props.kda?.rich_text?.[0]?.text?.content?.split('/')[1]) || 0,
        kda: props.kda?.rich_text?.[0]?.text?.content || '0/0/0',
        game_date: props.game_date?.date?.start || new Date().toISOString()
      };
    });
    
  } catch (error) {
    console.error('Notion API Error - using fallback data:', error);
    // 🔥 FALLBACK TO YOUR ACTUAL RECENT GAMES
    return [
      {
        id: 'recent-1',
        champion: 'Kindred',
        result: 'WIN',
        deaths: 5,
        kda: '9/5/10',
        game_date: '2025-09-22T04:10:00'
      },
      {
        id: 'recent-2',
        champion: 'Karthus',
        result: 'LOSS',
        deaths: 17,
        kda: '9/17/2',
        game_date: '2025-09-22T03:28:00'
      },
      {
        id: 'recent-3',
        champion: 'Briar',
        result: 'WIN',
        deaths: 3,
        kda: '7/3/15',
        game_date: '2025-09-22T02:48:00'
      }
    ];
  }
};

export const getCurrentSession = async () => {
  try {
    // @ts-ignore - Notion SDK types issue
    const response = await notion.databases.query({
      database_id: SESSIONS_DB_ID,
      filter: {
        property: 'status',
        select: {
          equals: 'Active'
        }
      },
      page_size: 1,
    });
    
    // @ts-ignore - Notion response typing
    if (response.results.length > 0) {
      const session = response.results[0];
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
    console.error('Session API Error - using fallback:', error);
    return {
      name: 'Death Binary Protocol',
      focus_area: 'Champion Mechanics', 
      target_games: 10,
      start_date: '2025-09-22'
    };
  }
};
