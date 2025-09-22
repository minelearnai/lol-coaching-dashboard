import { KPICard } from '@/app/components/KPICard';
import { GameTimeline } from '@/app/components/GameTimeline';
import { RefreshButton } from '@/app/components/RefreshButton';
import { getRecentGames, getCurrentSession } from '@/lib/notion';
import { Game, Session } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

export const revalidate = 0;

export default async function Dashboard() {
  let games: Game[] = [];
  let session: Session | null = null;
  let error = null;

  try {
    console.log('🔍 Dashboard: Fetching live data from Notion...');
    games = await getRecentGames(25);
    session = await getCurrentSession();
    console.log('✅ Dashboard: Live data loaded successfully');
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Dashboard: Failed to load live data:', error);
  }

  // If no games loaded, show enhanced error page
  if (games.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 p-8 rounded-xl shadow-2xl max-w-md">
          <h1 className="text-2xl font-bold text-red-400 mb-4">🚨 API Connection Failed</h1>
          <p className="text-slate-300 mb-4">
            Cannot connect to Notion API. Dashboard requires live data.
          </p>
          <div className="bg-slate-900/50 p-4 rounded-lg text-sm mb-4">
            <strong className="text-red-400">Error:</strong> 
            <span className="text-slate-300 ml-2">{error}</span>
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-slate-300"><strong>Check:</strong></p>
            <ul className="list-disc list-inside text-slate-400 space-y-1">
              <li>NOTION_TOKEN environment variable</li>
              <li>NOTION_GAMES_DB environment variable</li>
              <li>Notion integration permissions</li>
              <li>Database connection status</li>
            </ul>
          </div>
          <div className="mt-6">
            <RefreshButton />
          </div>
        </div>
      </div>
    );
  }

  // Calculate KPIs from REAL live data
  const recentGames = games.slice(0, 10);
  const wins = games.filter((g: Game) => g.result === 'WIN').length;
  const losses = games.length - wins;
  const winrate = wins / games.length * 100;
  const avgDeaths = games.reduce((sum: number, g: Game) => sum + g.deaths, 0) / games.length;
  const protocolCompliance = games.filter((g: Game) => g.deaths <= 5).length / games.length * 100;

  // Champion performance analysis
  const championStats = games.reduce((acc: any, game: Game) => {
    if (!acc[game.champion]) {
      acc[game.champion] = { wins: 0, total: 0, deaths: 0 };
    }
    acc[game.champion].total += 1;
    acc[game.champion].deaths += game.deaths;
    if (game.result === 'WIN') {
      acc[game.champion].wins += 1;
    }
    return acc;
  }, {});

  const topChampions = Object.entries(championStats)
    .map(([champion, stats]: [string, any]) => ({
      champion,
      games: stats.total,
      winrate: (stats.wins / stats.total * 100),
      avgDeaths: stats.deaths / stats.total
    }))
    .filter(champ => champ.games >= 2) // Only champions with 2+ games
    .sort((a, b) => b.winrate - a.winrate)
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Enhanced Header - LeagueStats.gg Style */}
      <header className="bg-slate-800/50 backdrop-blur border-b border-slate-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto py-6 px-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🎮 LoL Jungle Coach Dashboard
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-300">
                <strong>Feraxin#EUNE</strong> • Platinum 2
              </span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400">Live Data • {games.length} games</span>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Last updated: {new Date().toLocaleString()}
            </p>
          </div>
          <RefreshButton />
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-8 px-6">
        {/* Enhanced Live Status Banner */}
        <div className="mb-8 p-4 bg-green-500/10 border border-green-500/20 rounded-xl backdrop-blur">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                <span className="font-semibold text-green-300">✅ Live Notion API Connected</span>
              </div>
              <span className="text-sm text-green-400">
                {games.length} games loaded • Webhook active • Real-time updates
              </span>
            </div>
            <div className="text-xs text-green-400/80">
              Death Binary Protocol Active
            </div>
          </div>
        </div>

        {/* Enhanced KPI Cards - LeagueStats Style */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {Math.round(winrate)}%
              </div>
              <div className="text-sm text-slate-400 mb-2">Winrate (Last 20)</div>
              <div className="text-xs text-slate-500">
                {wins}W • {losses}L
              </div>
              <div className="mt-3 text-xs text-green-400">
                ↗ Target: 60%
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all">
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${avgDeaths <= 5 ? 'text-green-400' : 'text-red-400'}`}>
                {avgDeaths.toFixed(1)}
              </div>
              <div className="text-sm text-slate-400 mb-2">Deaths/Game</div>
              <div className="text-xs text-slate-500">
                Avg last {games.length} games
              </div>
              <div className="mt-3 text-xs text-red-400">
                ↘ Target: ≤5.0
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all">
            <div className="text-center">
              <div className={`text-3xl font-bold mb-2 ${protocolCompliance >= 80 ? 'text-green-400' : 'text-yellow-400'}`}>
                {Math.round(protocolCompliance)}%
              </div>
              <div className="text-sm text-slate-400 mb-2">Protocol Compliance</div>
              <div className="text-xs text-slate-500">
                Games ≤5 deaths
              </div>
              <div className="mt-3 text-xs text-blue-400">
                ↗ Target: 80%
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-all">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {recentGames.length}
              </div>
              <div className="text-sm text-slate-400 mb-2">Games Analyzed</div>
              <div className="text-xs text-slate-500">
                Recent performance
              </div>
              <div className="mt-3 text-xs text-blue-400">
                ↗ +{recentGames.length}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Enhanced Recent Games - Main Feature */}
          <div className="xl:col-span-2">
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 overflow-hidden">
              <div className="p-6 border-b border-slate-700/50">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">🎮 Recent Games</h2>
                  <span className="text-sm text-slate-400">Last {recentGames.length} games</span>
                </div>
              </div>
              
              <div className="divide-y divide-slate-700/30">
                {recentGames.map((game, index) => {
                  const isWin = game.result === 'WIN';
                  const isGoodDeaths = game.deaths <= 5;
                  
                  return (
                    <div key={game.id} className={`
                      p-4 flex items-center justify-between hover:bg-slate-700/20 transition-all duration-200
                      ${isWin 
                        ? 'bg-green-500/5 border-l-4 border-green-500/50' 
                        : 'bg-red-500/5 border-l-4 border-red-500/50'}
                    `}>
                      <div className="flex items-center gap-4">
                        <div className={`
                          w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg
                          ${isWin 
                            ? 'bg-green-500/20 text-green-300 shadow-green-500/20' 
                            : 'bg-red-500/20 text-red-300 shadow-red-500/20'}
                        `}>
                          {isWin ? 'W' : 'L'}
                        </div>
                        
                        <div>
                          <div className="font-semibold text-white text-lg">{game.champion}</div>
                          <div className="text-sm text-slate-400">{game.kda}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className={`
                          text-lg font-bold mb-1
                          ${isGoodDeaths ? 'text-green-400' : 'text-red-400'}
                        `}>
                          {game.deaths} deaths
                        </div>
                        <div className="text-xs text-slate-500">
                          {formatDistanceToNow(new Date(game.game_date))} ago
                        </div>
                        {isGoodDeaths && (
                          <div className="text-xs text-green-400 mt-1">✅ Protocol</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Enhanced Side Panel */}
          <div className="space-y-6">
            {/* Current Session */}
            {session && (
              <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">📚 Current Session</h3>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-slate-400">Session Name</div>
                    <div className="text-white font-medium">{session.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Focus Area</div>
                    <div className="text-blue-400">{session.focus_area}</div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Target Games</div>
                    <div className="text-green-400">{session.target_games} games</div>
                  </div>
                </div>
              </div>
            )}

            {/* Protocol Tracking */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">🎯 Live Progress Tracking</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-400">Death Binary Protocol</span>
                    <span className="text-white font-medium">{Math.round(protocolCompliance)}% games ≤5 deaths</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3">
                    <div 
                      className={`h-3 rounded-full transition-all duration-1000 ${
                        protocolCompliance >= 80 ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                      style={{width: `${Math.min(protocolCompliance, 100)}%`}} 
                    />
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Target: 80% compliance
                  </div>
                </div>

                <div className={`p-4 rounded-lg ${
                  protocolCompliance >= 67 
                    ? 'bg-green-500/10 border border-green-500/20' 
                    : 'bg-yellow-500/10 border border-yellow-500/20'
                }`}>
                  <h4 className={`font-medium mb-2 ${
                    protocolCompliance >= 67 ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {protocolCompliance >= 67 ? '✅ Strong Progress' : '⚠️ Needs Focus'}
                  </h4>
                  <p className="text-sm text-slate-300">
                    {protocolCompliance >= 67 
                      ? `Keep focusing on ${topChampions[0]?.champion || 'your best champion'}. ${games.filter(g => g.champion === topChampions[0]?.champion).length} ${topChampions[0]?.champion} games detected.`
                      : `Focus on death control. ${games.filter(g => g.deaths > 5).length} games exceeded 5 deaths.`
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Champion Performance */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">🏆 Champion Performance (Live Data)</h3>
              <div className="space-y-3">
                {topChampions.map((champ, index) => (
                  <div key={champ.champion} className="flex justify-between items-center">
                    <div>
                      <div className="text-white font-medium">{champ.champion}</div>
                      <div className="text-xs text-slate-400">
                        {champ.games} games • {champ.avgDeaths.toFixed(1)} avg deaths
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${
                        champ.winrate >= 60 ? 'text-green-400' : 
                        champ.winrate >= 50 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {Math.round(champ.winrate)}% WR
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
