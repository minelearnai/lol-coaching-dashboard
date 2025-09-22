interface KPICardProps {
  title: string;
  value: string | number;
  change: number;
  target?: number;
  format?: 'percentage' | 'number' | 'decimal';
}

export function KPICard({ title, value, change, target, format }: KPICardProps) {
  const isGood = change > 0;
  const isOnTarget = target ? (typeof value === 'number' ? value >= target : false) : true;
  
  return (
    <div className={`p-6 rounded-lg shadow-lg ${isOnTarget ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border`}>
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">
          {format === 'percentage' ? `${value}%` : 
           format === 'decimal' ? Number(value).toFixed(1) : value}
        </p>
        <span className={`ml-2 text-sm ${isGood ? 'text-green-600' : 'text-red-600'}`}>
          {change > 0 ? '↗' : '↘'} {Math.abs(change)}
        </span>
      </div>
      {target && (
        <p className="mt-1 text-xs text-gray-500">Target: {target}</p>
      )}
    </div>
  );
}
