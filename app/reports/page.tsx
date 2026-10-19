'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CITIES = [
  'ALL',
  'Chennai',
  'Tambaram',
  'Avadi',
  'Velachery',
  'Porur',
  'Ambattur',
  'Bengaluru',
  'Mumbai',
  'Delhi',
  'Hyderabad',
];


interface Report {
  _id: string;
  photoUrl: string;
  lat?: number | null;
  lng?: number | null;
  city?: string;
  locationAddress: string;
  description: string;
  severity: 'Small' | 'Medium' | 'Large' | 'Very Large';
  dangerLevel: 'Low' | 'Medium' | 'High' | 'Extreme';
  matchedTenderId: string | null;
  matchedTenderTitle: string;
  contractorName: string;
  responsibleOfficerName: string;
  status: 'Open' | 'In Review' | 'Resolved';
  reportedAt: string;
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    Small: 'bg-blue-100 text-blue-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Large: 'bg-orange-100 text-orange-800',
    'Very Large': 'bg-red-100 text-red-800',
  };
  return <Badge className={colors[severity] || 'bg-gray-100 text-gray-800'}>{severity}</Badge>;
}

function DangerBadge({ danger }: { danger: string }) {
  const icons: Record<string, string> = { Low: '🟢', Medium: '🟡', High: '🟠', Extreme: '🔴' };
  const colors: Record<string, string> = {
    Low: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-orange-100 text-orange-800',
    Extreme: 'bg-red-100 text-red-800',
  };
  return (
    <Badge className={colors[danger] || 'bg-gray-100 text-gray-800'}>
      {icons[danger]} {danger} Danger
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Open: 'bg-red-100 text-red-800',
    'In Review': 'bg-yellow-100 text-yellow-800',
    Resolved: 'bg-green-100 text-green-800',
  };
  return <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
}

export default function ReportsBrowsePage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [cityFilter, setCityFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setReports(data);
        }
      })
      .catch((err) => console.error('Failed to load reports:', err))
      .finally(() => setLoading(false));
  }, []);

  const filteredReports = reports.filter((r) => {
    if (cityFilter !== 'ALL') {
      const lowerCity = cityFilter.toLowerCase();
      const match =
        (r.city && r.city.toLowerCase().includes(lowerCity)) ||
        (r.locationAddress && r.locationAddress.toLowerCase().includes(lowerCity));
      if (!match) return false;
    }
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (severityFilter !== 'ALL' && r.severity !== severityFilter) return false;
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">🕳️ Citizen Pothole Reports</h1>
          <p className="text-sm text-gray-500">Track reported road hazards across Indian cities</p>
        </div>

        <Link
          href="/report"
          className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-xl text-sm transition-colors self-start sm:self-auto"
        >
          📸 Report a Pothole
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 bg-gray-50 p-3 rounded-xl border border-gray-200">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
            City
          </label>
          <Select value={cityFilter} onValueChange={(val) => setCityFilter(val || 'ALL')}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="All Cities" />
            </SelectTrigger>
            <SelectContent>
              {CITIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c === 'ALL' ? 'All Cities' : c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
            Status
          </label>
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'ALL')}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Statuses</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="In Review">In Review</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1">
            Severity
          </label>
          <Select value={severityFilter} onValueChange={(val) => setSeverityFilter(val || 'ALL')}>
            <SelectTrigger className="bg-white">
              <SelectValue placeholder="All Severities" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Severities</SelectItem>
              <SelectItem value="Small">Small</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Large">Large</SelectItem>
              <SelectItem value="Very Large">Very Large</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-3xl mb-2">⏳</p>
          <p>Loading reports...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-4xl mb-2">🛣️</p>
          <p className="font-semibold text-gray-700">No reports found matching your filters</p>
          <p className="text-sm text-gray-500 mt-1">Try changing your city or status filters.</p>
          <Link
            href="/report"
            className="inline-block mt-4 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
          >
            📸 File a New Report
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredReports.map((report) => (
            <Link key={report._id} href={`/report/${report._id}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between overflow-hidden">
                <div className="relative h-48 w-full bg-gray-100 flex-shrink-0">
                  {report.photoUrl ? (
                    <img
                      src={report.photoUrl}
                      alt="Pothole"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <span>No Photo Provided</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <StatusBadge status={report.status} />
                  </div>
                  {report.lat && report.lng && (
                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
                      📍 Geotagged
                    </div>
                  )}
                </div>

                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <SeverityBadge severity={report.severity} />
                      <DangerBadge danger={report.dangerLevel} />
                    </div>

                    <p className="text-sm font-semibold text-gray-900 line-clamp-1 mb-1">
                      📍 {report.locationAddress}
                    </p>

                    {report.contractorName ? (
                      <p className="text-xs text-gray-600 mb-2">
                        🏗️ <span className="font-medium">{report.contractorName}</span>
                      </p>
                    ) : null}

                    {report.description && (
                      <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                        {report.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                    <span>
                      {new Date(report.reportedAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    <span className="text-blue-600 font-medium">View Grievance Letter →</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
