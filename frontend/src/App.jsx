import { useState } from 'react';
import { useItems } from './hooks/useItems';
import FilterBar from './components/FilterBar';
import ItemTable from './components/ItemTable';
import StatusBar from './components/StatusBar';

function App() {
  const [filters, setFilters] = useState({ minMargin: 0, minRoi: 0, search: '' });
  const { items, totalCount, loading, error, lastUpdated } = useItems({ 
    minMargin: filters.minMargin, 
    minRoi: filters.minRoi, 
    search: filters.search 
  });

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
        
        <ItemTable items={items} loading={loading} />
      </main>

      <StatusBar 
        lastUpdated={lastUpdated} 
        totalCount={totalCount} 
        loading={loading} 
      />
    </div>
  );
}

export default App;
