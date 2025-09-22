// Riot API Types and Interfaces

export interface RiotConfig {
  apiKey: string;
  region: string;
  requestOptions: {
    retriesBeforeAbort: number;
    delayBeforeRetry: number;
  };
}

export interface MatchData {
  metadata: {
    dataVersion: string;
    matchId: string;
    participants: string[];
  };
  info: {
    gameCreation: number;
    gameDuration: number;
    gameId: number;
    gameMode: string;
    gameStartTimestamp: number;
    gameType: string;
    gameVersion: string;
    mapId: number;
    participants: ParticipantData[];
    platformId: string;
    queueId: number;
    teams: TeamData[];
    tournamentCode?: string;
  };
}

export interface ParticipantData {
  assists: number;
  baronKills: number;
  champLevel: number;
  championId: number;
  championName: string;
  deaths: number;
  doubleKills: number;
  dragonKills: number;
  goldEarned: number;
  goldSpent: number;
  individualPosition: string;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  kills: number;
  lane: string;
  neutralMinionsKilled: number; // Jungle CS
  participantId: number;
  pentaKills: number;
  puuid: string;
  quadraKills: number;
  riotIdGameName: string;
  riotIdTagline: string;
  summoner1Id: number;
  summoner2Id: number;
  summonerId: string;
  summonerLevel: number;
  summonerName: string;
  teamId: number;
  teamPosition: string;
  totalDamageDealt: number;
  totalDamageDealtToChampions: number;
  totalDamageTaken: number;
  totalMinionsKilled: number;
  tripleKills: number;
  visionScore: number;
  wardsKilled: number;
  wardsPlaced: number;
  win: boolean;
  // Jungle specific metrics
  damageDealtToObjectives: number;
  damageDealtToTurrets: number;
}

export interface TeamData {
  bans: Array<{
    championId: number;
    pickTurn: number;
  }>;
  objectives: {
    baron: { first: boolean; kills: number };
    champion: { first: boolean; kills: number };
    dragon: { first: boolean; kills: number };
    inhibitor: { first: boolean; kills: number };
    riftHerald: { first: boolean; kills: number };
    tower: { first: boolean; kills: number };
  };
  teamId: number;
  win: boolean;
}

export interface SummonerData {
  accountId: string;
  profileIconId: number;
  revisionDate: number;
  name: string;
  id: string;
  puuid: string;
  summonerLevel: number;
}

export interface AccountData {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export interface JungleGameData {
  matchId: string;
  champion: string;
  result: 'WIN' | 'LOSS';
  kda: string;
  deaths: number;
  kills: number;
  assists: number;
  cs: number;
  jungleCS: number;
  gameDate: Date;
  gameDuration: number;
  visionScore: number;
  objectivesDamage: number;
  wardsPlaced: number;
  wardsKilled: number;
  goldEarned: number;
  teamPosition: string;
  gameVersion: string;
  queueId: number;
}

export interface CoachingInsight {
  type: 'success' | 'warning' | 'info' | 'error';
  category: 'positioning' | 'champion_mastery' | 'jungle_efficiency' | 'vision' | 'objectives';
  title: string;
  message: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
  data?: any;
}

export interface JungleKPIs {
  winrate: number;
  avgDeaths: number;
  protocolCompliance: number;
  jungleEfficiency: number;
  objectiveControl: number;
  visionDominance: number;
  earlyGameImpact: number;
  lateGameCarry: number;
}

export interface ChampionStats {
  champion: string;
  games: number;
  wins: number;
  losses: number;
  winrate: number;
  avgDeaths: number;
  avgKDA: number;
  avgCS: number;
  avgVisionScore: number;
}