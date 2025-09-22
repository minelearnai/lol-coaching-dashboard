import { Game } from '@/lib/types';

export function GameTimeline({ games }: { games: Game[] }) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium mb-4">🎮 Recent Games</h3>
      <div className="space-y-3">
        {games.map((game) => (
          <div key={game.id} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-50">
            <div className={`w-3 h-3 rounded-full ${
              game.result === 'WIN' ? 'bg-green-500' : 'bg-red-500'
            }`} />
            
            <div className="flex-1">
              <p className="text-sm font-medium">{game.champion}</p>
              <p className="text-xs text-gray-500">
                {new Date(game.game_date).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            
            <div className="text-right">
              <p className={`text-sm font-medium ${
                game.result === 'WIN' ? 'text-green-600' : 'text-red-600'
              }`}>
                {game.result}
              </p>
              <p className="text-xs text-gray-500">{game.kda}</p>
            </div>
            
            <div className={`px-2 py-1 rounded text-xs font-medium ${
              game.deaths <= 5 ? 'bg-green-100 text-green-800' :
              game.deaths <= 8 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {game.deaths} deaths
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
