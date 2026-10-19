'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  getDlpStatus,
  formatCrore,
  getCategoryIcon,
  getCategoryBadgeClass,
} from '@/lib/helpers';

const HomeMap = dynamic(() => import('@/components/HomeMap'), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] bg-gray-50 rounded-2xl flex flex-col items-center justify-center text-sm text-gray-500 border border-gray-200">
      <span className="text-3xl mb-2 animate-bounce">📍</span>
      <p className="font-medium">Loading interactive tender map...</p>
    </div>
  ),
});

const CATEGORIES = [
  'All',
  'Buildings & Construction',
  'Roads & Bridges',
  'Water Supply & Drainage',
  'Metro & Transit',
  'Public Amenities & Parks',
] as const;

const LOCALITIES: Record<string, { lat: number; lng: number; label: string }> = {
  'Near Me': { lat: 0, lng: 0, label: '📍 Near My Location' },
  'All Suburbs': { lat: 12.9800, lng: 80.2100, label: '🌐 All Chennai & Suburbs' },
  'Velachery & Guindy': { lat: 12.9752, lng: 80.2215, label: 'Velachery & Guindy' },
  'Tambaram & Chromepet': { lat: 12.9249, lng: 80.1180, label: 'Tambaram & Chromepet' },
  'OMR & Sholinganallur': { lat: 12.8997, lng: 80.2270, label: 'OMR & Sholinganallur' },
  'Porur & Poonamallee': { lat: 13.0382, lng: 80.1565, label: 'Porur & Poonamallee' },
  'Ambattur & Avadi': { lat: 13.1143, lng: 80.1548, label: 'Ambattur & Avadi' },
  'T. Nagar & Central': { lat: 13.0418, lng: 80.2341, label: 'T. Nagar & Central' },
};

const RADIUS_OPTIONS = [3, 5, 10, 20, 50];

interface RoadLocation {
  lat: number;
  lng: number;
  radiusKm: number;
  locationName: string;
}

interface Tender {
  _id: string;
  tenderId: string;
  title: string;
  organisation: string;
  department: string;
  category: string;
  subCategory?: string;
  projectStage?: string;
  status: string;
  value: number;
  contractorName: string;
  defectLiabilityEndDate: string;
  roadLocation: RoadLocation;
  distance?: number;
}

