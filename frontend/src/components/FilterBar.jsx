import { useState, useEffect } from 'react';

const VOLUME_STEPS = [0, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

function formatVolume(v) {
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`;
  return v.toString();
}

function formatNum(num) {
  if (!num) return '';
  return new Intl.NumberFormat().format(num);
}

export default function FilterBar({ filters, onFilterChange }) {
  const [search, setSearch] = useState(filters.search);
  const [cashInput, setCashInput] = useState(filters.cashStack ? formatNum(filters.cashStack) : '');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== filters.search) {
        onFilterChange({ ...filters, search });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search, filters, onFilterChange]);

  const handleCashBlur = () => {
    if (!cashInput || cashInput.trim() === '') {
      onFilterChange({ ...filters, cashStack: 0 });
      setCashInput('');
      return;
    }

    const match = cashInput.trim().match(/^([\d.,]+)\s*([kmb])?$/i);
    if (!match) {
      const parsed = parseFloat(cashInput.replace(/,/g, ''));
      const val = !isNaN(parsed) && parsed > 0 ? parsed : 0;
      onFilterChange({ ...filters, cashStack: val });
      setCashInput(val > 0 ? val.toLocaleString() : '');
      return;
    }

    const numStr = match[1].replace(/,/g, '');
    const suffix = match[2] ? match[2].toLowerCase() : '';
    let num = parseFloat(numStr);

    if (isNaN(num) || num <= 0) {
      onFilterChange({ ...filters, cashStack: 0 });
      setCashInput('');
      return;
    }

    if (suffix === 'b') num *= 1000000000;
    else if (suffix === 'm') num *= 1000000;
    else if (suffix === 'k') num *= 1000;

    const finalInt = Math.floor(num);
    onFilterChange({ ...filters, cashStack: finalInt });
    setCashInput(finalInt.toLocaleString());
  };

  const handleCashKey = (e) => {
    if (e.key === 'Enter') e.target.blur();
  };

  const volIndex = VOLUME_STEPS.indexOf(filters.minVolume) === -1 ? 0 : VOLUME_STEPS.indexOf(filters.minVolume);

  return (
    <div className="bg-gray-900/80 backdrop-blur border border-gray-800 rounded-xl p-6 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-6">

        {/* Search */}
        <div className="flex flex-col justify-center lg:col-span-1">
          <label className="text-sm text-gray-400 mb-2">Search Items</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="e.g. whip"
              className="w-full bg-gray-950 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* Cash Stack */}
        <div className="flex flex-col justify-center lg:col-span-1">
          <label className="text-sm text-gray-400 mb-2">Cash Stack (e.g. 10m)</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">💰</span>
            <input
              type="text"
              value={cashInput}
              onChange={(e) => setCashInput(e.target.value)}
              onBlur={handleCashBlur}
              onKeyDown={handleCashKey}
              placeholder="0 = Unlimited"
              className="w-full bg-gray-950 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
        </div>

        {/* Min Margin */}
        <div className="flex flex-col lg:col-span-1">
          <label className="text-sm text-gray-400 mb-2 flex justify-between">
            <span>Min Margin</span>
            <span className="text-amber-400 font-medium">{formatNum(filters.minMargin)}</span>
          </label>
          <input
            type="range" min="0" max="50000" step="100"
            value={filters.minMargin}
            onChange={(e) => onFilterChange({ ...filters, minMargin: Number(e.target.value) })}
            className="w-full mt-2"
          />
        </div>

        {/* Min ROI */}
        <div className="flex flex-col lg:col-span-1">
          <label className="text-sm text-gray-400 mb-2 flex justify-between">
            <span>Min ROI</span>
            <span className="text-amber-400 font-medium">{filters.minRoi}%</span>
          </label>
          <input
            type="range" min="0" max="100" step="0.5"
            value={filters.minRoi}
            onChange={(e) => onFilterChange({ ...filters, minRoi: Number(e.target.value) })}
            className="w-full mt-2"
          />
        </div>

        {/* Min Volume (1h) */}
        <div className="flex flex-col lg:col-span-1">
          <label className="text-sm text-gray-400 mb-2 flex justify-between">
            <span>Min Vol/hr</span>
            <span className="text-amber-400 font-medium">
              {filters.minVolume === 0 ? 'Any' : `≥ ${formatVolume(filters.minVolume)}`}
            </span>
          </label>
          <input
            type="range" min="0" max={VOLUME_STEPS.length - 1} step="1"
            value={volIndex}
            onChange={(e) => onFilterChange({ ...filters, minVolume: VOLUME_STEPS[Number(e.target.value)] })}
            className="w-full mt-2"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>Any</span>
            <span>10k+</span>
          </div>
        </div>

        {/* Max Fill Time */}
        <div className="flex flex-col lg:col-span-1">
          <label className="text-sm text-gray-400 mb-2 flex justify-between">
            <span>Max Fill Time</span>
            <span className="text-amber-400 font-medium">
              {filters.maxFillTime === 0 ? 'Any' : `< ${filters.maxFillTime} hr`}
            </span>
          </label>
          <input
            type="range" min="0" max="3" step="1"
            value={filters.maxFillTime === 4 ? 3 : filters.maxFillTime}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              const hrs = val === 0 ? 0 : val === 1 ? 1 : val === 2 ? 2 : 4;
              onFilterChange({ ...filters, maxFillTime: hrs });
            }}
            className="w-full mt-2"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>Any</span>
            <span>&lt;4h</span>
          </div>
        </div>

        {/* Auto Refresh */}
        <div className="flex flex-col lg:col-span-1">
          <label className="text-sm text-gray-400 mb-2 flex justify-between">
            <span>Auto-Refresh</span>
            <span className="text-amber-400 font-medium">{filters.refreshInterval} min</span>
          </label>
          <input
            type="range" min="1" max="10" step="1"
            value={filters.refreshInterval}
            onChange={(e) => onFilterChange({ ...filters, refreshInterval: Number(e.target.value) })}
            className="w-full mt-2"
          />
        </div>

      </div>
    </div>
  );
}
