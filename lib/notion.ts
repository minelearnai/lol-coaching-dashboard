import { Client } from '@notionhq/client';

const notion = new Client({
  auth: process.env.NOTION_TOKEN,
});

const GAMES_DB_ID = process.env.NOTION_GAMES_DB!;
const SESSIONS_DB_ID = process.env.NOTION_SESSIONS_DB!;

export const getRecentGames = async (limit = 10) => {
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
  
  return response.results.map(page => ({
    id: page.id,
    // @ts-ignore
    match_id: page.properties.match_id?.title?.[0]?.text?.content || '',
    // @ts-ignore  
    champion: page.properties.champion?.rich_text?.[0]?.text?.content || '',
    // @ts-ignore
    result: page.properties.result?.select?.name || '',
    // @ts-ignore
    kda: page.properties.kda?.rich_text?.[0]?.text?.content || '',
    // @ts-ignore
    deaths: parseInt(page.properties.kda?.rich_text?.[0]?.text?.content?.split('/')[1] || '0'),
    // @ts-ignore
    duration: page.properties.duration_minutes?.number || 0,
    // @ts-ignore
    game_date: page.properties.game_date?.date?.start || '',
  }));
};

export const getCurrentSession = async () => {
  const response = await notion.databases.query({
    database_id: SESSIONS_DB_ID,
    filter: {
      property: 'status',
      select: {
        equals: 'Active'
      }
    },
    sorts: [
      {
        property: 'start_date',
        direction: 'descending',
      },
    ],
    page_size: 1,
  });
  
  if (response.results.length > 0) {
    const session = response.results[0];
    return {
      // @ts-ignore
      name: session.properties.session_name?.title?.[0]?.text?.content || '',
      // @ts-ignore
      focus_area: session.properties.focus_area?.select?.name || '',
      // @ts-ignore
      target_games: session.properties.target_games?.number || 0,
      // @ts-ignore
      start_date: session.properties.start_date?.date?.start || '',
    };
  }
  
  return null;
};
