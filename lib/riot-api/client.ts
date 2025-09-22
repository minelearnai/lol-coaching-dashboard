import { RiotRateLimiter, STRATEGY } from '@fightmegg/riot-rate-limiter';
import { RIOT_CONFIG, REGIONAL_ENDPOINTS, getRegionalEndpoint, CACHE_DURATIONS } from './config';
import { cache } from './cache';
import { MatchData, SummonerData, AccountData, RiotConfig } from './types';
import axios, { AxiosRequestConfig } from 'axios';

/**
 * Professional Riot API Client inspired by LeagueStats
 * Features: Rate limiting, caching, retry logic, error handling
 */
export class RiotClient {
  private limiter: RiotRateLimiter;
  private config: RiotConfig;

  constructor(config: RiotConfig = RIOT_CONFIG) {
    this.config = config;
    
    // Initialize rate limiter with spread strategy
    this.limiter = new RiotRateLimiter({
      strategy: STRATEGY.SPREAD,
    });

    console.log('✅ RiotClient initialized with rate limiting');
  }

  /**
   * Make authenticated request with caching and rate limiting
   */
  private async makeRequest<T>(url: string, cacheKey: string, cacheDuration: number): Promise<T | null> {
    try {
      // Check cache first
      const cached = await cache.get(cacheKey);
      if (cached) {
        console.log(`💾 Cache hit: ${cacheKey}`);
        return cached;
      }

      console.log(`🚀 API Request: ${url}`);

      // Make rate-limited request using axios
      const axiosConfig: AxiosRequestConfig = {
        method: 'GET',
        url,
        headers: {
          'X-Riot-Token': this.config.apiKey,
        },
        timeout: 10000, // 10 second timeout
      };

      const response = await this.limiter.executing(axiosConfig);
      const data = response.data;
      
      // Cache successful response
      await cache.set(cacheKey, data, cacheDuration);
      
      return data;
    } catch (error: any) {
      // Handle different error types
      if (error.response?.status === 404) {
        console.log(`⚠️ 404 Not Found: ${url}`);
        return null;
      }
      
      if (error.response?.status === 429) {
        console.log('⏱️ Rate limited, waiting...');
        throw new Error('Rate limit exceeded');
      }

      if (error.response?.status >= 500) {
        console.error(`❌ Server error ${error.response.status}: ${url}`);
        throw new Error(`Riot API server error: ${error.response.status}`);
      }

      console.error('❌ API Request failed:', error);
      throw error;
    }
  }

  /**
   * Get summoner by PUUID
   */
  async getSummonerByPuuid(puuid: string): Promise<SummonerData | null> {
    const url = `https://${REGIONAL_ENDPOINTS[this.config.region]}/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    const cacheKey = cache.constructor.generateKey('summoner', puuid);
    
    return this.makeRequest<SummonerData>(url, cacheKey, CACHE_DURATIONS.SUMMONER);
  }

  /**
   * Get account by RiotID (gameName#tagLine)
   */
  async getAccountByRiotId(gameName: string, tagLine: string): Promise<AccountData | null> {
    const regionalEndpoint = getRegionalEndpoint(this.config.region);
    const url = `https://${regionalEndpoint}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    const cacheKey = cache.constructor.generateKey('account', `${gameName}#${tagLine}`);
    
    return this.makeRequest<AccountData>(url, cacheKey, CACHE_DURATIONS.SUMMONER);
  }

  /**
   * Get match history by PUUID
   */
  async getMatchHistory(
    puuid: string, 
    options: {
      queue?: number;
      type?: string;
      start?: number;
      count?: number;
    } = {}
  ): Promise<string[] | null> {
    const regionalEndpoint = getRegionalEndpoint(this.config.region);
    const params = new URLSearchParams();
    
    if (options.queue) params.append('queue', options.queue.toString());
    if (options.type) params.append('type', options.type);
    if (options.start) params.append('start', options.start.toString());
    if (options.count) params.append('count', options.count.toString());
    
    const queryString = params.toString();
    const url = `https://${regionalEndpoint}/lol/match/v5/matches/by-puuid/${puuid}/ids${queryString ? '?' + queryString : ''}`;
    const cacheKey = cache.constructor.generateKey('matchlist', puuid, queryString);
    
    return this.makeRequest<string[]>(url, cacheKey, CACHE_DURATIONS.MATCH_HISTORY);
  }

  /**
   * Get match details by match ID
   */
  async getMatch(matchId: string): Promise<MatchData | null> {
    const regionalEndpoint = getRegionalEndpoint(this.config.region);
    const url = `https://${regionalEndpoint}/lol/match/v5/matches/${matchId}`;
    const cacheKey = cache.constructor.generateKey('match', matchId);
    
    return this.makeRequest<MatchData>(url, cacheKey, CACHE_DURATIONS.MATCH);
  }

  /**
   * Get ranked data by summoner ID
   */
  async getRankedData(summonerId: string): Promise<any[] | null> {
    const url = `https://${REGIONAL_ENDPOINTS[this.config.region]}/lol/league/v4/entries/by-summoner/${summonerId}`;
    const cacheKey = cache.constructor.generateKey('ranked', summonerId);
    
    return this.makeRequest<any[]>(url, cacheKey, CACHE_DURATIONS.RANK);
  }

  /**
   * Batch get multiple matches
   */
  async getMatches(matchIds: string[]): Promise<(MatchData | null)[]> {
    console.log(`📋 Fetching ${matchIds.length} matches...`);
    
    // Process in batches to avoid overwhelming the API
    const batchSize = 5;
    const results: (MatchData | null)[] = [];
    
    for (let i = 0; i < matchIds.length; i += batchSize) {
      const batch = matchIds.slice(i, i + batchSize);
      const batchPromises = batch.map(id => this.getMatch(id));
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
      
      // Small delay between batches
      if (i + batchSize < matchIds.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    return results;
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Simple API call to check if everything works
      const url = `https://${REGIONAL_ENDPOINTS[this.config.region]}/lol/status/v4/platform-data`;
      await this.makeRequest(url, 'health-check', 60);
      return true;
    } catch (error) {
      console.error('❌ Riot API health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const riotClient = new RiotClient();