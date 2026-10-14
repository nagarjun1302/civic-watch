'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { getDlpStatus, formatCrore } from '@/lib/helpers';

const CITIES = [
  'All Cities',
  'Bengaluru',
  'Mumbai',
  'Delhi',
  'Chennai',
  'Hyderabad',
  'Pune',
  'Visakhapatnam',
];

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
  status: string;
  value: number;
  contractorName: string;
  defectLiabilityEndDate: string;
  roadLocation: RoadLocation;
}

export default function HomePage() {
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [filteredTenders, setFilteredTenders] = useState<Tender[]>([]);
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [search, setSearch] = useState('');
  const [totalReports, setTotalReports] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/road-tenders')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTenders(data);
          setFilteredTenders(data);
        }
      })
      .catch((err) => console.error('Failed to load tenders:', err))
      .finally(() => setLoading(false));

    fetch('/api/reports')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTotalReports(data.length);
      })
      .catch(() => {});
  }, []);

  const filterData = useCallback(
    (city: string, query: string) => {
      let result = tenders;
      if (city !== 'All Cities') {
        const lowerCity = city.toLowerCase();
        result = result.filter(
          (t) =>
            t.roadLocation.locationName.toLowerCase().includes(lowerCity) ||
            t.title.toLowerCase().includes(lowerCity)
        );
      }
      if (query.trim()) {
        const lowerQ = query.toLowerCase();
        result = result.filter(
          (t) =>
            t.title.toLowerCase().includes(lowerQ) ||
            t.roadLocation.locationName.toLowerCase().includes(lowerQ) ||
            t.contractorName.toLowerCase().includes(lowerQ) ||
            t.organisation.toLowerCase().includes(lowerQ)
        );
      }
      setFilteredTenders(result);
    },
    [tenders]
  );

  const handleCitySelect = (city: string) => {
    setSelectedCity(city);
    filterData(city, search);
  };

  const handleSearchChange = (q: string) => {
    setSearch(q);
    filterData(selectedCity, q);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-2xl p-6 text-white mb-6 shadow-sm">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-2">
          🛣️ Citizen Road Accountability
        </h1>
        <p className="text-green-100 text-sm sm:text-base max-w-2xl mb-4">
          Select your city to browse government road contracts, discover responsible contractors under Defect Liability Period (DLP), or report a damaged road directly.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/report"
            className="bg-white text-green-800 hover:bg-green-50 font-bold px-5 py-2.5 rounded-xl text-sm transition-all shadow"
          >
            📸 Report a Pothole
          </Link>
          <Link
            href="/reports"
            className="bg-green-700/60 hover:bg-green-700 text-white font-medium px-4 py-2.5 rounded-xl text-sm transition-colors border border-green-500/40"
          >
            📋 Browse Citizen Reports ({totalReports})
          </Link>
        </div>
      </div>

      {/* City Chips & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6 space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
            Select City
          </label>
          <div className="flex flex-wrap gap-2">
            {CITIES.map((city) => (
              <button
                key={city}
                type="button"
                onClick={() => handleCitySelect(city)}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  selectedCity === city
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Input
            placeholder="Search road name, contractor, or tender ID..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="bg-gray-50 text-sm"
          />
        </div>
      </div>

      {/* Contract Listings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            Road Contracts in {selectedCity} ({filteredTenders.length})
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-3xl mb-2">⏳</p>
            <p>Loading contracts...</p>
          </div>
        ) : filteredTenders.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-3xl mb-2">🛣️</p>
            <p className="font-semibold text-gray-700">No road contracts found</p>
            <p className="text-xs text-gray-500 mt-1">Try selecting another city or clearing your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTenders.map((tender) => {
              const { status: dlpStatus, daysLeft } = getDlpStatus(tender.defectLiabilityEndDate);
              const isCancelled = tender.status === 'Cancelled';

              return (
                <div
                  key={tender._id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {tender.tenderId}
                      </span>
                      {isCancelled ? (
                        <Badge variant="outline" className="text-gray-500">Cancelled</Badge>
                      ) : dlpStatus === 'active' ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          Active DLP ({daysLeft}d left)
                        </Badge>
                      ) : dlpStatus === 'expiring' ? (
                        <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                          DLP Expiring ({daysLeft}d)
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 border-red-200">
                          DLP Expired
                        </Badge>
                      )}
                    </div>

                    <Link
                      href={`/tender/${tender.tenderId}`}
                      className="font-bold text-gray-900 hover:text-green-700 text-base line-clamp-2 mb-2"
                    >
                      {tender.title}
                    </Link>

                    <p className="text-xs text-gray-600 mb-1">
                      📍 <strong>Stretch:</strong> {tender.roadLocation.locationName}
                    </p>
                    <p className="text-xs text-gray-600 mb-1">
                      🏗️ <strong>Contractor:</strong> {tender.contractorName}
                    </p>
                    <p className="text-xs text-gray-500">
                      🏛️ {tender.organisation} • {formatCrore(tender.value)}
                    </p>
                  </div>

                  <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <Link
                      href={`/tender/${tender.tenderId}`}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      View Tender Details →
                    </Link>
                    <Link
                      href={`/report?tenderId=${tender.tenderId}`}
                      className="text-green-700 hover:text-green-800 font-semibold"
                    >
                      📸 Report Here
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}