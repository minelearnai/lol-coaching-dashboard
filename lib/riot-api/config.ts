import { RiotConfig } from './types';

// Riot API Configuration
export const RIOT_CONFIG: RiotConfig = {
  apiKey: process.env.RIOT_API_KEY || '',
  region: 'eun1', // EUNE for Feraxin
  requestOptions: {
    retriesBeforeAbort: 3,
    delayBeforeRetry: 1000,
  },
};

// Regional mappings for different API endpoints
export const REGIONAL_ENDPOINTS = {
  // Platform endpoints (for summoner, league data)
  eun1: 'eun1.api.riotgames.com',
  euw1: 'euw1.api.riotgames.com',
  na1: 'na1.api.riotgames.com',
  // Regional endpoints (for match data)
  europe: 'europe.api.riotgames.com',
  americas: 'americas.api.riotgames.com',
  asia: 'asia.api.riotgames.com',
};

// Get regional endpoint for match API
export function getRegionalEndpoint(platform: string): string {
  switch (platform) {
    case 'eun1':
    case 'euw1':
      return REGIONAL_ENDPOINTS.europe;
    case 'na1':
      return REGIONAL_ENDPOINTS.americas;
    default:
      return REGIONAL_ENDPOINTS.europe;
  }
}

// Queue IDs for different game modes
export const QUEUE_IDS = {
  RANKED_SOLO: 420,
  RANKED_FLEX: 440,
  NORMAL_DRAFT: 400,
  NORMAL_BLIND: 430,
  ARAM: 450,
} as const;

// Cache durations in seconds
export const CACHE_DURATIONS = {
  SUMMONER: 3600, // 1 hour
  MATCH: 1800, // 30 minutes
  MATCH_HISTORY: 300, // 5 minutes
  RANK: 600, // 10 minutes
} as const;