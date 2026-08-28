const API_BASE = import.meta.env.VITE_API_URL || '';

export async function fetchItems({ minMargin = 0, minRoi = 0, minVolume = 0, search = '' } = {}) {
  const params = new URLSearchParams();
  if (minMargin > 0) params.set('min_margin', minMargin);
  if (minRoi > 0) params.set('min_roi', minRoi);
  if (minVolume > 0) params.set('min_volume', minVolume);
  if (search) params.set('search', search);

  const res = await fetch(`${API_BASE}/api/items?${params}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
