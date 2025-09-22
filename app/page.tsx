import { KPICard } from '@/app/components/KPICard';
import { GameTimeline } from '@/app/components/GameTimeline';
import { getRecentGames, getCurrentSession } from '@/lib/notion';
import { Game } from '@/lib/types'; // ✅ Import shared type

export default async function Dashboard() {
  try {
    // Get real data from Notion
    const notionGames = await getRecentGames();
    const session = await getCurrentSession();
    
    // Transform Notion data to match our shared interface
    const games: Game[] = notionGames.map((game: any) => ({
      id: game.match_id || game.id,
      champion: game.champion,
      result: game.result as 'WIN' | 'LOSS',
      deaths: game.deaths,
      kda: game.kda,
      game_date: game.game_date
    }));

    // Calculate KPIs with proper typing
    const recentGames = games.slice(0, 10);
    const winrate = games.filter((g: Game) => g.result === 'WIN').length / games.length * 100;
    const avgDeaths = games.reduce((sum: number, g: Game) => sum + g.deaths, 0) / games.length;
    const protocolCompliance = games.filter((g: Game) => g.deaths <= 5).length / games.length * 100;

    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4">
            <h1 className="text-3xl font-bold text-gray-900">
              🎮 LoL Jungle Coach Dashboard
            </h1>
            <p className="text-gray-600">Feraxin#EUNE • Platinum 2</p>
          </div>
        </header>
        
        <main className="max-w-7xl mx-auto py-6 px-4">
          {/* KPIs Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <KPICard 
              title="Winrate (Last 10)"
              value={Math.round(winrate)}
              change={5.2}
              target={60}
              format="percentage"
            />
            <KPICard 
              title="Deaths/Game"
              value={avgDeaths}
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
              title="Current Streak"
              value="2W"
              change={2}
            />
          </div>
          
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <GameTimeline games={recentGames} />
            
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">🎯 Current Task Progress</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Death Binary Protocol</span>
                    <span>{Math.round(protocolCompliance)}% games ≤5 deaths</span>
                  </div>
                  <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{width: `${protocolCompliance}%`}} 
                    />
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900">🎯 Next Recommendation</h4>
                  <p className="text-sm text-blue-700">
                    {protocolCompliance >= 80 
                      ? "Great progress! Keep focusing on Kindred."
                      : "Focus on Kindred/Briar. Avoid experimental picks!"
                    }
                  </p>
                </div>
                
                {session && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900">📚 Current Session</h4>
                    <p className="text-sm text-gray-600">{session.name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
    
  } catch (error) {
    console.error('Dashboard error:', error);
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-red-600 mb-4">🚨 Dashboard Error</h1>
          <p className="text-gray-600">
            Could not load data from Notion. Check your environment variables.
          </p>
        </div>
      </div>
    );
  }
}
