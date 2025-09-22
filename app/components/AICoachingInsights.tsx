interface CoachingInsight {
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  action: string;
  priority: 'high' | 'medium' | 'low';
}

interface AICoachingInsightsProps {
  insights: {
    insights: CoachingInsight[];
    patterns: any[];
    recommendations: any[];
  } | null;
}

export function AICoachingInsights({ insights }: AICoachingInsightsProps) {
  if (!insights || !insights.insights?.length) {
    return (
      <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 p-6">
        <h2 className="text-xl font-bold text-white mb-4">🤖 AI Coaching Insights</h2>
        <div className="text-slate-400 text-center py-8">
          <div className="text-4xl mb-4">🔄</div>
          <p>Analyzing your gameplay patterns...</p>
          <p className="text-sm mt-2">AI insights will appear after processing recent matches.</p>
        </div>
      </div>
    );
  }

  const priorityOrder = { high: 3, medium: 2, low: 1 };
  const sortedInsights = [...insights.insights].sort((a, b) => 
    priorityOrder[b.priority] - priorityOrder[a.priority]
  );

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '💡';
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'success': return 'border-green-500/20 bg-green-500/10';
      case 'warning': return 'border-yellow-500/20 bg-yellow-500/10';
      case 'error': return 'border-red-500/20 bg-red-500/10';
      default: return 'border-blue-500/20 bg-blue-500/10';
    }
  };

  const getTextColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700/50 overflow-hidden">
      <div className="p-6 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">🤖 AI Coaching Insights</h2>
          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
            Real-time Analysis
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <div className="space-y-4">
          {sortedInsights.slice(0, 5).map((insight, index) => (
            <div 
              key={index}
              className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{getInsightIcon(insight.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className={`font-semibold ${getTextColor(insight.type)}`}>
                      {insight.title}
                    </h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      insight.priority === 'high' 
                        ? 'bg-red-500/20 text-red-400' 
                        : insight.priority === 'medium'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-slate-500/20 text-slate-400'
                    }`}>
                      {insight.priority}
                    </span>
                  </div>
                  <p className="text-slate-300 text-sm mb-2">{insight.message}</p>
                  <p className="text-slate-400 text-xs">
                    <strong>Action:</strong> {insight.action}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {insights.patterns?.length > 0 && (
          <div className="mt-6 p-4 bg-slate-700/30 rounded-lg">
            <h4 className="text-white font-medium mb-2">📊 Detected Patterns</h4>
            <div className="text-sm text-slate-300">
              {insights.patterns.slice(0, 3).map((pattern, idx) => (
                <div key={idx} className="mb-1">• {pattern}</div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
