import { NextRequest, NextResponse } from 'next/server';
import { createFeraxinScraper } from '@/lib/scraper/MatchScraper';
import { JungleAnalytics } from '@/lib/analytics/JungleAnalytics';
import { riotClient } from '@/lib/riot-api/client';

/**
 * Test endpoint for Riot API integration
 * GET /api/test-riot
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing Riot API integration...');
    
    const url = new URL(request.url);
    const action = url.searchParams.get('action') || 'health';
    
    switch (action) {
      case 'health':
        return await testHealth();
      case 'account':
        return await testAccount();
      case 'matches':
        return await testMatches();
      case 'analytics':
        return await testAnalytics();
      default:
        return NextResponse.json({
          message: 'Riot API Test Endpoint',
          availableActions: ['health', 'account', 'matches', 'analytics'],
          usage: 'GET /api/test-riot?action=<action>'
        });
    }
  } catch (error) {
    console.error('❌ Test error:', error);
    return NextResponse.json(
      { 
        error: 'Test failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * Test basic API health
 */
async function testHealth() {
  const startTime = Date.now();
  
  try {
    const isHealthy = await riotClient.healthCheck();
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      test: 'health',
      results: {
        apiHealthy: isHealthy,
        responseTime: `${responseTime}ms`,
        timestamp: new Date().toISOString(),
        environment: {
          hasApiKey: !!process.env.RIOT_API_KEY,
          hasRedisUrl: !!process.env.REDIS_URL,
          hasNotionToken: !!process.env.NOTION_TOKEN,
          region: 'eun1'
        }
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      test: 'health',
      error: error instanceof Error ? error.message : 'Health check failed',
      responseTime: `${Date.now() - startTime}ms`
    });
  }
}

/**
 * Test account lookup
 */
async function testAccount() {
  const startTime = Date.now();
  
  try {
    // Test account lookup for Feraxin#EUNE
    const account = await riotClient.getAccountByRiotId('Feraxin', 'EUNE');
    const responseTime = Date.now() - startTime;
    
    if (!account) {
      return NextResponse.json({
        success: false,
        test: 'account',
        error: 'Account Feraxin#EUNE not found',
        responseTime: `${responseTime}ms`
      });
    }
    
    // Get summoner data
    const summoner = await riotClient.getSummonerByPuuid(account.puuid);
    
    return NextResponse.json({
      success: true,
      test: 'account',
      results: {
        account: {
          puuid: account.puuid,
          gameName: account.gameName,
          tagLine: account.tagLine
        },
        summoner: summoner ? {
          summonerId: summoner.id,
          summonerLevel: summoner.summonerLevel,
          profileIconId: summoner.profileIconId
        } : null,
        responseTime: `${responseTime}ms`
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      test: 'account',
      error: error instanceof Error ? error.message : 'Account test failed',
      responseTime: `${Date.now() - startTime}ms`
    });
  }
}

/**
 * Test match scraping
 */
async function testMatches() {
  const startTime = Date.now();
  
  try {
    const scraper = await createFeraxinScraper();
    if (!scraper) {
      throw new Error('Could not create match scraper');
    }
    
    // Get recent jungle matches (limited to 5 for testing)
    const matches = await scraper.scrapeRecentMatches(5);
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      test: 'matches',
      results: {
        matchCount: matches.length,
        matches: matches.map(match => ({
          matchId: match.matchId,
          champion: match.champion,
          result: match.result,
          kda: match.kda,
          deaths: match.deaths,
          jungleCS: match.jungleCS,
          gameDate: match.gameDate.toISOString(),
          visionScore: match.visionScore
        })),
        responseTime: `${responseTime}ms`
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      test: 'matches',
      error: error instanceof Error ? error.message : 'Match test failed',
      responseTime: `${Date.now() - startTime}ms`
    });
  }
}

/**
 * Test analytics engine
 */
async function testAnalytics() {
  const startTime = Date.now();
  
  try {
    const scraper = await createFeraxinScraper();
    if (!scraper) {
      throw new Error('Could not create match scraper');
    }
    
    // Get recent matches for analysis
    const matches = await scraper.scrapeRecentMatches(10);
    if (matches.length === 0) {
      throw new Error('No matches found for analysis');
    }
    
    // Run analytics
    const analytics = new JungleAnalytics();
    const kpis = analytics.calculateAdvancedKPIs(matches);
    const insights = analytics.generateCoachingInsights(matches);
    const championStats = analytics.analyzeChampionPerformance(matches);
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      success: true,
      test: 'analytics',
      results: {
        matchCount: matches.length,
        kpis: {
          winrate: `${kpis.winrate.toFixed(1)}%`,
          avgDeaths: kpis.avgDeaths.toFixed(1),
          protocolCompliance: `${kpis.protocolCompliance.toFixed(1)}%`,
          jungleEfficiency: `${kpis.jungleEfficiency.toFixed(1)}%`,
          objectiveControl: `${kpis.objectiveControl.toFixed(1)}%`,
          visionDominance: `${kpis.visionDominance.toFixed(1)}%`,
          earlyGameImpact: `${kpis.earlyGameImpact.toFixed(1)}%`,
          lateGameCarry: `${kpis.lateGameCarry.toFixed(1)}%`
        },
        insights: insights.map(insight => ({
          type: insight.type,
          category: insight.category,
          title: insight.title,
          message: insight.message,
          priority: insight.priority
        })),
        championStats: championStats.slice(0, 3).map(champ => ({
          champion: champ.champion,
          games: champ.games,
          winrate: `${champ.winrate.toFixed(1)}%`,
          avgDeaths: champ.avgDeaths.toFixed(1)
        })),
        responseTime: `${responseTime}ms`
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      test: 'analytics',
      error: error instanceof Error ? error.message : 'Analytics test failed',
      responseTime: `${Date.now() - startTime}ms`
    });
  }
}