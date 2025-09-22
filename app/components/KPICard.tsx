interface KPICardProps {
  title: string;
  value: string;
  subtitle: string;
  trend: string;
  color: 'green' | 'yellow' | 'red' | 'blue';
  advanced?: boolean;
}

export function KPICard({ title, value, subtitle, trend, color, advanced }: KPICardProps) {
  const colorClasses = {
    green: 'text-green-400',
    yellow: 'text-yellow-400', 
    red: 'text-red-400',
    blue: 'text-blue-400'
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 border border-slate-700/50 hover:border-slate-600/50 transition-all relative">
      {advanced && (
        <div className="absolute top-2 right-2">
          <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">AI</span>
        </div>
      )}
      
      <div className="text-center">
        <div className={`text-2xl font-bold mb-1 ${colorClasses[color]}`}>
          {value}
        </div>
        <div className="text-xs text-slate-400 mb-1">{title}</div>
        <div className="text-xs text-slate-500 mb-2">{subtitle}</div>
        <div className={`text-xs ${colorClasses[color]}`}>
          {trend}
        </div>
      </div>
    </div>
  );
}
