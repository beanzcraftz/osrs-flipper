import { useState } from 'react';

function formatNum(num) {
  return new Intl.NumberFormat().format(num);
}

function formatVol(v) {
  if (!v) return '—';
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`;
  return v.toString();
}

export default function ItemTable({ items, loading }) {
  const [sortConfig, setSortConfig] = useState({ key: 'potential_profit', direction: 'desc' });

  const getVal = (item, key) => {
    if (key === 'potential_profit') return (item.margin || 0) * (item.buy_limit || 0);
    return item[key] !== undefined && item[key] !== null ? item[key] : 0;
  };

  const sortedItems = [...(items || [])].sort((a, b) => {
    const aVal = getVal(a, sortConfig.key);
    const bVal = getVal(b, sortConfig.key);
    return sortConfig.direction === 'asc' ? (aVal < bVal ? -1 : aVal > bVal ? 1 : 0)
                                           : (aVal > bVal ? -1 : aVal < bVal ? 1 : 0);
  });

  const handleSort = (key) => {
    setSortConfig(c => ({ key, direction: c.key === key && c.direction === 'desc' ? 'asc' : 'desc' }));
  };

  const arrow = (key) => sortConfig.key === key ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : '';

  const col = (label, key, extra = '') => (
    <th
      className={`p-4 cursor-pointer hover:text-white text-gray-400 font-medium text-sm whitespace-nowrap ${extra}`}
      onClick={() => handleSort(key)}
    >
      {label}{arrow(key)}
    </th>
  );

  if (loading && sortedItems.length === 0) {
    return (
      <div className="bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800">
        <table className="w-full text-left">
          <thead className="bg-gray-900">
            <tr>
              {['Icon','Name','Buy Price','Sell Price','Margin','ROI %','Limit','Vol/hr','Potential Profit'].map(h => (
                <th key={h} className="p-4 text-gray-400 font-medium text-sm">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-t border-gray-800 animate-pulse">
                {[...Array(9)].map((_, j) => (
                  <td key={j} className="p-4"><div className="h-4 bg-gray-800 rounded w-16"></div></td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (sortedItems.length === 0) {
    return (
      <div className="bg-gray-900/50 rounded-xl p-8 text-center border border-gray-800">
        <p className="text-gray-400">No items match your filters. Try lowering the Volume/hr threshold.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-gray-900 sticky top-0 z-10">
            <tr>
              <th className="p-4 w-12">Icon</th>
              {col('Name', 'name')}
              {col('Buy Price', 'buy_price')}
              {col('Sell Price', 'sell_price')}
              {col('Margin', 'margin')}
              {col('ROI %', 'roi')}
              {col('Limit', 'buy_limit')}
              {col('Vol/hr', 'volume_1h')}
              {col('Potential Profit', 'potential_profit', 'text-amber-400')}
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item) => {
              const roi = item.roi || 0;
              const margin = item.margin || 0;
              const potentialProfit = margin * (item.buy_limit || 0);
              const vol = item.volume_1h || 0;

              const rowClass = margin < 0
                ? 'bg-red-500/5 hover:bg-red-500/10'
                : roi >= 5
                  ? 'bg-emerald-500/5 hover:bg-emerald-500/10'
                  : 'hover:bg-gray-800/50';

              const iconUrl = item.icon
                ? `https://oldschool.runescape.wiki/images/${encodeURIComponent(item.icon.replace(/ /g, '_'))}`
                : '';

              // Volume badge colour
              const volColour = vol >= 1000 ? 'text-emerald-400'
                : vol >= 100 ? 'text-amber-400'
                : 'text-red-400';

              return (
                <tr key={item.id} className={`border-t border-gray-800 transition-colors ${rowClass}`}>
                  <td className="p-4">
                    {iconUrl
                      ? <img src={iconUrl} alt={item.name} className="w-8 h-8 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                      : <div className="w-8 h-8 bg-gray-800 rounded" />}
                  </td>
                  <td className="p-4 font-medium text-white max-w-xs truncate">{item.name}</td>
                  <td className="p-4 text-amber-400">{formatNum(item.buy_price)}</td>
                  <td className="p-4 text-amber-400">{formatNum(item.sell_price)}</td>
                  <td className={`p-4 font-medium ${margin > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatNum(margin)}
                  </td>
                  <td className={`p-4 font-medium ${roi >= 5 ? 'text-emerald-400' : roi > 0 ? 'text-emerald-300' : 'text-red-400'}`}>
                    {roi.toFixed(1)}%
                  </td>
                  <td className="p-4 text-gray-300">{formatNum(item.buy_limit || 0)}</td>
                  <td className={`p-4 font-medium ${volColour}`}>{formatVol(vol)}</td>
                  <td className="p-4 text-emerald-400 font-bold">{formatNum(potentialProfit)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
