import { notFound } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getDlpStatus,
  formatCrore,
  getCategoryIcon,
  getCategoryBadgeClass,
} from '@/lib/helpers';
import connectDB from '@/lib/db';
import RoadTender from '@/lib/models/RoadTender';
import PotholeReport from '@/lib/models/PotholeReport';

const MiniMap = dynamic(() => import('@/components/MiniMap'), { ssr: false });

function DlpBadge({ status, daysLeft }: { status: string; daysLeft: number }) {
  if (status === 'active')
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        ✅ Active DLP — {daysLeft} days left
      </Badge>
    );
  if (status === 'expiring')
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-200">
        ⚠️ DLP Expiring — {daysLeft} days left
      </Badge>
    );
  return <Badge className="bg-red-100 text-red-800 border-red-200">❌ DLP Expired</Badge>;
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
  const colors: Record<string, string> = {
    Low: 'bg-green-100 text-green-800',
    Medium: 'bg-yellow-100 text-yellow-800',
    High: 'bg-orange-100 text-orange-800',
    Extreme: 'bg-red-100 text-red-800',
  };
  return <Badge className={colors[danger] || 'bg-gray-100 text-gray-800'}>⚠️ {danger} Danger</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    Open: 'bg-red-100 text-red-800',
    'In Review': 'bg-yellow-100 text-yellow-800',
    Resolved: 'bg-green-100 text-green-800',
  };
  return <Badge className={colors[status] || ''}>{status}</Badge>;
}

