import { JungleGameData, JungleKPIs, CoachingInsight, ChampionStats } from '../riot-api/types';

/**
 * Advanced Jungle Analytics Engine
 * Calculates professional KPIs and generates coaching insights
 */
export class JungleAnalytics {
  /**
   * Calculate comprehensive jungle KPIs
   */
  calculateAdvancedKPIs(games: JungleGameData[]): JungleKPIs {
    if (games.length === 0) {
      return {
        winrate: 0,
        avgDeaths: 0,
        protocolCompliance: 0,
        jungleEfficiency: 0,
        objectiveControl: 0,
        visionDominance: 0,
        earlyGameImpact: 0,
        lateGameCarry: 0,
      };
    }

    return {
      // Basic KPIs
      winrate: this.calculateWinrate(games),
      avgDeaths: this.calculateAvgDeaths(games),
      protocolCompliance: this.calculateProtocolCompliance(games),
      
      // Advanced jungle-specific KPIs
      jungleEfficiency: this.calculateJungleEfficiency(games),
      objectiveControl: this.calculateObjectiveControl(games),
      visionDominance: this.calculateVisionScore(games),
      earlyGameImpact: this.calculateEarlyGameImpact(games),
      lateGameCarry: this.calculateLateGameImpact(games),
    };
  }

  /**
   * Basic winrate calculation
   */
  private calculateWinrate(games: JungleGameData[]): number {
    const wins = games.filter(g => g.result === 'WIN').length;
    return (wins / games.length) * 100;
  }

  /**
   * Average deaths per game
   */
  private calculateAvgDeaths(games: JungleGameData[]): number {
    const totalDeaths = games.reduce((sum, g) => sum + g.deaths, 0);
    return totalDeaths / games.length;
  }

  /**
   * Death Binary Protocol compliance (≤5 deaths)
   */
  private calculateProtocolCompliance(games: JungleGameData[]): number {
    const compliantGames = games.filter(g => g.deaths <= 5).length;
    return (compliantGames / games.length) * 100;
  }

  /**
   * Jungle efficiency based on CS per minute
   * Target: 4+ CS/min from jungle monsters
   */
  private calculateJungleEfficiency(games: JungleGameData[]): number {
    const efficiencies = games.map(game => {
      const gameMinutes = game.gameDuration / 60000; // Convert ms to minutes
      const csPerMin = game.jungleCS / gameMinutes;
      return Math.min(csPerMin / 4, 1); // Normalize to 0-1 scale (4 CS/min = 100%)
    });
    
    const avgEfficiency = efficiencies.reduce((sum, eff) => sum + eff, 0) / games.length;
    return avgEfficiency * 100;
  }

  /**
   * Objective control based on damage to objectives
   * Higher damage indicates better objective participation
   */
  private calculateObjectiveControl(games: JungleGameData[]): number {
    const avgObjectiveDamage = games.reduce((sum, g) => sum + g.objectivesDamage, 0) / games.length;
    
    // Normalize based on typical values (5000+ damage = 100%)
    return Math.min((avgObjectiveDamage / 5000) * 100, 100);
  }

  /**
   * Vision dominance based on vision score
   * Target: 1.5+ vision score per minute
   */
  private calculateVisionScore(games: JungleGameData[]): number {
    const visionScores = games.map(game => {
      const gameMinutes = game.gameDuration / 60000;
      const visionPerMin = game.visionScore / gameMinutes;
      return Math.min(visionPerMin / 1.5, 1); // Normalize to 0-1 scale
    });
    
    const avgVision = visionScores.reduce((sum, vs) => sum + vs, 0) / games.length;
    return avgVision * 100;
  }

  /**
   * Early game impact (first 15 minutes performance)
   * Based on KDA ratio and deaths in early game
   */
  private calculateEarlyGameImpact(games: JungleGameData[]): number {
    // This is a simplified calculation - in reality you'd need timeline data
    // For now, use overall KDA and death count as proxy
    const earlyGameScores = games.map(game => {
      const kda = (game.kills + game.assists) / Math.max(game.deaths, 1);
      const deathPenalty = Math.max(0, 5 - game.deaths) / 5; // Bonus for fewer deaths
      return Math.min(kda * deathPenalty, 5) / 5; // Normalize to 0-1
    });
    
    const avgScore = earlyGameScores.reduce((sum, score) => sum + score, 0) / games.length;
    return avgScore * 100;
  }

  /**
   * Late game carry potential
   * Based on gold earned and damage dealt
   */
  private calculateLateGameImpact(games: JungleGameData[]): number {
    const avgGold = games.reduce((sum, g) => sum + g.goldEarned, 0) / games.length;
    
    // Normalize based on typical gold values (12000+ gold = 100%)
    return Math.min((avgGold / 12000) * 100, 100);
  }

