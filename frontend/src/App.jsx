import { useState } from 'react';
import { useItems } from './hooks/useItems';
import FilterBar from './components/FilterBar';
import ItemTable from './components/ItemTable';
import StatusBar from './components/StatusBar';

function App() {
  const [filters, setFilters] = useState({
    minMargin: 0,
    minRoi: 0,
    minVolume: 0,
    search: '',
    refreshInterval: 5,
    cashStack: 0 // 0 = unlimited
  });

  const { items, totalCount, loading, error, lastUpdated } = useItems({
    minMargin: filters.minMargin,
    minRoi: filters.minRoi,
    minVolume: filters.minVolume,
    search: filters.search,
    pollInterval: filters.refreshInterval * 60000
  });

  const f2pItems = items ? items.filter(i => !i.members) : [];
  const p2pItems = items ? items.filter(i => i.members) : [];

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