export default async function TenderDetailPage({ params }: { params: { id: string } }) {
  await connectDB();
  const tender = await RoadTender.findOne({ tenderId: params.id }).lean();
  if (!tender) notFound();

  const reports = await PotholeReport.find({ matchedTenderId: params.id })
    .sort({ reportedAt: -1 })
    .lean();

  const { status: dlpStatus, daysLeft } = getDlpStatus(tender.defectLiabilityEndDate);
  const isCancelled = tender.status === 'Cancelled';
  const categoryBadgeClass = getCategoryBadgeClass(tender.category);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 font-sans">
      {/* Breadcrumb */}
      <nav className="text-xs text-gray-500 mb-4 flex items-center gap-1.5">
        <Link href="/" className="hover:underline font-medium">
          Home
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold">Tender {tender.tenderId}</span>
      </nav>

      {/* Heading & Badges */}
      <div className="mb-6 bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${categoryBadgeClass} flex items-center gap-1`}
          >
            <span>{getCategoryIcon(tender.category)}</span>
            <span>{tender.category}</span>
          </span>
          {tender.subCategory && (
            <Badge variant="outline" className="text-gray-600 bg-gray-50 text-xs">
              {tender.subCategory}
            </Badge>
          )}
          {isCancelled ? (
            <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>
          ) : (
            <DlpBadge status={dlpStatus} daysLeft={daysLeft} />
          )}
          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded ml-auto">
            {tender.tenderId}
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-3 leading-snug">
          {tender.title}
        </h1>

        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          {tender.description}
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100 text-xs">
          <div>
            <p className="text-gray-400 font-medium">Organisation</p>
            <p className="font-bold text-gray-900 mt-0.5">{tender.organisation}</p>
          </div>
          <div>
            <p className="text-gray-400 font-medium">Department</p>
            <p className="font-bold text-gray-900 mt-0.5">{tender.department}</p>
          </div>
          <div>
            <p className="text-gray-400 font-medium">Contract Value</p>
            <p className="font-bold text-blue-700 mt-0.5">{formatCrore(tender.value)}</p>
          </div>
          <div>
            <p className="text-gray-400 font-medium">DLP Warranty End</p>
            <p className="font-bold text-gray-900 mt-0.5">{tender.defectLiabilityEndDate}</p>
          </div>
        </div>
      </div>

      {/* DLP Countdown Status Banner */}
      {!isCancelled && (
        <div
          className={`rounded-2xl p-4 mb-6 text-center font-semibold text-sm sm:text-base border ${
            dlpStatus === 'active'
              ? 'bg-green-50 text-green-900 border-green-200'
              : dlpStatus === 'expiring'
              ? 'bg-amber-50 text-amber-900 border-amber-200'
              : 'bg-red-50 text-red-900 border-red-200'
          }`}
        >
          {dlpStatus === 'expired'
            ? '❌ Defect Liability Period (DLP) has expired — maintenance has reverted to the department'
            : `⏱️ Contractor is legally obligated to repair damages for free: ${daysLeft} days remaining in Defect Liability Period`}
        </div>
      )}

      {/* Project Location & Mini Map */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs mb-6">
        <h2 className="font-bold text-sm text-gray-900 uppercase tracking-wider mb-1">
          📍 Project Site Location
        </h2>
        <p className="text-sm text-gray-600 mb-3">{tender.roadLocation.locationName}</p>
        <div className="rounded-xl overflow-hidden border border-gray-200">
          <MiniMap lat={tender.roadLocation.lat} lng={tender.roadLocation.lng} />
        </div>
      </div>

      {/* Contractor & Official Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Contractor */}
        <Card className="rounded-2xl border-gray-200 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <span>🏗️</span> Responsible Contractor
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <p className="font-extrabold text-sm text-gray-900">{tender.contractorName}</p>
            <p className="text-gray-600 flex items-center gap-1.5">
              <span>📞</span>
              <a href={`tel:${tender.contractorPhone}`} className="text-blue-600 hover:underline font-medium">
                {tender.contractorPhone}
              </a>
            </p>
            <p className="text-gray-600 flex items-center gap-1.5">
              <span>✉️</span>
              <a href={`mailto:${tender.contractorEmail}`} className="text-blue-600 hover:underline font-medium">
                {tender.contractorEmail}
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Responsible Officer */}
        <Card className="rounded-2xl border-gray-200 shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <span>👤</span> Responsible Government Official
            </CardTitle>
          </CardHeader>
          <CardContent className="text-xs space-y-2">
            <p className="font-extrabold text-sm text-gray-900">{tender.responsibleOfficerName}</p>
            <p className="text-gray-600 flex items-center gap-1.5">
              <span>📞</span>
              <a href={`tel:${tender.responsibleOfficerPhone}`} className="text-blue-600 hover:underline font-medium">
                {tender.responsibleOfficerPhone}
              </a>
            </p>
            <p className="text-gray-600 flex items-center gap-1.5">
              <span>✉️</span>
              <a href={`mailto:${tender.responsibleOfficerEmail}`} className="text-blue-600 hover:underline font-medium">
                {tender.responsibleOfficerEmail}
              </a>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Citizen Grievance Reports on this Project */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs mb-6">
        <h2 className="font-bold text-sm text-gray-900 uppercase tracking-wider mb-3">
          📋 Citizen Grievance Reports on This Project ({reports.length})
        </h2>
        {reports.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <p className="text-2xl mb-1">✅</p>
            <p className="font-medium text-xs">No defects or grievances reported yet for this tender.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <Link key={String(report._id)} href={`/report/${report._id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer rounded-xl border-gray-200">
                  <CardContent className="p-3.5 flex gap-3.5 items-start">
                    {report.photoUrl && (
                      <img
                        src={report.photoUrl}
                        alt="Issue photo"
                        className="w-16 h-16 object-cover rounded-lg shrink-0 border border-gray-100"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1 mb-1">
                        <SeverityBadge severity={report.severity} />
                        <DangerBadge danger={report.dangerLevel} />
                        <StatusBadge status={report.status} />
                      </div>
                      <p className="text-xs text-gray-800 font-medium truncate">{report.description || report.locationAddress}</p>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Reported on {new Date(report.reportedAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Floating CTA */}
      <Link
        href={`/report?tenderId=${tender.tenderId}`}
        className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl text-sm transition-all shadow-sm"
      >
        📸 Report an Issue / Defect for This Project
      </Link>
    </div>
  );
}
