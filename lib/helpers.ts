/**
 * Haversine formula to calculate distance between two lat/lng points in km.
 */
export function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Calculate DLP status from a defectLiabilityEndDate string.
 */
export function getDlpStatus(defectLiabilityEndDate: string): {
  status: 'active' | 'expiring' | 'expired';
  daysLeft: number;
} {
  const today = new Date();
  const dlpEnd = new Date(defectLiabilityEndDate);
  const daysLeft = Math.ceil((dlpEnd.getTime() - today.getTime()) / 86400000);

  let status: 'active' | 'expiring' | 'expired';
  if (daysLeft > 30) status = 'active';
  else if (daysLeft > 0) status = 'expiring';
  else status = 'expired';

  return { status, daysLeft };
}

/**
 * Get a colour class for the DLP status.
 */
export function getDlpColor(status: 'active' | 'expiring' | 'expired'): string {
  return status === 'active'
    ? 'green'
    : status === 'expiring'
    ? 'amber'
    : 'red';
}

/**
 * Format a value in INR crores.
 */
export function formatCrore(value: number): string {
  const crore = value / 10_000_000;
  if (crore >= 1) return `₹${crore.toFixed(2)} Cr`;
  const lakh = value / 100_000;
  if (lakh >= 1) return `₹${lakh.toFixed(2)} L`;
  return `₹${value.toLocaleString('en-IN')}`;
}

export function getCategoryIcon(category: string): string {
  const lower = (category || '').toLowerCase();
  if (lower.includes('building') || lower.includes('construction') || lower.includes('civil')) return '🏢';
  if (lower.includes('road') || lower.includes('highway') || lower.includes('bridge') || lower.includes('flyover')) return '🛣️';
  if (lower.includes('water') || lower.includes('drain') || lower.includes('sewer') || lower.includes('sanitation')) return '💧';
  if (lower.includes('metro') || lower.includes('transit') || lower.includes('rail') || lower.includes('bus')) return '🚇';
  if (lower.includes('park') || lower.includes('lake') || lower.includes('eco') || lower.includes('amenities')) return '🌳';
  if (lower.includes('electric') || lower.includes('light') || lower.includes('power')) return '⚡';
  return '🏗️';
}

export function getCategoryBadgeClass(category: string): string {
  const lower = (category || '').toLowerCase();
  if (lower.includes('building') || lower.includes('construction')) return 'bg-blue-50 text-blue-700 border-blue-200';
  if (lower.includes('road') || lower.includes('highway') || lower.includes('bridge')) return 'bg-amber-50 text-amber-700 border-amber-200';
  if (lower.includes('water') || lower.includes('drain') || lower.includes('sewer')) return 'bg-cyan-50 text-cyan-700 border-cyan-200';
  if (lower.includes('metro') || lower.includes('transit')) return 'bg-purple-50 text-purple-700 border-purple-200';
  if (lower.includes('park') || lower.includes('lake')) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  return 'bg-gray-50 text-gray-700 border-gray-200';
}

