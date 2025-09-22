import { useEffect, useState } from 'react';

export function useGameData(refreshInterval = 30000) {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchGames = async () => {
      try {
        const response = await fetch('/api/games');
        const data = await response.json();
        setGames(data);
      } catch (error) {
        console.error('Failed to fetch games:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchGames();
    const interval = setInterval(fetchGames, refreshInterval);
    
    return () => clearInterval(interval);
  }, [refreshInterval]);
  
  return { games, loading };
}