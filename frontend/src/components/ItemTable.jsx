import { useState } from 'react';

export default function ItemTable({ items, loading }) {
  const [sortConfig, setSortConfig] = useState({ key: 'roi', direction: 'desc' });

  const formatNumber = (num) => new Intl.NumberFormat().format(num);

  const getSortedItems = () => {
    if (!items) return [];
    
    return [...items].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  const handleSort = (key) => {
    let direction = 'desc';
    if (sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };

  const sortedItems = getSortedItems();

  if (loading && (!items || items.length === 0)) {
    return (
      <div className="bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800">
        <table className="w-full text-left">
          <thead className="bg-gray-900">
            <tr>
              {['Icon', 'Name', 'Buy Price', 'Sell Price', 'Margin', 'ROI %', 'Limit', 'Members'].map(h => (
                <th key={h} className="p-4 text-gray-400 font-medium text-sm">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(10)].map((_, i) => (
              <tr key={i} className="border-t border-gray-800 animate-pulse">
                <td className="p-4"><div className="w-8 h-8 bg-gray-800 rounded"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-800 rounded w-24"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-800 rounded w-16"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-800 rounded w-16"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-800 rounded w-16"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-800 rounded w-12"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-800 rounded w-12"></div></td>
                <td className="p-4"><div className="h-6 bg-gray-800 rounded-full w-12"></div></td>
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
        <p className="text-gray-400">No items match your filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 rounded-xl overflow-hidden border border-gray-800">
      <div className="overflow-x-auto">
        <table className="w-full text-left whitespace-nowrap">
          <thead className="bg-gray-900 sticky top-0">
            <tr>
              <th className="p-4 w-12">Icon</th>
              <th className="p-4 cursor-pointer hover:text-white text-gray-400 font-medium text-sm" onClick={() => handleSort('name')}>
                Name{getSortIndicator('name')}
              </th>
              <th className="p-4 cursor-pointer hover:text-white text-gray-400 font-medium text-sm" onClick={() => handleSort('buy_price')}>
                Buy Price{getSortIndicator('buy_price')}
              </th>
              <th className="p-4 cursor-pointer hover:text-white text-gray-400 font-medium text-sm" onClick={() => handleSort('sell_price')}>
                Sell Price{getSortIndicator('sell_price')}
              </th>
              <th className="p-4 cursor-pointer hover:text-white text-gray-400 font-medium text-sm" onClick={() => handleSort('margin')}>
                Margin{getSortIndicator('margin')}
              </th>
              <th className="p-4 cursor-pointer hover:text-white text-gray-400 font-medium text-sm" onClick={() => handleSort('roi')}>
                ROI %{getSortIndicator('roi')}
              </th>
              <th className="p-4 cursor-pointer hover:text-white text-gray-400 font-medium text-sm" onClick={() => handleSort('buy_limit')}>
                Limit{getSortIndicator('buy_limit')}
              </th>
              <th className="p-4 cursor-pointer hover:text-white text-gray-400 font-medium text-sm" onClick={() => handleSort('members')}>
                Members{getSortIndicator('members')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item) => {
              const roi = item.roi || 0;
              const margin = item.margin || 0;
              const rowClass = margin < 0 
                ? 'bg-red-500/5 hover:bg-red-500/10' 
                : roi >= 5 
                  ? 'bg-emerald-500/5 hover:bg-emerald-500/10' 
                  : 'hover:bg-gray-800/50';

              const iconUrl = item.icon 
                ? `https://oldschool.runescape.wiki/images/${encodeURIComponent(item.icon.replace(/ /g, '_'))}`
                : '';

              return (
                <tr key={item.id} className={`border-t border-gray-800 transition-colors ${rowClass}`}>
                  <td className="p-4">
                    {iconUrl ? (
                      <img src={iconUrl} alt={item.name} className="w-8 h-8 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : (
                      <div className="w-8 h-8 bg-gray-800 rounded"></div>
                    )}
                  </td>
                  <td className="p-4 font-medium text-white">{item.name}</td>
                  <td className="p-4 text-amber-400">{formatNumber(item.buy_price)}</td>
                  <td className="p-4 text-amber-400">{formatNumber(item.sell_price)}</td>
                  <td className={`p-4 font-medium ${margin > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatNumber(margin)}
                  </td>
                  <td className={`p-4 font-medium ${roi >= 5 ? 'text-emerald-400' : roi > 0 ? 'text-emerald-300' : 'text-red-400'}`}>
                    {roi.toFixed(1)}%
                  </td>
                  <td className="p-4 text-gray-300">{formatNumber(item.buy_limit)}</td>
                  <td className="p-4">
                    {item.members ? (
                      <span className="bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded text-xs font-medium border border-emerald-500/20">P2P</span>
                    ) : (
                      <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs font-medium border border-gray-600">F2P</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
