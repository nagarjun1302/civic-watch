import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import connectDB from '@/lib/db';
import PotholeReport from '@/lib/models/PotholeReport';
import RoadTender from '@/lib/models/RoadTender';
import ShareButtons from './ShareButtons';

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
    Open: 'bg-red-100 text-red-800',
    'In Review': 'bg-yellow-100 text-yellow-800',
    Resolved: 'bg-green-100 text-green-800',
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

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const reportUrl = `${appUrl}/report/${params.id}`;

  const coordsText =
    report.lat && report.lng
      ? ` (Coordinates: ${report.lat.toFixed(5)}, ${report.lng.toFixed(5)})`
      : '';

  const complaintText = `Subject: Complaint Regarding Road Damage — ${report.locationAddress}

I am reporting ${report.severity} road damage located at ${report.locationAddress}${coordsText}.
${
  tender
    ? `
This road falls under government tender ${tender.tenderId} — "${tender.title}" managed by ${tender.organisation}.
Contractor: ${tender.contractorName} (${tender.contractorPhone}, ${tender.contractorEmail})
Defect Liability Period is valid until: ${tender.defectLiabilityEndDate}.`
    : ''
}
${report.description ? `\nDetails: ${report.description}` : ''}

Photo evidence: ${report.photoUrl}
Report link: ${reportUrl}

Filed via RoadWatch — Citizen Road Accountability Platform`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Navigation */}
      <Link href="/reports" className="text-sm text-gray-500 hover:underline mb-4 inline-block">
        ← View All Reports
      </Link>

      {/* Geotagged Photo */}
      {report.photoUrl && (
        <div className="relative mb-4">
          <img
            src={report.photoUrl}
            alt="Pothole photo"
            className="w-full rounded-2xl object-cover max-h-80 shadow-sm"
          />
          {report.lat && report.lng && (
            <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2.5 py-1 rounded-md backdrop-blur-sm">
              📍 Geotag: {report.lat.toFixed(5)}, {report.lng.toFixed(5)}
            </div>
          )}
        </div>
      )}

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-3">
        <SeverityBadge severity={report.severity} />
        <DangerBadge danger={report.dangerLevel} />
        <StatusBadge status={report.status} />
      </div>

      {/* Location */}
      <div className="bg-gray-50 rounded-xl p-3 mb-5 border border-gray-100">
        <p className="text-base font-semibold text-gray-900">📍 {report.locationAddress}</p>
        <p className="text-xs text-gray-400 mt-1">
          Reported on{' '}
          {new Date(report.reportedAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {report.description && (
        <div className="mb-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Details</h3>
          <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
            {report.description}
          </p>
        </div>
      )}

      {/* Matched Contract if available */}
      {tender && (
        <Card className="mb-6 border-green-200 bg-green-50">
          <CardContent className="p-4">
            <p className="text-xs text-green-700 font-semibold uppercase tracking-wide mb-1">
              Matched Road Contract
            </p>
            <Link
              href={`/tender/${tender.tenderId}`}
              className="font-bold text-green-900 hover:underline text-base block mb-2"
            >
              {tender.title}
            </Link>
            <p className="text-sm text-gray-700">🏗️ Contractor: {tender.contractorName}</p>
            <p className="text-xs text-gray-500 mt-1">DLP valid until: {tender.defectLiabilityEndDate}</p>
          </CardContent>
        </Card>
      )}

      {/* Complaint Letter */}
      <div className="mb-6">
        <h2 className="font-bold text-lg mb-2">📄 Generated Grievance Letter</h2>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 font-mono text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
          {complaintText}
        </div>
      </div>

      {/* Share / Copy Options (No WhatsApp) */}
      <ShareButtons
        complaintText={complaintText}
        subject={`Grievance: Road Damage at ${report.locationAddress}`}
      />
    </div>
  );
}