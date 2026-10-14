import { notFound } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getDlpStatus, formatCrore } from '@/lib/helpers';
import connectDB from '@/lib/db';
import RoadTender from '@/lib/models/RoadTender';
import PotholeReport from '@/lib/models/PotholeReport';

const MiniMap = dynamic(() => import('@/components/MiniMap'), { ssr: false });

function DlpBadge({ status, daysLeft }: { status: string; daysLeft: number }) {
  if (status === 'active')
    return <Badge className="bg-green-100 text-green-800 border-green-200">✅ Active DLP — {daysLeft} days left</Badge>;
  if (status === 'expiring')
    return <Badge className="bg-amber-100 text-amber-800 border-amber-200">⚠️ DLP Expiring — {daysLeft} days left</Badge>;
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4">
        <Link href="/" className="hover:underline">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-900 font-medium">Tender Detail</span>
      </nav>

      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{tender.title}</h1>
        <div className="flex flex-wrap gap-2 items-center">
          {isCancelled ? (
            <Badge className="bg-gray-100 text-gray-800">Cancelled</Badge>
          ) : (
            <DlpBadge status={dlpStatus} daysLeft={daysLeft} />
          )}
          <Badge variant="outline">{tender.category}</Badge>
          <Badge variant="outline">{tender.status}</Badge>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div>
          <p className="text-gray-500">Organisation</p>
          <p className="font-medium">{tender.organisation}</p>
        </div>
        <div>
          <p className="text-gray-500">Department</p>
          <p className="font-medium">{tender.department}</p>
        </div>
        <div>
          <p className="text-gray-500">Contract Value</p>
          <p className="font-medium">{formatCrore(tender.value)}</p>
        </div>
        <div>
          <p className="text-gray-500">DLP End Date</p>
          <p className="font-medium">{tender.defectLiabilityEndDate}</p>
        </div>
      </div>

      {/* DLP countdown */}
      {!isCancelled && (
        <div
          className={`rounded-xl p-4 mb-6 text-center font-semibold text-lg ${
            dlpStatus === 'active'
              ? 'bg-green-50 text-green-800'
              : dlpStatus === 'expiring'
              ? 'bg-amber-50 text-amber-800'
              : 'bg-red-50 text-red-800'
          }`}
        >
          {dlpStatus === 'expired'
            ? '❌ Defect Liability Period has expired'
            : `⏱️ Defect Liability Period ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
        </div>
      )}

      {/* Mini map */}
      <div className="mb-6">
        <h2 className="font-semibold text-gray-700 mb-2 text-sm uppercase tracking-wide">Road Location</h2>
        <p className="text-sm text-gray-600 mb-2">{tender.roadLocation.locationName}</p>
        <MiniMap lat={tender.roadLocation.lat} lng={tender.roadLocation.lng} />
      </div>

      {/* Contractor */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">🏗️ Contractor</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p className="font-bold text-base">{tender.contractorName}</p>
          <p>
            📞{' '}
            <a href={`tel:${tender.contractorPhone}`} className="text-blue-600 hover:underline">
              {tender.contractorPhone}
            </a>
          </p>
          <p>
            ✉️{' '}
            <a href={`mailto:${tender.contractorEmail}`} className="text-blue-600 hover:underline">
              {tender.contractorEmail}
            </a>
          </p>
        </CardContent>
      </Card>

      {/* Officer */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">👤 Responsible Officer</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p className="font-bold text-base">{tender.responsibleOfficerName}</p>
          <p>
            📞{' '}
            <a href={`tel:${tender.responsibleOfficerPhone}`} className="text-blue-600 hover:underline">
              {tender.responsibleOfficerPhone}
            </a>
          </p>
          <p>
            ✉️{' '}
            <a href={`mailto:${tender.responsibleOfficerEmail}`} className="text-blue-600 hover:underline">
              {tender.responsibleOfficerEmail}
            </a>
          </p>
        </CardContent>
      </Card>

      {/* Reports on this road */}
      <div className="mb-8">
        <h2 className="font-semibold text-lg mb-3">🕳️ Pothole Reports on This Road</h2>
        {reports.length === 0 ? (
          <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-xl">
            <p className="text-3xl mb-2">✅</p>
            <p>No reports yet on this road.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <Link key={String(report._id)} href={`/report/${report._id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4 flex gap-4 items-start">
                    {report.photoUrl && (
                      <img
                        src={report.photoUrl}
                        alt="Pothole"
                        className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1 mb-1">
                        <SeverityBadge severity={report.severity} />
                        <DangerBadge danger={report.dangerLevel} />
                        <StatusBadge status={report.status} />
                      </div>
                      <p className="text-xs text-gray-500 truncate">{report.locationAddress}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(report.reportedAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CTA */}
      <Link
        href={`/report?tenderId=${tender.tenderId}`}
        className="block w-full text-center bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-base transition-colors"
      >
        📸 Report a Problem on This Road
      </Link>
    </div>
  );
}
