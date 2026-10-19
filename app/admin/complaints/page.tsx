'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  status: 'Open' | 'In Review' | 'Resolved';
  adminRemarks?: string;
  assignedOfficial?: string;
  reportedAt: string;
  resolvedAt?: string | null;
}

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


export default function AdminComplaintsPage() {
  const router = useRouter();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminUser, setAdminUser] = useState<{ name: string; username: string } | null>(null);

  // Filters
  const [cityFilter, setCityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');

  // Editing state for remarks
  const [editingRemarks, setEditingRemarks] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      if (Array.isArray(data)) {
        setReports(data);
        // Initialize editingRemarks state
        const initialRemarks: Record<string, string> = {};
        data.forEach((r: Report) => {
          initialRemarks[r._id] = r.adminRemarks || '';
        });
        setEditingRemarks(initialRemarks);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check session
    fetch('/api/admin/me')
      .then((res) => {
        if (!res.ok) throw new Error('Not logged in');
        return res.json();
      })
      .then((data) => {
        if (data.authenticated) {
          setAdminUser(data.user);
        }
      })
      .catch(() => {
        router.push('/admin/login');
      });

    fetchReports();
  }, [fetchReports, router]);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  const handleStatusChange = async (id: string, newStatus: 'Open' | 'In Review' | 'Resolved') => {
    setSavingId(id);
    try {
      const res = await fetch(`/api/reports/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setReports((prev) =>
          prev.map((r) => (r._id === id ? { ...r, status: updated.status, resolvedAt: updated.resolvedAt } : r))
        );
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status');
    } finally {
      setSavingId(null);
    }
  };

  const handleSaveRemarks = async (id: string) => {
    setSavingId(id);
    try {
      const currentRemarks = editingRemarks[id] || '';
      const res = await fetch(`/api/reports/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminRemarks: currentRemarks }),
      });

      if (res.ok) {
        setReports((prev) =>
          prev.map((r) => (r._id === id ? { ...r, adminRemarks: currentRemarks } : r))
        );
        alert('Admin remarks saved successfully!');
      }
    } catch (err) {
      console.error('Failed to save remarks:', err);
      alert('Failed to save remarks');
    } finally {
      setSavingId(null);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (cityFilter !== 'ALL') {
      const matchCity =
        (r.city && r.city.toLowerCase().includes(cityFilter.toLowerCase())) ||
        (r.locationAddress && r.locationAddress.toLowerCase().includes(cityFilter.toLowerCase()));
      if (!matchCity) return false;
    }
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    if (severityFilter !== 'ALL' && r.severity !== severityFilter) return false;
    return true;
  });

  const totalCount = reports.length;
  const openCount = reports.filter((r) => r.status === 'Open').length;
  const inReviewCount = reports.filter((r) => r.status === 'In Review').length;
  const resolvedCount = reports.filter((r) => r.status === 'Resolved').length;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">🛡️</span>
            <h1 className="text-xl sm:text-2xl font-bold">Admin Complaints Portal</h1>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-medium border border-emerald-500/30">
              Live DB
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Logged in as <strong className="text-white">{adminUser?.name || 'Administrator'}</strong> ({adminUser?.username || 'admin'})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg transition-colors border border-slate-700"
          >
            🌐 Public View
          </Link>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="text-xs bg-red-600/10 hover:bg-red-600/20 text-red-300 border-red-500/30 px-3 py-2 h-auto"
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Total Complaints</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-red-100 shadow-sm">
          <p className="text-xs font-semibold text-red-600 uppercase tracking-wide">🔴 Open</p>
          <p className="text-2xl font-bold text-red-700 mt-1">{openCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">🟡 In Review</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{inReviewCount}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">🟢 Resolved</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{resolvedCount}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 bg-white p-3.5 rounded-xl border border-gray-200 shadow-sm">
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
            Filter by City
          </label>
          <Select value={cityFilter} onValueChange={(val) => setCityFilter(val || 'ALL')}>
            <SelectTrigger className="bg-gray-50 border-gray-200">
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
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
            Filter by Status
          </label>
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val || 'ALL')}>
            <SelectTrigger className="bg-gray-50 border-gray-200">
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
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1">
            Filter by Severity
          </label>
          <Select value={severityFilter} onValueChange={(val) => setSeverityFilter(val || 'ALL')}>
            <SelectTrigger className="bg-gray-50 border-gray-200">
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

      {/* Complaints List */}
      {loading ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-3xl mb-2">⏳</p>
          <p>Loading complaints from database...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-3xl mb-2">✅</p>
          <p className="font-semibold text-gray-700">No complaints matching current filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <Card key={report._id} className="overflow-hidden border border-gray-200 shadow-sm hover:border-gray-300 transition-colors">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Photo Column */}
                  <div className="relative md:w-56 h-48 md:h-auto bg-gray-100 flex-shrink-0">
                    {report.photoUrl ? (
                      <img
                        src={report.photoUrl}
                        alt="Damage evidence"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-xs text-gray-400">
                        No Photo
                      </div>
                    )}
                    {report.lat && report.lng && (
                      <a
                        href={`https://www.google.com/maps?q=${report.lat},${report.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute bottom-2 left-2 bg-black/75 hover:bg-black text-white text-[11px] px-2 py-1 rounded backdrop-blur-sm transition-colors flex items-center gap-1"
                      >
                        📍 View Map ({report.lat.toFixed(4)}, {report.lng.toFixed(4)}) ↗
                      </a>
                    )}
                  </div>

                  {/* Complaint Details Column */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Top Badges & Meta */}
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              report.status === 'Open'
                                ? 'bg-red-100 text-red-800 border-red-200'
                                : report.status === 'In Review'
                                ? 'bg-amber-100 text-amber-800 border-amber-200'
                                : 'bg-green-100 text-green-800 border-green-200'
                            }
                          >
                            {report.status}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Size: {report.severity}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            Danger: {report.dangerLevel}
                          </Badge>
                        </div>
                        <span className="text-xs text-gray-400">
                          ID: <span className="font-mono text-gray-600">{report._id.slice(-6)}</span> •{' '}
                          {new Date(report.reportedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>

                      {/* Location Address */}
                      <h3 className="font-bold text-gray-900 text-base mb-1">
                        📍 {report.locationAddress}
                      </h3>

                      {/* Citizen Remarks */}
                      <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-xs text-gray-700 mb-3">
                        <p className="font-semibold text-gray-500 uppercase text-[10px] mb-0.5">
                          Citizen Description / Remarks:
                        </p>
                        <p>{report.description || 'No additional details provided by citizen.'}</p>
                      </div>
                    </div>

                    {/* Admin Action Row */}
                    <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      {/* Status Update Buttons */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-gray-500 mr-1">Status:</span>
                        {(['Open', 'In Review', 'Resolved'] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            disabled={savingId === report._id || report.status === s}
                            onClick={() => handleStatusChange(report._id, s)}
                            className={`text-xs px-2.5 py-1 rounded-md font-medium transition-all ${
                              report.status === s
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>

                      {/* Admin Remarks Input & Save */}
                      <div className="flex items-center gap-2 flex-1 sm:max-w-md">
                        <input
                          type="text"
                          placeholder="Add admin action note / contractor assigned..."
                          value={editingRemarks[report._id] ?? ''}
                          onChange={(e) =>
                            setEditingRemarks((prev) => ({
                              ...prev,
                              [report._id]: e.target.value,
                            }))
                          }
                          className="flex-1 text-xs px-2.5 py-1.5 border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                        />
                        <button
                          type="button"
                          disabled={savingId === report._id}
                          onClick={() => handleSaveRemarks(report._id)}
                          className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium px-3 py-1.5 rounded-md transition-colors whitespace-nowrap"
                        >
                          {savingId === report._id ? 'Saving...' : 'Save Note'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
