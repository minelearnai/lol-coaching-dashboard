import { riotClient } from '../riot-api/client';
import { MatchData, ParticipantData, JungleGameData } from '../riot-api/types';
import { QUEUE_IDS } from '../riot-api/config';

/**
 * Automated Match Scraper for Jungle Games
 * Fetches and parses jungle-specific data from Riot API
 */
export class MatchScraper {
  private puuid: string;

  constructor(puuid: string) {
    this.puuid = puuid;
  }

  /**
   * Scrape recent jungle matches
   */
  async scrapeRecentMatches(count: number = 20): Promise<JungleGameData[]> {
    try {
      console.log(`🎯 Scraping ${count} recent matches for jungle games...`);

      // Get match history for ranked solo queue
      const matchIds = await riotClient.getMatchHistory(this.puuid, {
        queue: QUEUE_IDS.RANKED_SOLO,
        count: count * 2, // Get more to filter jungle games
      });

      if (!matchIds || matchIds.length === 0) {
        console.log('⚠️ No match history found');
        return [];
      }

      console.log(`💰 Found ${matchIds.length} total matches`);

      // Get match details
      const matches = await riotClient.getMatches(matchIds);
      const validMatches = matches.filter(Boolean) as MatchData[];

      // Filter and parse jungle games
      const jungleGames = validMatches
        .map(match => this.parseJungleGame(match))
        .filter(game => game !== null) as JungleGameData[];

      console.log(`🌲 Found ${jungleGames.length} jungle games out of ${validMatches.length} matches`);

      // Sort by date descending and limit
      return jungleGames
        .sort((a, b) => b.gameDate.getTime() - a.gameDate.getTime())
        .slice(0, count);
    } catch (error) {
      console.error('❌ Error scraping matches:', error);
      return [];
    }
  }

  /**
   * Parse a single match for jungle-specific data
   */
  private parseJungleGame(match: MatchData): JungleGameData | null {
    try {
      const participant = match.info.participants.find(p => p.puuid === this.puuid);
      
      if (!participant) {
        console.log(`⚠️ Participant not found in match ${match.metadata.matchId}`);
        return null;
      }

      // Check if player was jungling
      const isJungle = this.isJungleRole(participant);
      if (!isJungle) {
        return null; // Skip non-jungle games
      }

      // Parse jungle-specific data
      const jungleData: JungleGameData = {
        matchId: match.metadata.matchId,
        champion: participant.championName,
        result: participant.win ? 'WIN' : 'LOSS',
        kda: `${participant.kills}/${participant.deaths}/${participant.assists}`,
        deaths: participant.deaths,
        kills: participant.kills,
        assists: participant.assists,
        cs: participant.totalMinionsKilled + participant.neutralMinionsKilled,
        jungleCS: participant.neutralMinionsKilled,
        gameDate: new Date(match.info.gameCreation),
        gameDuration: match.info.gameDuration,
        visionScore: participant.visionScore,
        objectivesDamage: participant.damageDealtToObjectives,
        wardsPlaced: participant.wardsPlaced,
        wardsKilled: participant.wardsKilled,
        goldEarned: participant.goldEarned,
        teamPosition: participant.teamPosition,
        gameVersion: match.info.gameVersion,
        queueId: match.info.queueId,
      };

      console.log(`✅ Parsed jungle game: ${jungleData.champion} ${jungleData.kda} ${jungleData.result}`);
      return jungleData;
    } catch (error) {
      console.error(`❌ Error parsing match ${match.metadata.matchId}:`, error);
      return null;
    }
  }

  /**
   * Determine if participant played jungle role
   */
  private isJungleRole(participant: ParticipantData): boolean {
    // Primary check: teamPosition
    if (participant.teamPosition === 'JUNGLE') {
      return true;
    }

    // Secondary check: lane field
    if (participant.lane === 'JUNGLE') {
      return true;
    }

    // Fallback: check smite and jungle CS
    const hasSmite = participant.summoner1Id === 11 || participant.summoner2Id === 11;
    const highJungleCS = participant.neutralMinionsKilled > 50;
    
    if (hasSmite && highJungleCS) {
      console.log(`🔍 Detected jungle role via smite + CS for ${participant.championName}`);
      return true;
    }

    return false;
  }

  /**
   * Get a single match by ID
   */
  async scrapeMatch(matchId: string): Promise<JungleGameData | null> {
    try {
      const match = await riotClient.getMatch(matchId);
      if (!match) {
        return null;
      }

      return this.parseJungleGame(match);
    } catch (error) {
      console.error(`❌ Error scraping match ${matchId}:`, error);
      return null;
    }
  }

  /**
   * Get jungle statistics overview
   */
  async getJungleStats(games: JungleGameData[]) {
    if (games.length === 0) return null;

    const wins = games.filter(g => g.result === 'WIN').length;
    const totalDeaths = games.reduce((sum, g) => sum + g.deaths, 0);
    const totalVisionScore = games.reduce((sum, g) => sum + g.visionScore, 0);
    const totalObjectivesDamage = games.reduce((sum, g) => sum + g.objectivesDamage, 0);
    const protocolCompliantGames = games.filter(g => g.deaths <= 5).length;

    return {
      totalGames: games.length,
      wins,
      losses: games.length - wins,
      winrate: (wins / games.length) * 100,
      avgDeaths: totalDeaths / games.length,
      avgVisionScore: totalVisionScore / games.length,
      avgObjectivesDamage: totalObjectivesDamage / games.length,
      protocolCompliance: (protocolCompliantGames / games.length) * 100,
      recentForm: games.slice(0, 5).map(g => g.result).join(''),
      favoriteChampions: this.getFavoriteChampions(games),
    };
  }

  /**
   * Get favorite champions with stats
   */
  private getFavoriteChampions(games: JungleGameData[]) {
    const champStats: { [key: string]: { games: number; wins: number; deaths: number } } = {};

    games.forEach(game => {
      if (!champStats[game.champion]) {
        champStats[game.champion] = { games: 0, wins: 0, deaths: 0 };
      }
      champStats[game.champion].games += 1;
      champStats[game.champion].deaths += game.deaths;
      if (game.result === 'WIN') {
        champStats[game.champion].wins += 1;
      }
    });

    return Object.entries(champStats)
      .map(([champion, stats]) => ({
        champion,
        games: stats.games,
        winrate: (stats.wins / stats.games) * 100,
        avgDeaths: stats.deaths / stats.games,
      }))
      .filter(champ => champ.games >= 2) // Only champions with 2+ games
      .sort((a, b) => b.winrate - a.winrate)
      .slice(0, 5);
  }
}

/**
 * Create scraper instance for Feraxin
 */
export async function createFeraxinScraper(): Promise<MatchScraper | null> {
  try {
    // Get account data for Feraxin#EUNE
    const account = await riotClient.getAccountByRiotId('Feraxin', 'EUNE');
    if (!account) {
      console.error('❌ Could not find account Feraxin#EUNE');
      return null;
    }

    console.log(`✅ Found account: ${account.gameName}#${account.tagLine} (${account.puuid})`);
    return new MatchScraper(account.puuid);
  } catch (error) {
    console.error('❌ Error creating Feraxin scraper:', error);
    return null;
  }
}