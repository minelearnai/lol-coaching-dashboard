'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function RefreshButton() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    
    // Trigger server-side refresh
    await fetch('/api/revalidate', { method: 'POST' });
    router.refresh();
    
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={isRefreshing}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
    >
      {isRefreshing ? '🔄' : '↻'} 
      {isRefreshing ? 'Updating...' : 'Refresh Data'}
    </button>
  );
}