export default function HomePage() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalReports, setTotalReports] = useState(0);

  // Filters & Location
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLocality, setSelectedLocality] = useState<string>('Near Me');
  const [selectedRadius, setSelectedRadius] = useState<number>(10);
  const [search, setSearch] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationSource, setLocationSource] = useState<'gps' | 'suburb' | 'default'>('default');
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [gpsDetecting, setGpsDetecting] = useState(false);

  // View mode: 'split' | 'map' | 'list'
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'list'>('split');

  // Trigger GPS detection
  const detectUserGPS = useCallback(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setGpsDetecting(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setUserLocation(coords);
        setLocationSource('gps');
        setSelectedLocality('Near Me');
        setGpsDetecting(false);
      },
      (error) => {
        console.warn('Geolocation error:', error.message);
        setGpsDetecting(false);
        setGpsError('Location access was denied or timed out. Showing Chennai Hub.');
        // Fallback to Chennai Central/Guindy
        setUserLocation({ lat: 12.9800, lng: 80.2100 });
        setLocationSource('default');
        setSelectedLocality('All Suburbs');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // On mount: attempt GPS detection, fetch tenders & report counts
  useEffect(() => {
    detectUserGPS();

    fetch('/api/reports')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTotalReports(data.length);
      })
      .catch(() => {});
  }, [detectUserGPS]);

  // Fetch tenders based on location coordinates & category
  const loadTenders = useCallback(async () => {
    setLoading(true);
    try {
      const activeCoords = userLocation || { lat: 12.9800, lng: 80.2100 };
      const params = new URLSearchParams();

      if (activeCoords.lat && activeCoords.lng) {
        params.append('lat', activeCoords.lat.toString());
        params.append('lng', activeCoords.lng.toString());
        params.append('radius', selectedRadius.toString());
      }
      if (selectedCategory !== 'All') {
        params.append('category', selectedCategory);
      }
      if (search.trim()) {
        params.append('search', search.trim());
      }

      const res = await fetch(`/api/road-tenders?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setTenders(data);
      }
    } catch (err) {
      console.error('Failed to load tenders:', err);
    } finally {
      setLoading(false);
    }
  }, [userLocation, selectedRadius, selectedCategory, search]);

  useEffect(() => {
    loadTenders();
  }, [loadTenders]);

  // Locality pill click
  const handleLocalityClick = (key: string) => {
    setSelectedLocality(key);
    if (key === 'Near Me') {
      detectUserGPS();
    } else {
      const loc = LOCALITIES[key];
      if (loc && loc.lat !== 0) {
        setUserLocation({ lat: loc.lat, lng: loc.lng });
        setLocationSource('suburb');
      }
    }
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: tenders.length };
    tenders.forEach((t) => {
      counts[t.category] = (counts[t.category] || 0) + 1;
    });
    return counts;
  }, [tenders]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white mb-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-200 border border-blue-400/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <span>🏛️</span> Public Works & Tender Accountability
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Explore Government Tenders Near You
          </h1>
          <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-5">
            Discover ongoing construction, buildings, roads, drainage, and civic infrastructure in your neighborhood. Inspect contractor warranties (Defect Liability Period) and hold officials accountable.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={detectUserGPS}
              disabled={gpsDetecting}
              className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-2 disabled:opacity-60"
            >
              <span>{gpsDetecting ? '⏳' : '📍'}</span>
              <span>{gpsDetecting ? 'Detecting Location...' : 'Use My GPS Location'}</span>
            </button>

            <Link
              href="/report"
              className="bg-white text-slate-900 hover:bg-slate-100 font-bold px-4 py-2.5 rounded-xl text-sm transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>📸</span> Report a Defect or Delay
            </Link>

            <Link
              href="/reports"
              className="bg-white/10 hover:bg-white/20 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors border border-white/20"
            >
              Citizen Reports ({totalReports})
            </Link>
          </div>
        </div>

        {/* Decorative corner glow */}
        <div className="absolute -right-16 -top-16 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Location & Search Controls Card */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm mb-6 space-y-4">
        {/* Status bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 font-medium">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
            </span>
            <span>
              Searching near:{' '}
              <strong className="text-gray-900">
                {locationSource === 'gps'
                  ? 'Your Live GPS Location'
                  : selectedLocality === 'Near Me'
                  ? 'Chennai Suburbs'
                  : selectedLocality}
              </strong>
            </span>
            {userLocation && (
              <span className="text-xs text-gray-400 hidden md:inline">
                ({userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)})
              </span>
            )}
          </div>

          {/* Radius selector */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-gray-500 font-medium mr-1">Radius:</span>
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRadius(r)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  selectedRadius === r
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>

        {gpsError && (
          <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg flex items-center justify-between">
            <span>ℹ️ {gpsError}</span>
            <button
              onClick={detectUserGPS}
              className="text-blue-600 hover:underline font-semibold ml-2"
            >
              Retry GPS
            </button>
          </div>
        )}

        {/* Suburb / Locality Filter Pills */}
        <div>
          <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block mb-2">
            Select Neighborhood or Suburb
          </label>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(LOCALITIES).map(([key, data]) => (
              <button
                key={key}
                type="button"
                onClick={() => handleLocalityClick(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  selectedLocality === key
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {data.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search input */}
        <div>
          <Input
            placeholder="Search tender title, building, road, contractor, or tender ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-gray-50/80 border-gray-200 rounded-xl text-sm"
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="mb-6 overflow-x-auto pb-1">
        <div className="flex items-center gap-2 min-w-max">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const count = cat === 'All' ? tenders.length : categoryCounts[cat] || 0;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{getCategoryIcon(cat)}</span>
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isSelected ? 'bg-slate-700 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header & View Mode Switcher */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            {selectedCategory === 'All' ? 'All Public Tenders' : selectedCategory}{' '}
            <span className="text-gray-500 font-normal">({tenders.length} nearby)</span>
          </h2>
        </div>

        {/* View Mode Toggle */}
        <div className="hidden sm:flex items-center bg-gray-100 p-1 rounded-xl text-xs font-medium border border-gray-200">
          <button
            onClick={() => setViewMode('split')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'split' ? 'bg-white shadow-xs text-gray-900 font-semibold' : 'text-gray-600'
            }`}
          >
            🗺️ Split View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'map' ? 'bg-white shadow-xs text-gray-900 font-semibold' : 'text-gray-600'
            }`}
          >
            Map Only
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              viewMode === 'list' ? 'bg-white shadow-xs text-gray-900 font-semibold' : 'text-gray-600'
            }`}
          >
            List Only
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      {viewMode === 'map' ? (
        <div className="h-[600px] rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
          <HomeMap
            tenders={tenders}
            userLocation={userLocation}
            selectedRadiusKm={selectedRadius}
          />
        </div>
      ) : (
        <div
          className={`grid gap-6 ${
            viewMode === 'split' ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'
          }`}
        >
          {/* Interactive Map (in Split View) */}
          {viewMode === 'split' && (
            <div className="lg:col-span-6 xl:col-span-7 h-[420px] lg:h-[700px] lg:sticky lg:top-20 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
              <HomeMap
                tenders={tenders}
                userLocation={userLocation}
                selectedRadiusKm={selectedRadius}
              />
            </div>
          )}

          {/* Tender Cards Listing */}
          <div
            className={`${
              viewMode === 'split' ? 'lg:col-span-6 xl:col-span-5' : 'col-span-1'
            } space-y-4`}
          >
            {loading ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 text-gray-400">
                <p className="text-3xl mb-2 animate-spin">⏳</p>
                <p className="font-medium text-sm text-gray-600">Finding nearby tenders...</p>
              </div>
            ) : tenders.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300 p-6">
                <p className="text-3xl mb-2">🔍</p>
                <p className="font-semibold text-gray-800">No tenders found in this range</p>
                <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
                  Try expanding the search radius (e.g. 20 km), choosing &ldquo;All Categories&rdquo;, or selecting another neighborhood.
                </p>
                <button
                  onClick={() => {
                    setSelectedRadius(20);
                    setSelectedCategory('All');
                    setSearch('');
                  }}
                  className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg"
                >
                  Expand Radius to 20 km
                </button>
              </div>
            ) : (
              <div
                className={`grid gap-3.5 ${
                  viewMode === 'list' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
                }`}
              >
                {tenders.map((tender) => {
                  const { status: dlpStatus, daysLeft } = getDlpStatus(
                    tender.defectLiabilityEndDate
                  );
                  const isCancelled = tender.status === 'Cancelled';
                  const badgeClass = getCategoryBadgeClass(tender.category);

                  return (
                    <div
                      key={tender._id}
                      className="bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md transition-shadow flex flex-col justify-between"
                    >
                      <div>
                        {/* Badges row */}
                        <div className="flex items-center justify-between gap-1 mb-2.5">
                          <span
                            className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badgeClass} flex items-center gap-1`}
                          >
                            <span>{getCategoryIcon(tender.category)}</span>
                            <span>{tender.category}</span>
                          </span>

                          <div className="flex items-center gap-1">
                            {typeof tender.distance === 'number' && (
                              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                                📍 {tender.distance} km
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                              {tender.tenderId}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <Link
                          href={`/tender/${tender.tenderId}`}
                          className="font-bold text-gray-900 hover:text-blue-600 text-sm sm:text-base line-clamp-2 mb-2 leading-snug"
                        >
                          {tender.title}
                        </Link>

                        {/* Metadata items */}
                        <p className="text-xs text-gray-600 mb-1 flex items-start gap-1">
                          <span className="shrink-0 text-gray-400">📍</span>
                          <span className="line-clamp-1">{tender.roadLocation.locationName}</span>
                        </p>
                        <p className="text-xs text-gray-600 mb-1 flex items-start gap-1">
                          <span className="shrink-0 text-gray-400">🏗️</span>
                          <span className="line-clamp-1 font-medium">{tender.contractorName}</span>
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-1.5 mb-2">
                          <span>🏛️ {tender.organisation}</span>
                          <span>•</span>
                          <span className="font-semibold text-gray-700">
                            {formatCrore(tender.value)}
                          </span>
                        </p>
                      </div>

                      {/* Footer: DLP Status & Actions */}
                      <div className="pt-3 mt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                        {isCancelled ? (
                          <Badge variant="outline" className="text-gray-500 text-[10px]">
                            Cancelled
                          </Badge>
                        ) : dlpStatus === 'active' ? (
                          <span className="text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200">
                            DLP Active ({daysLeft}d left)
                          </span>
                        ) : dlpStatus === 'expiring' ? (
                          <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            Expiring ({daysLeft}d)
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                            DLP Expired
                          </span>
                        )}

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/tender/${tender.tenderId}`}
                            className="text-blue-600 hover:underline font-semibold"
                          >
                            Details →
                          </Link>
                          <Link
                            href={`/report?tenderId=${tender.tenderId}`}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors"
                          >
                            📸 Report
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}