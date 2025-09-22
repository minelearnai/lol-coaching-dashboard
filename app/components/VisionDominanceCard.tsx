interface VisionDominanceCardProps {
  visionScore: number;
}

export function VisionDominanceCard({ visionScore }: VisionDominanceCardProps) {
  const getVisionGrade = (score: number) => {
    if (score >= 80) return { grade: 'S+', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    if (score >= 70) return { grade: 'S', color: 'text-green-400', bg: 'bg-green-500/10' };
    if (score >= 60) return { grade: 'A', color: 'text-blue-400', bg: 'bg-blue-500/10' };
    if (score >= 50) return { grade: 'B', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    return { grade: 'C', color: 'text-red-400', bg: 'bg-red-500/10' };
  };

  const vision = getVisionGrade(visionScore);

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
      <h3 className="text-lg font-semibold text-white mb-4">👁️ Vision Dominance</h3>
      
      <div className="text-center mb-4">
        <div className={`text-4xl font-bold mb-2 ${vision.color}`}>
          {vision.grade}
        </div>
        <div className="text-2xl font-bold text-white mb-1">
          {visionScore}%
        </div>
        <div className="text-sm text-slate-400">Vision Control Score</div>
      </div>

      <div className="space-y-3">
        <div className="w-full bg-slate-700 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-1000 ${
              visionScore >= 70 ? 'bg-green-500' : 
              visionScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{width: `${Math.min(visionScore, 100)}%`}} 
          />
        </div>
        
        <div className={`p-3 rounded-lg ${vision.bg} border border-slate-600/20`}>
          <div className={`text-sm font-medium mb-1 ${vision.color}`}>
            {visionScore >= 70 ? '🌟 Excellent Vision Control' :
             visionScore >= 50 ? '✅ Good Vision Awareness' : '⚠️ Improve Vision Game'}
          </div>
          <div className="text-xs text-slate-300">
            {visionScore >= 70 ? 'You dominate vision control! Keep up the excellent ward placement.' :
             visionScore >= 50 ? 'Solid vision game. Focus on deeper wards in enemy jungle.' : 
             'Focus on vision fundamentals: ward river, enemy jungle entrances.'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="text-center">
            <div className="text-slate-400">Target Score</div>
            <div className="text-white font-medium">70%+</div>
          </div>
          <div className="text-center">
            <div className="text-slate-400">Vision/Min</div>
            <div className="text-blue-400 font-medium">1.5+</div>
          </div>
        </div>
      </div>
    </div>
  );
}
