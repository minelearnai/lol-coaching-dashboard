interface JungleAnalyticsCardProps {
  analytics: any;
}

export function JungleAnalyticsCard({ analytics }: JungleAnalyticsCardProps) {
  if (!analytics?.success) {
    return null;
  }

  const { kpis, analysis } = analytics;

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 overflow-hidden">
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">🌲 Advanced Jungle Analytics</h2>
          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
            Riot API Data
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Jungle Efficiency Breakdown */}
          <div>
            <h4 className="text-white font-medium mb-3">🎯 Jungle Efficiency</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">CS per Minute</span>
                <span className="text-blue-400 font-medium">
                  {analysis?.jungleCS || 'N/A'} CS/min
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Clear Speed</span>
                <span className="text-green-400 font-medium">
                  {kpis.jungleEfficiency}% optimal
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="h-2 bg-blue-500 rounded-full transition-all duration-1000"
                  style={{width: `${Math.min(kpis.jungleEfficiency, 100)}%`}}
                />
              </div>
            </div>
          </div>

          {/* Objective Control */}
          <div>
            <h4 className="text-white font-medium mb-3">🏆 Objective Control</h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Dragon Participation</span>
                <span className="text-orange-400 font-medium">
                  {analysis?.dragonParticipation || 'N/A'}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Baron Participation</span>
                <span className="text-purple-400 font-medium">
                  {analysis?.baronParticipation || 'N/A'}%
                </span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div 
                  className="h-2 bg-orange-500 rounded-full transition-all duration-1000"
                  style={{width: `${Math.min(kpis.objectiveControl, 100)}%`}}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Performance Radar */}
        <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
          <h4 className="text-white font-medium mb-3">📈 Performance Analysis</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">{kpis.earlyGameImpact}%</div>
              <div className="text-xs text-slate-400">Early Impact</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">{kpis.lateGameImpact}%</div>
              <div className="text-xs text-slate-400">Late Impact</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">{kpis.visionDominance}%</div>
              <div className="text-xs text-slate-400">Vision Control</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">{kpis.objectiveControl}%</div>
              <div className="text-xs text-slate-400">Objectives</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
