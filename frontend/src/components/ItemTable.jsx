import { useState } from 'react';

function formatNum(num) {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat().format(num);
}

function formatVol(v) {
  if (!v) return '—';
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}k`;
  return v.toString();
}

function formatFill(hrs) {
  if (hrs === 0) return 'Instant';
  if (hrs < 1) return '<1 hr';
  if (hrs > 24) return '>24h';
  return `${hrs.toFixed(1)}h`;
}

export default function ItemTable({ items, loading, cashStack = 0 }) {
  const [sortConfig, setSortConfig] = useState({ key: 'dynamicProfit', direction: 'desc' });
  const [copiedId, setCopiedId] = useState(null);

  const getVal = (item, key) => {
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

  const handleCopy = (e, text, id, type) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text.toString());
    setCopiedId(`${id}-${type}`);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const arrow = (key) => sortConfig.key === key ? (sortConfig.direction === 'asc' ? ' ↑' : ' ↓') : '';

  const col = (label, key, extra = '') => (
    <th
      className={`p-4 cursor-pointer hover:text-white text-gray-400 font-medium text-sm whitespace-nowrap ${extra} select-none`}
      onClick={() => handleSort(key)}
      title={`Sort by ${label}`}
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
              {['Icon','Name','Buy Price','Sell Price','Margin','ROI %','Vol/hr','Limit','Fill Time','Dyn. Profit'].map(h => (
                <th key={h} className="p-4 text-gray-400 font-medium text-sm">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-t border-gray-800 animate-pulse">
                {[...Array(10)].map((_, j) => (
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
        <p className="text-gray-400">No items match your filters.</p>
      </div>
    );
  }

  const now = Math.floor(Date.now() / 1000);

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
              {col('Vol/hr', 'volume_1h')}
              {col(cashStack > 0 ? 'Affordable / Limit' : 'Limit', 'buy_limit')}
              {col('Fill Time', 'estFillHours')}
              {col('Dyn. Profit', 'dynamicProfit', 'text-amber-400')}
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item) => {
              const roi = item.roi || 0;
              const margin = item.margin || 0;
              const limit = item.buy_limit || 0;
              const affordableVol = item.affordableVol || 0;
              const dynamicProfit = item.dynamicProfit || 0;
              const estFill = item.estFillHours || 0;
              const vol = item.volume_1h || 0;

              // Freshness calculation
              const maxAge = Math.max(now - (item.high_time || 0), now - (item.low_time || 0));
              const ageMins = Math.floor(maxAge / 60);

              let dotClass = "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
              let statusTitle = `Fresh data (last trade ${ageMins}m ago)`;
              if (ageMins > 60) {
                dotClass = "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]";
                statusTitle = `Stale data (last trade ${ageMins}m ago)`;
              } else if (ageMins > 30) {
                dotClass = "bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]";
                statusTitle = `Warning: data ageing (last trade ${ageMins}m ago)`;
              }

              const rowClass = margin < 0
                ? 'bg-red-500/5 hover:bg-red-500/10'
                : roi >= 5
                  ? 'bg-emerald-500/5 hover:bg-emerald-500/10'
                  : 'hover:bg-gray-800/50';

              const iconUrl = item.icon
                ? `https://oldschool.runescape.wiki/images/${encodeURIComponent(item.icon.replace(/ /g, '_'))}`
                : '';

              const volColour = vol >= 1000 ? 'text-emerald-400' : vol >= 100 ? 'text-amber-400' : 'text-red-400';

              return (
                <tr key={item.id} className={`border-t border-gray-800 transition-colors ${rowClass}`}>
                  <td className="p-4">
                    {iconUrl
                      ? <img src={iconUrl} alt={item.name} className="w-8 h-8 object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
                      : <div className="w-8 h-8 bg-gray-800 rounded" />}
                  </td>
                  <td className="p-4 font-medium text-white max-w-xs truncate flex items-center gap-3">
                    <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotClass}`} title={statusTitle}></span>
                    {item.name}
                  </td>
                  <td 
                    className="p-4 text-amber-400 cursor-pointer hover:bg-gray-800 transition-colors relative group"
                    title="Click to copy exact GP amount"
                    onClick={(e) => handleCopy(e, item.buy_price, item.id, 'buy')}
                  >
                    {copiedId === `${item.id}-buy` 
                      ? <span className="text-emerald-400 font-bold">Copied!</span> 
                      : formatNum(item.buy_price)}
                  </td>
                  <td 
                    className="p-4 text-amber-400 cursor-pointer hover:bg-gray-800 transition-colors relative group"
                    title="Click to copy exact GP amount"
                    onClick={(e) => handleCopy(e, item.sell_price, item.id, 'sell')}
                  >
                    {copiedId === `${item.id}-sell` 
                      ? <span className="text-emerald-400 font-bold">Copied!</span> 
                      : formatNum(item.sell_price)}
                  </td>
                  <td className={`p-4 font-medium ${margin > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatNum(margin)}
                  </td>
                  <td className={`p-4 font-medium ${roi >= 5 ? 'text-emerald-400' : roi > 0 ? 'text-emerald-300' : 'text-red-400'}`}>
                    {roi.toFixed(1)}%
                  </td>
                  <td className={`p-4 font-medium ${volColour}`}>{formatVol(vol)}</td>
                  <td className="p-4 text-gray-300">
                    {cashStack > 0 ? (
                      <span title={`Affordable: ${affordableVol} / Total Limit: ${limit}`}>
                        <span className={affordableVol < limit ? "text-amber-400" : "text-emerald-400"}>
                          {formatNum(affordableVol)}
                        </span>
                        <span className="text-gray-600 mx-1">/</span>
                        {formatNum(limit)}
                      </span>
                    ) : (
                      formatNum(limit)
                    )}
                  </td>
                  <td className="p-4 text-gray-400 font-medium">{formatFill(estFill)}</td>
                  <td className="p-4 text-emerald-400 font-bold text-lg">{formatNum(dynamicProfit)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
