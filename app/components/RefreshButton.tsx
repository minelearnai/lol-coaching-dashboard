'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface RefreshState {
  status: 'idle' | 'fetching' | 'processing' | 'success' | 'error';
  progress: number;
  message: string;
  gamesFound: number;
  gamesAdded: number;
}

export function RefreshButton() {
  const router = useRouter();
  const [refresh, setRefresh] = useState<RefreshState>({
    status: 'idle',
    progress: 0,
    message: '',
    gamesFound: 0,
    gamesAdded: 0
  });

  const handleRefresh = async () => {
    setRefresh({ 
      status: 'fetching', 
      progress: 10, 
      message: 'Connecting to Riot API...',
      gamesFound: 0,
      gamesAdded: 0 
    });

    try {
      const response = await fetch('/api/refresh-games', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = JSON.parse(line.slice(6));
            setRefresh(prev => ({
              ...prev,
              ...data
            }));
          }
        }
      }

      // Refresh dashboard after 2 seconds
      setTimeout(() => {
        router.refresh();
        setRefresh(prev => ({ ...prev, status: 'idle', message: '' }));
      }, 2000);

    } catch (error) {
      setRefresh({
        status: 'error',
        progress: 0,
        message: `❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        gamesFound: 0,
        gamesAdded: 0
      });

      setTimeout(() => {
        setRefresh(prev => ({ ...prev, status: 'idle', message: '' }));
      }, 5000);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        onClick={handleRefresh}
        disabled={refresh.status !== 'idle'}
        className={`
          px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg
          ${refresh.status === 'idle' 
            ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl hover:scale-105' 
            : 'bg-slate-600 text-slate-300 cursor-not-allowed'
          }
        `}
      >
        {refresh.status === 'idle' && '🔄 Update Games'}
        {refresh.status === 'fetching' && '🌐 Fetching from Riot...'}
        {refresh.status === 'processing' && '⚙️ Processing...'}
        {refresh.status === 'success' && '✅ Success!'}
        {refresh.status === 'error' && '❌ Failed'}
      </button>

      {refresh.status !== 'idle' && (
        <div className="w-full max-w-sm space-y-3">
          {/* Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${refresh.progress}%` }}
            />
          </div>
          
          {/* Status Message */}
          <p className="text-sm text-slate-300 text-center">
            {refresh.message}
          </p>
          
          {/* Games Counter */}
          {refresh.gamesFound > 0 && (
            <p className="text-xs text-slate-400 text-center">
              Found: {refresh.gamesFound} games • Added: {refresh.gamesAdded} new
            </p>
          )}
        </div>
      )}
    </div>
  );
}