  /**
   * Generate coaching insights based on performance data
   */
  generateCoachingInsights(games: JungleGameData[]): CoachingInsight[] {
    const insights: CoachingInsight[] = [];
    const kpis = this.calculateAdvancedKPIs(games);
    const championStats = this.analyzeChampionPerformance(games);
    
    // Death control analysis
    if (kpis.protocolCompliance < 50) {
      insights.push({
        type: 'error',
        category: 'positioning',
        title: 'Critical Death Control Issue',
        message: `Only ${kpis.protocolCompliance.toFixed(1)}% protocol compliance (≤5 deaths)`,
        action: 'Focus on safer pathing, ward river brushes before ganks, avoid risky invades',
        priority: 'high',
        data: { currentCompliance: kpis.protocolCompliance, target: 80 }
      });
    } else if (kpis.protocolCompliance < 70) {
      insights.push({
        type: 'warning',
        category: 'positioning',
        title: 'Death Control Needs Improvement',
        message: `${kpis.protocolCompliance.toFixed(1)}% protocol compliance - room for improvement`,
        action: 'Review VODs of high-death games, identify risky patterns',
        priority: 'medium',
        data: { currentCompliance: kpis.protocolCompliance, target: 80 }
      });
    }

    // Jungle efficiency analysis
    if (kpis.jungleEfficiency < 70) {
      insights.push({
        type: 'warning',
        category: 'jungle_efficiency',
        title: 'Jungle Clear Efficiency Low',
        message: `${kpis.jungleEfficiency.toFixed(1)}% efficiency - optimize your clear paths`,
        action: 'Practice full clears, avoid wasted time between camps, use AOE abilities effectively',
        priority: 'medium',
        data: { currentEfficiency: kpis.jungleEfficiency, target: 85 }
      });
    }

    // Vision analysis
    if (kpis.visionDominance < 60) {
      insights.push({
        type: 'warning',
        category: 'vision',
        title: 'Vision Score Below Expectations',
        message: `${kpis.visionDominance.toFixed(1)}% vision effectiveness`,
        action: 'Place more wards in river, clear enemy wards when ganking, buy control wards',
        priority: 'medium',
        data: { currentVision: kpis.visionDominance, target: 75 }
      });
    }

    // Champion mastery insights
    if (championStats.length > 0) {
      const bestChamp = championStats[0];
      if (bestChamp.winrate > 70 && bestChamp.games >= 3) {
        insights.push({
          type: 'success',
          category: 'champion_mastery',
          title: 'Champion Strength Identified',
          message: `${bestChamp.champion}: ${bestChamp.winrate.toFixed(1)}% WR in ${bestChamp.games} games`,
          action: `Continue playing ${bestChamp.champion} for consistent LP gains`,
          priority: 'high',
          data: bestChamp
        });
      }
      
      // Find champions with poor performance
      const poorChamps = championStats.filter(c => c.winrate < 40 && c.games >= 3);
      if (poorChamps.length > 0) {
        poorChamps.forEach(champ => {
          insights.push({
            type: 'warning',
            category: 'champion_mastery',
            title: 'Champion Performance Issue',
            message: `${champ.champion}: ${champ.winrate.toFixed(1)}% WR in ${champ.games} games`,
            action: `Consider dropping ${champ.champion} or practice in normals first`,
            priority: 'medium',
            data: champ
          });
        });
      }
    }

    // Recent form analysis
    const recentGames = games.slice(0, 5);
    const recentWins = recentGames.filter(g => g.result === 'WIN').length;
    
    if (recentWins <= 1) {
      insights.push({
        type: 'error',
        category: 'positioning',
        title: 'Poor Recent Form',
        message: `Only ${recentWins}/5 wins in recent games`,
        action: 'Take a break, review fundamentals, consider switching champions',
        priority: 'high',
        data: { recentForm: recentGames.map(g => g.result).join('') }
      });
    }

    // Objective control insights
    if (kpis.objectiveControl < 60) {
      insights.push({
        type: 'warning',
        category: 'objectives',
        title: 'Low Objective Participation',
        message: `${kpis.objectiveControl.toFixed(1)}% objective control`,
        action: 'Focus on dragon/baron timing, coordinate with team, prioritize smite control',
        priority: 'medium',
        data: { currentControl: kpis.objectiveControl, target: 75 }
      });
    }

    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Analyze champion-specific performance
   */
  analyzeChampionPerformance(games: JungleGameData[]): ChampionStats[] {
    const champData: { [key: string]: { games: number; wins: number; deaths: number; kda: number; cs: number; vision: number } } = {};

    games.forEach(game => {
      if (!champData[game.champion]) {
        champData[game.champion] = { games: 0, wins: 0, deaths: 0, kda: 0, cs: 0, vision: 0 };
      }
      
      const stats = champData[game.champion];
      stats.games += 1;
      stats.deaths += game.deaths;
      stats.cs += game.cs;
      stats.vision += game.visionScore;
      
      const kdaRatio = (game.kills + game.assists) / Math.max(game.deaths, 1);
      stats.kda += kdaRatio;
      
      if (game.result === 'WIN') {
        stats.wins += 1;
      }
    });

    return Object.entries(champData)
      .map(([champion, stats]) => ({
        champion,
        games: stats.games,
        wins: stats.wins,
        losses: stats.games - stats.wins,
        winrate: (stats.wins / stats.games) * 100,
        avgDeaths: stats.deaths / stats.games,
        avgKDA: stats.kda / stats.games,
        avgCS: stats.cs / stats.games,
        avgVisionScore: stats.vision / stats.games,
      }))
      .filter(champ => champ.games >= 1) // Show all champions
      .sort((a, b) => {
        // Sort by games played first, then by winrate
        if (a.games !== b.games) {
          return b.games - a.games;
        }
        return b.winrate - a.winrate;
      });
  }

  /**
   * Get performance trends over time
   */
  getPerformanceTrends(games: JungleGameData[]) {
    // Split games into chunks for trend analysis
    const chunkSize = Math.max(5, Math.floor(games.length / 4));
    const chunks = [];
    
    for (let i = 0; i < games.length; i += chunkSize) {
      chunks.push(games.slice(i, i + chunkSize));
    }
    
    return chunks.map((chunk, index) => {
      const kpis = this.calculateAdvancedKPIs(chunk);
      return {
        period: `Games ${index * chunkSize + 1}-${Math.min((index + 1) * chunkSize, games.length)}`,
        ...kpis
      };
    });
  }
}