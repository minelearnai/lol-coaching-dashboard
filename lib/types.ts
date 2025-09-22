// lib/types.ts
export interface Game {
  id: string;
  champion: string;
  result: 'WIN' | 'LOSS';
  deaths: number;
  kda: string;
  game_date: string; // ✅ Consistent property name
}

export interface Session {
  name: string;
  focus_area: string;
  target_games: number;
  start_date: string;
}
