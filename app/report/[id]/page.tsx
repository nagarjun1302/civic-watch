import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import connectDB from '@/lib/db';
import PotholeReport from '@/lib/models/PotholeReport';
import RoadTender from '@/lib/models/RoadTender';

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    Small: 'bg-blue-100 text-blue-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    Large: 'bg-orange-100 text-orange-800',
    'Very Large': 'bg-red-100 text-red-800',
  };
  return <Badge className={colors[severity] || ''}>{severity}</Badge>;
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
    <Badge className={colors[danger] || ''}>
      {icons[danger]} {danger} Danger
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Open: 'bg-red-100 text-red-800 border-red-200',
    'In Review': 'bg-amber-100 text-amber-800 border-amber-200',
    Resolved: 'bg-green-100 text-green-800 border-green-200',
  };
  return <Badge className={colors[status] || ''}>{status}</Badge>;
}

export default async function ReportDetailPage({ params }: { params: { id: string } }) {
  await connectDB();

  let report;
  try {
    report = await PotholeReport.findById(params.id).lean();
  } catch {
    notFound();
  }
  if (!report) notFound();

  let tender = null;
  if (report.matchedTenderId) {
    tender = await RoadTender.findOne({ tenderId: report.matchedTenderId }).lean();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Navigation */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/reports" className="text-sm text-gray-500 hover:underline">
          ← View All Reports
        </Link>
        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
          Complaint #{report._id.toString().slice(-8)}
        </span>
      </div>

      {/* Success Notification Banner */}
      <div className="mb-5 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
        <span className="text-2xl">✅</span>
        <div>
          <h2 className="text-sm font-bold text-green-900">Complaint Logged Successfully</h2>
          <p className="text-xs text-green-700 mt-0.5">
            Your complaint and photo evidence have been saved in the system and are accessible to municipal administrators for review and action.
          </p>
        </div>
      </div>

      {/* Geotagged Photo */}
      {report.photoUrl && (
        <div className="relative mb-4">
          <img
            src={report.photoUrl}
            alt="Pothole photo evidence"
            className="w-full rounded-2xl object-cover max-h-80 shadow-sm border border-gray-100"
          />
          {report.lat && report.lng && (
            <div className="absolute bottom-2 left-2 bg-black/75 text-white text-xs px-2.5 py-1 rounded-md backdrop-blur-sm">
              📍 Geotag: {report.lat.toFixed(5)}, {report.lng.toFixed(5)}
            </div>
          )}
        </div>
      )}

      {/* Status & Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 bg-white p-3 rounded-xl border border-gray-200">
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={report.status} />
          <SeverityBadge severity={report.severity} />
          <DangerBadge danger={report.dangerLevel} />
        </div>
        <span className="text-xs text-gray-400">
          Logged:{' '}
          {new Date(report.reportedAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>

      {/* Location */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
          Damage Location
        </p>
        <p className="text-base font-bold text-gray-900">📍 {report.locationAddress}</p>
        {report.lat && report.lng && (
          <a
            href={`https://www.google.com/maps?q=${report.lat},${report.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-xs text-blue-600 hover:underline mt-1 font-medium"
          >
            Open in Google Maps ↗
          </a>
        )}
      </div>

      {/* Citizen Remarks */}
      <div className="mb-4 bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
          Citizen Description / Remarks
        </h3>
        <p className="text-sm text-gray-700 leading-relaxed">
          {report.description || 'No additional remarks submitted.'}
        </p>
      </div>

      {/* Admin Action & Status Updates (if present) */}
      {report.adminRemarks && (
        <div className="mb-5 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-base">🛡️</span>
            <h3 className="text-xs font-bold text-blue-900 uppercase tracking-wide">
              Official Admin Update
            </h3>
          </div>
          <p className="text-sm text-blue-800">{report.adminRemarks}</p>
          {report.resolvedAt && (
            <p className="text-xs text-blue-600 mt-2">
              Marked Resolved on:{' '}
              {new Date(report.resolvedAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          )}
        </div>
      )}

      {/* Matched Contract if available */}
      {tender && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <p className="text-xs text-green-700 font-semibold uppercase tracking-wide mb-1">
              Matched Road Tender Contract
            </p>
            <Link
              href={`/tender/${tender.tenderId}`}
              className="font-bold text-green-900 hover:underline text-base block mb-2"
            >
              {tender.title}
            </Link>
            <p className="text-sm text-gray-700">🏗️ Contractor: {tender.contractorName}</p>
            <p className="text-xs text-gray-500 mt-1">
              Defect Liability Period (DLP) valid until: {tender.defectLiabilityEndDate}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Link
          href="/report"
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-colors text-center text-sm"
        >
          📸 Report Another Damage
        </Link>
        <Link
          href="/reports"
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 rounded-xl transition-colors text-center text-sm"
        >
          📋 Browse Public Reports
        </Link>
      </div>
    </div>
  );
}