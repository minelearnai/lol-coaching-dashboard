import { KPICard } from '@/app/components/KPICard';
import { GameTimeline } from '@/app/components/GameTimeline';
import { RefreshButton } from '@/app/components/RefreshButton';
import { JungleAnalyticsCard } from '@/app/components/JungleAnalyticsCard';
import { AICoachingInsights } from '@/app/components/AICoachingInsights';
import { VisionDominanceCard } from '@/app/components/VisionDominanceCard';
import { getRecentGames } from '@/lib/notion';
import { Game } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

export const revalidate = 0;

async function getAdvancedAnalytics() {
  try {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://lol-coaching-dashboard.vercel.app' 
      : 'http://localhost:3000';
      
    const response = await fetch(`${baseUrl}/api/test-riot?action=analytics`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error(`Analytics API failed: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Failed to fetch advanced analytics:', error);
    return null;
  }
}

async function getCoachingInsights() {
  try {
    const baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://lol-coaching-dashboard.vercel.app' 
      : 'http://localhost:3000';
      
    const response = await fetch(`${baseUrl}/api/coaching-insights`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      console.log('⚠️ Coaching insights not available, using fallback');
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('❌ Failed to fetch coaching insights:', error);
    return null;
  }
}

export default async function Dashboard() {
  let games: Game[] = [];
  let analytics = null;
  let insights = null;
  let error = null;

  try {
    console.log('🔍 Dashboard: Fetching comprehensive data...');
    
    // Parallel fetch of all data sources
    const [gamesData, analyticsData, insightsData] = await Promise.allSettled([
      getRecentGames(25),
      getAdvancedAnalytics(),
      getCoachingInsights()
    ]);

    if (gamesData.status === 'fulfilled') {
      games = gamesData.value;
    }
    
    if (analyticsData.status === 'fulfilled') {
      analytics = analyticsData.value;
    }
    
    if (insightsData.status === 'fulfilled') {
      insights = insightsData.value;
    }

    console.log('✅ Dashboard: Advanced data loaded successfully');
    console.log('📊 Analytics available:', !!analytics);
    console.log('🤖 AI Insights available:', !!insights);
    
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Dashboard: Failed to load data:', error);
  }

  // If no games loaded, show error page
  if (games.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 p-8 rounded-xl shadow-2xl max-w-md">
          <h1 className="text-2xl font-bold text-red-400 mb-4">🚨 Data Connection Failed</h1>
          <p className="text-slate-300 mb-4">
            Cannot load coaching dashboard data.
          </p>
          <div className="bg-slate-900/50 p-4 rounded-lg text-sm mb-4">
            <strong className="text-red-400">Error:</strong> 
            <span className="text-slate-300 ml-2">{error}</span>
          </div>
          <RefreshButton />
        </div>
      </div>
    );
  }

  // Calculate basic KPIs from Notion data
  const wins = games.filter((g: Game) => g.result === 'WIN').length;
  const losses = games.length - wins;
  const winrate = wins / games.length * 100;
  const avgDeaths = games.reduce((sum: number, g: Game) => sum + g.deaths, 0) / games.length;
  const protocolCompliance = games.filter((g: Game) => g.deaths <= 5).length / games.length * 100;

  // Use advanced analytics if available, fallback to basic calculations
  const kpis = analytics?.success ? analytics.kpis : {
    winrate: Math.round(winrate),
    avgDeaths: avgDeaths.toFixed(1),
    protocolCompliance: Math.round(protocolCompliance),
    jungleEfficiency: Math.round((games.length / 25) * 100), // Fallback calculation
    objectiveControl: Math.round(winrate * 0.8), // Estimated based on winrate
    visionDominance: Math.round(winrate * 0.7), // Estimated based on winrate
    earlyGameImpact: Math.round(winrate * 0.9), // Estimated based on winrate
    lateGameImpact: Math.round(winrate * 0.85) // Estimated based on winrate
  };

  // Data source indicators
  const dataSource = analytics?.success ? 'Riot API + Notion' : 'Notion Only';
  const isAdvancedData = analytics?.success;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Enhanced Header */}
      <header className="bg-slate-800/50 backdrop-blur border-b border-slate-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-6 px-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                🎮 LoL Jungle Coach Dashboard
              </h1>
              <div className="flex items-center gap-6 text-sm">
                <span className="text-slate-300">
                  <strong>Feraxin#EUNE</strong> • Platinum 2
                </span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full animate-pulse ${
                    isAdvancedData ? 'bg-green-400' : 'bg-yellow-400'
                  }`}></div>
                  <span className={isAdvancedData ? 'text-green-400' : 'text-yellow-400'}>
                    {dataSource} • {games.length} games
                  </span>
                </div>
                {isAdvancedData && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                      🤖 AI Analytics Active
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Last updated: {new Date().toLocaleString()}
              </p>
            </div>
            <RefreshButton />
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-8 px-6">
        {/* Data Source Status Banner */}
        <div className={`mb-8 p-4 rounded-xl backdrop-blur border ${
          isAdvancedData 
            ? 'bg-green-500/10 border-green-500/20' 
            : 'bg-yellow-500/10 border-yellow-500/20'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full animate-pulse shadow-lg ${
                  isAdvancedData 
                    ? 'bg-green-400 shadow-green-400/50' 
                    : 'bg-yellow-400 shadow-yellow-400/50'
                }`}></div>
                <span className={`font-semibold ${
                  isAdvancedData ? 'text-green-300' : 'text-yellow-300'
                }`}>
                  {isAdvancedData ? '✅ Advanced Analytics' : '⚠️ Basic Mode'}
                </span>
              </div>
              <span className={`text-sm ${
                isAdvancedData ? 'text-green-400' : 'text-yellow-400'
              }`}>
                {isAdvancedData 
                  ? 'Riot API + AI Coaching + Real-time Analysis' 
                  : 'Notion Data Only - Limited Analytics'
                }
              </span>
            </div>
            {!isAdvancedData && (
              <div className="text-xs text-yellow-400/80">
                Configure RIOT_API_KEY for full features
              </div>
            )}
          </div>
        </div>

        {/* Enhanced KPI Grid - 8 Professional Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-8">
          <KPICard 
            title="Winrate" 
            value={`${kpis.winrate}%`} 
            subtitle={`${wins}W • ${losses}L`}
            trend="↗ Target: 60%"
            color={kpis.winrate >= 60 ? 'green' : kpis.winrate >= 50 ? 'yellow' : 'red'}
          />
          
          <KPICard 
            title="Deaths/Game" 
            value={kpis.avgDeaths} 
            subtitle={`Last ${games.length} games`}
            trend="↘ Target: ≤5.0"
            color={parseFloat(kpis.avgDeaths) <= 5 ? 'green' : 'red'}
          />
          
          <KPICard 
            title="Protocol" 
            value={`${kpis.protocolCompliance}%`} 
            subtitle="Games ≤5 deaths"
            trend="↗ Target: 80%"
            color={kpis.protocolCompliance >= 80 ? 'green' : 'yellow'}
          />
          
          <KPICard 
            title="Jungle Eff." 
            value={`${kpis.jungleEfficiency}%`} 
            subtitle="CS/min optimization"
            trend="↗ Target: 85%"
            color={kpis.jungleEfficiency >= 85 ? 'green' : kpis.jungleEfficiency >= 70 ? 'yellow' : 'red'}
            advanced={isAdvancedData}
          />
          
          <KPICard 
            title="Objectives" 
            value={`${kpis.objectiveControl}%`} 
            subtitle="Control rate"
            trend="↗ Target: 75%"
            color={kpis.objectiveControl >= 75 ? 'green' : kpis.objectiveControl >= 60 ? 'yellow' : 'red'}
            advanced={isAdvancedData}
          />
          
          <KPICard 
            title="Vision Dom." 
            value={`${kpis.visionDominance}%`} 
            subtitle="Vision score/min"
            trend="↗ Target: 70%"
            color={kpis.visionDominance >= 70 ? 'green' : kpis.visionDominance >= 55 ? 'yellow' : 'red'}
            advanced={isAdvancedData}
          />
          
          <KPICard 
            title="Early Game" 
            value={`${kpis.earlyGameImpact}%`} 
            subtitle="Impact score"
            trend="↗ Target: 80%"
            color={kpis.earlyGameImpact >= 80 ? 'green' : kpis.earlyGameImpact >= 65 ? 'yellow' : 'red'}
            advanced={isAdvancedData}
          />
          
          <KPICard 
            title="Late Game" 
            value={`${kpis.lateGameImpact}%`} 
            subtitle="Impact score"
            trend="↗ Target: 75%"
            color={kpis.lateGameImpact >= 75 ? 'green' : kpis.lateGameImpact >= 60 ? 'yellow' : 'red'}
            advanced={isAdvancedData}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="xl:col-span-2 space-y-8">
            {/* AI Coaching Insights */}
            {isAdvancedData && insights && (
              <AICoachingInsights insights={insights} />
            )}
            
            {/* Enhanced Recent Games */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="p-6 border-b border-slate-700/50">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">🎮 Recent Games</h2>
                  <span className="text-sm text-slate-400">Last {games.length} games</span>
                </div>
              </div>
              
              <GameTimeline games={games.slice(0, 15)} />
            </div>

            {/* Advanced Jungle Analytics */}
            {isAdvancedData && (
              <JungleAnalyticsCard analytics={analytics} />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Vision Dominance */}
            {isAdvancedData && (
              <VisionDominanceCard visionScore={kpis.visionDominance} />
            )}

            {/* Protocol Tracking */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">🎯 Death Binary Protocol</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Compliance Rate</span>
                    <span className="text-white font-medium">{kpis.protocolCompliance}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        kpis.protocolCompliance >= 80 ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                      style={{width: `${Math.min(kpis.protocolCompliance, 100)}%`}} 
                    />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Target: 80% compliance • Current: {games.filter(g => g.deaths <= 5).length}/{games.length} games
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${
                  kpis.protocolCompliance >= 67 
                    ? 'bg-green-500/10 border border-green-500/20' 
                    : 'bg-yellow-500/10 border border-yellow-500/20'
                }`}>
                  <h4 className={`font-medium mb-2 ${
                    kpis.protocolCompliance >= 67 ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {kpis.protocolCompliance >= 67 ? '✅ Strong Progress' : '⚠️ Needs Focus'}
                  </h4>
                  <p className="text-sm text-slate-300">
                    {kpis.protocolCompliance >= 67 
                      ? `Excellent death control! ${games.filter(g => g.deaths <= 5).length} protocol-compliant games.`
                      : `Focus on death control. ${games.filter(g => g.deaths > 5).length} games exceeded 5 deaths.`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Data Integration Status */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">📊 Data Sources</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Notion API</span>
                  <span className="text-green-400 text-sm">✅ Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Riot Games API</span>
                  <span className={`text-sm ${isAdvancedData ? 'text-green-400' : 'text-yellow-400'}`}>
                    {isAdvancedData ? '✅ Active' : '⚠️ Limited'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">AI Analytics</span>
                  <span className={`text-sm ${isAdvancedData && insights ? 'text-green-400' : 'text-slate-500'}`}>
                    {isAdvancedData && insights ? '✅ Active' : '❌ Offline'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Real-time Updates</span>
                  <span className="text-green-400 text-sm">✅ Active</span>
                </div>
              </div>
              
              {!isAdvancedData && (
                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-xs text-yellow-400">
                    <strong>Tip:</strong> Configure RIOT_API_KEY for advanced jungle analytics, AI coaching insights, and real-time match analysis.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
