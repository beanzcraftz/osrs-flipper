import { useState, useEffect } from 'react';

export default function StatusBar({ lastUpdated, totalCount, loading }) {
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    if (!lastUpdated) return;
    
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((new Date() - lastUpdated) / 1000));
    }, 1000);
    
    // Immediate update
    setSecondsAgo(Math.floor((new Date() - lastUpdated) / 1000));
    
    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900/90 backdrop-blur border-t border-gray-800 px-6 py-2 flex justify-between items-center text-sm z-10">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {loading ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          ) : (
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          )}
          <span className="text-gray-400">
            {loading ? 'Refreshing...' : `Last updated: ${secondsAgo} seconds ago`}
          </span>
        </div>
      </div>
      <div className="text-gray-400">
        Total Items: <span className="text-white font-medium">{new Intl.NumberFormat().format(totalCount)}</span>
      </div>
    </div>
  );
}
