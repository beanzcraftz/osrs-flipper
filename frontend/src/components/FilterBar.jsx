import { useState, useEffect } from 'react';

export default function FilterBar({ filters, onFilterChange }) {
  const [searchValue, setSearchValue] = useState(filters.search);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({ ...filters, search: searchValue });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchValue, filters, onFilterChange]);

  const handleMarginChange = (e) => {
    onFilterChange({ ...filters, minMargin: parseInt(e.target.value, 10) });
  };

  const handleRoiChange = (e) => {
    onFilterChange({ ...filters, minRoi: parseFloat(e.target.value) });
  };

  const formatNumber = (num) => new Intl.NumberFormat().format(num);

  return (
    <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-xl p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">Search</label>
          <div className="relative">
            <input
              type="text"
              placeholder="🔍 Search items..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Min Margin: <span className="text-amber-500">{formatNumber(filters.minMargin)} GP</span>
          </label>
          <input
            type="range"
            min="0"
            max="50000"
            step="100"
            value={filters.minMargin}
            onChange={handleMarginChange}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Min ROI: <span className="text-amber-500">{filters.minRoi.toFixed(1)}%</span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="0.5"
            value={filters.minRoi}
            onChange={handleRoiChange}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
