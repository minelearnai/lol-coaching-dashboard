import { KPICard } from '@/app/components/KPICard';
import { GameTimeline } from '@/app/components/GameTimeline';
import { Game } from '@/lib/types';

export default function Dashboard() {
  // Mock data based on your real recent games
  const games: Game[] = [
    {
      id: '1',
      champion: 'Kindred',
      result: 'WIN',
      deaths: 5,
      kda: '9/5/10',
      game_date: '2025-09-22T04:10:00'
    },
    {
      id: '2',
      champion: 'Karthus',
      result: 'LOSS',
      deaths: 17,
      kda: '9/17/2',
      game_date: '2025-09-22T03:28:00'
    },
    {
      id: '3',
      champion: 'Briar',
      result: 'WIN',
      deaths: 3,
      kda: '7/3/15',
      game_date: '2025-09-22T02:48:00'
    }
  ];

  // Calculate KPIs
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
            title="Winrate (Recent)"
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
              
              {protocolCompliance >= 80 ? (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900">🎉 Excellent Progress!</h4>
                  <p className="text-sm text-green-700">
                    You're maintaining excellent death control. Keep it up!
                  </p>
                </div>
              ) : protocolCompliance >= 60 ? (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900">✅ Good Progress</h4>
                  <p className="text-sm text-blue-700">
                    You're improving! Focus on Kindred for consistent results.
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-900">⚠️ Protocol Violation</h4>
                  <p className="text-sm text-red-700">
                    Avoid experimental picks like Karthus. Stick to Kindred/Briar!
                  </p>
                </div>
              )}
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900">📚 Latest Analysis</h4>
                <p className="text-sm text-gray-600">
                  Based on your recent 3 games: Strong performance on comfort picks, 
                  but experimental champions lead to excessive deaths.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
