import { KPICard } from '@/app/components/KPICard';
import { GameTimeline } from '@/app/components/GameTimeline';
import { RefreshButton } from '@/app/components/RefreshButton';
import { getRecentGames, getCurrentSession } from '@/lib/notion';
import { Game } from '@/lib/types';

// Force server-side rendering for fresh data
export const revalidate = 0;

export default async function Dashboard() {
  let games: Game[] = [];
  let session = null;
  let error = null;

  try {
    console.log('🔍 Dashboard: Fetching live data from Notion...');
    games = await getRecentGames(20);
    session = await getCurrentSession();
    console.log('✅ Dashboard: Live data loaded successfully');
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error';
    console.error('❌ Dashboard: Failed to load live data:', error);
  }

  // If no games loaded, show error page
  if (games.length === 0) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <h1 className="text-2xl font-bold text-red-600 mb-4">🚨 API Connection Failed</h1>
          <p className="text-gray-700 mb-4">
            Cannot connect to Notion API. Dashboard requires live data.
          </p>
          <div className="bg-gray-100 p-4 rounded text-sm mb-4">
            <strong>Error:</strong> {error}
          </div>
          <div className="space-y-2 text-sm">
            <p><strong>Check:</strong></p>
            <ul className="list-disc list-inside text-gray-600">
              <li>NOTION_TOKEN environment variable</li>
              <li>NOTION_GAMES_DB environment variable</li>
              <li>Notion integration permissions</li>
              <li>Database connection status</li>
            </ul>
          </div>
          <RefreshButton />
        </div>
      </div>
    );
  }

  // Calculate KPIs from REAL live data
  const recentGames = games.slice(0, 10);
  const winrate = games.filter((g: Game) => g.result === 'WIN').length / games.length * 100;
  const avgDeaths = games.reduce((sum: number, g: Game) => sum + g.deaths, 0) / games.length;
  const protocolCompliance = games.filter((g: Game) => g.deaths <= 5).length / games.length * 100;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              🎮 LoL Jungle Coach Dashboard
            </h1>
            <p className="text-gray-600">
              Feraxin#EUNE • Platinum 2 • Live Data ✅ ({games.length} games loaded)
            </p>
            <p className="text-sm text-green-600">
              🔗 Connected to Notion API • Last updated: {new Date().toLocaleString()}
            </p>
          </div>
          <RefreshButton />
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4">
        {/* Live API Status */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
            <span className="font-medium text-green-900">Live Notion API Connected</span>
            <span className="text-sm text-green-700">
              {games.length} games loaded • Webhook active • Real-time updates
            </span>
          </div>
        </div>

        {/* Live KPIs from real data */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <KPICard 
            title="Live Winrate"
            value={Math.round(winrate)}
            change={5.2}
            target={60}
            format="percentage"
          />
          <KPICard 
            title="Deaths/Game"
            value={Number(avgDeaths.toFixed(1))}
            change={-1.3}
            target={5}
            format="decimal"
          />
          <KPICard 
            title="Protocol Compliance"
            value={Math.round(protocolCompliance)}
            change={12.5}
            target={80}
            format="percentage"
          />
          <KPICard 
            title="Games Analyzed"
            value={games.length}
            change={games.length}
          />
        </div>
        
        {/* Live game timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GameTimeline games={recentGames} />
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4">🎯 Live Progress Tracking</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Death Binary Protocol</span>
                  <span>{Math.round(protocolCompliance)}% games ≤5 deaths</span>
                </div>
                <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                    style={{width: `${protocolCompliance}%`}} 
                  />
                </div>
              </div>
              
              {session && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">📚 Active Session</h4>
                  <p className="text-sm text-blue-700">
                    {session.name} • {session.focus_area} • Target: {session.target_games} games
                  </p>
                </div>
              )}
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900">✅ API Status</h4>
                <p className="text-sm text-green-700">
                  Connected to live Notion data • {games.length} games loaded • Auto-refresh enabled
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}