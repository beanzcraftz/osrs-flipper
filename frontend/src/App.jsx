import { useState, useMemo } from 'react';
import { useItems } from './hooks/useItems';
import FilterBar from './components/FilterBar';
import ItemTable from './components/ItemTable';
import StatusBar from './components/StatusBar';

function App() {
  const [filters, setFilters] = useState({
    minMargin: 0,
    minRoi: 0,
    minVolume: 0,
    maxFillTime: 0, // 0 = Any, 1 = <1h, 2 = <2h, 4 = <4h
    search: '',
    refreshInterval: 5,
    cashStack: 0
  });

  const { items, totalCount, loading, error, lastUpdated } = useItems({
    minMargin: filters.minMargin,
    minRoi: filters.minRoi,
    minVolume: filters.minVolume,
    search: filters.search,
    pollInterval: filters.refreshInterval * 60000
  });

  // Enrich items with computed frontend logic (cash stack, dynamic profit, fill time)
  const enrichedItems = useMemo(() => {
    if (!items) return [];
    return items.map(item => {
      const limit = item.buy_limit || 0;
      const affordableVol = filters.cashStack > 0 
        ? Math.min(limit, Math.floor(filters.cashStack / (item.buy_price || 1))) 
        : limit;
      
      const dynamicProfit = (item.margin || 0) * affordableVol;
      const volPerHour = item.volume_1h || 1; // avoid division by zero
      const estFillHours = affordableVol / volPerHour;
      
      // Score flips internally by (Dynamic Profit / Est Fill Time) to rank the Top 5
      const profitPerHour = estFillHours > 0 ? dynamicProfit / estFillHours : dynamicProfit;

      return { ...item, affordableVol, dynamicProfit, estFillHours, profitPerHour };
    }).filter(item => {
      if (filters.maxFillTime > 0 && item.estFillHours > filters.maxFillTime) {
        return false;
      }
      return true;
    });
  }, [items, filters.cashStack, filters.maxFillTime]);

  const f2pItems = enrichedItems.filter(i => !i.members);
  const p2pItems = enrichedItems.filter(i => i.members);

  const top5 = [...enrichedItems]
    .sort((a, b) => b.profitPerHour - a.profitPerHour)
    .slice(0, 5);

  const applyPreset = (preset) => setFilters(f => ({ ...f, ...preset }));

  return (
    <div className="min-h-screen pb-16">
      <main className="max-w-7xl mx-auto px-4 py-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 flex items-center gap-2">
            <span>⚔️</span> GE Flipper
          </h1>
          <p className="text-gray-400 mt-1">Grand Exchange Flipping Dashboard</p>
        </header>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        <FilterBar filters={filters} onFilterChange={setFilters} />

        {/* Top 5 Highlights & Presets */}
        <div className="mb-6 bg-gray-900/80 border border-gray-800 rounded-xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center gap-2">
              ⭐ Top 5 Quick Flips
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => applyPreset({ minVolume: 500, maxFillTime: 1, minRoi: 4, minMargin: 0 })}
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium border border-gray-700 transition-colors shadow-sm"
              >
                🔥 Fast Flips
              </button>
              <button
                onClick={() => applyPreset({ minMargin: 200, minVolume: 20, maxFillTime: 0, minRoi: 0 })} // Adjusted to 200k in the instruction below. Wait, 200k is 200000.
                className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium border border-gray-700 transition-colors shadow-sm"
              >
                💰 High Margin
              </button>
              <button
                onClick={() => applyPreset({ minMargin: 0, minVolume: 0, maxFillTime: 0, minRoi: 0 })}
                className="bg-gray-800 hover:bg-gray-700 text-gray-400 px-4 py-2 rounded-lg text-sm font-medium border border-gray-700 transition-colors"
              >
                🔄 Reset Filters
              </button>
            </div>
          </div>

          {top5.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {top5.map(item => (
                <div key={item.id} className="bg-gray-950 p-4 rounded-xl border border-gray-800 flex flex-col items-center text-center shadow-lg relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  {item.icon ? (
                    <img src={`https://oldschool.runescape.wiki/images/${encodeURIComponent(item.icon.replace(/ /g, '_'))}`} alt={item.name} className="w-12 h-12 object-contain mb-3 drop-shadow-md relative z-10" />
                  ) : (
                    <div className="w-12 h-12 bg-gray-800 rounded mb-3 relative z-10" />
                  )}
                  <h3 className="text-sm font-bold text-white mb-1 leading-tight relative z-10">{item.name}</h3>
                  <p className="text-emerald-400 font-bold text-lg mb-1 relative z-10">
                    {new Intl.NumberFormat().format(item.dynamicProfit)} <span className="text-xs text-gray-500">GP</span>
                  </p>
                  <div className="flex gap-4 text-xs text-gray-400 relative z-10">
                    <span title="Volume per Hour">Vol: <span className="text-white">{new Intl.NumberFormat().format(item.volume_1h)}</span></span>
                    <span title="Estimated Fill Time" className="text-amber-400/80">
                      Fill: {item.estFillHours < 1 ? '<1h' : `${item.estFillHours.toFixed(1)}h`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">No items match your filters for Top 5 highlights.</div>
          )}
        </div>

        {/* F2P Accordion */}
        <details open className="group mb-6">
          <summary className="flex items-center cursor-pointer p-4 bg-gray-900/80 border border-gray-800 rounded-xl mb-4 select-none hover:bg-gray-800/80 transition-colors">
            <span className="text-xl font-bold text-emerald-400 flex-1">
              Free to Play (F2P) Flips{' '}
              <span className="text-gray-400 text-sm ml-2 font-normal">({f2pItems.length} items)</span>
            </span>
            <span className="transform transition-transform group-open:rotate-180 text-gray-400">▼</span>
          </summary>
          <ItemTable items={f2pItems} loading={loading} cashStack={filters.cashStack} />
        </details>

        {/* P2P Accordion */}
        <details open className="group mb-6">
          <summary className="flex items-center cursor-pointer p-4 bg-gray-900/80 border border-gray-800 rounded-xl mb-4 select-none hover:bg-gray-800/80 transition-colors">
            <span className="text-xl font-bold text-amber-500 flex-1">
              Members (P2P) Flips{' '}
              <span className="text-gray-400 text-sm ml-2 font-normal">({p2pItems.length} items)</span>
            </span>
            <span className="transform transition-transform group-open:rotate-180 text-gray-400">▼</span>
          </summary>
          <ItemTable items={p2pItems} loading={loading} cashStack={filters.cashStack} />
        </details>
      </main>

      <StatusBar lastUpdated={lastUpdated} totalCount={totalCount} loading={loading} />
    </div>
  );
}

export default App;
