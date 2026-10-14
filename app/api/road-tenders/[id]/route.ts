import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import RoadTender from '@/lib/models/RoadTender';
import PotholeReport from '@/lib/models/PotholeReport';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const tender = await RoadTender.findOne({ tenderId: params.id }).lean();
    if (!tender) {
      return NextResponse.json({ error: 'Tender not found' }, { status: 404 });
    }

    const reportCount = await PotholeReport.countDocuments({
      matchedTenderId: params.id,
    });

    const reports = await PotholeReport.find({ matchedTenderId: params.id })
      .sort({ reportedAt: -1 })
      .lean();

    return NextResponse.json({ ...tender, reportCount, reports });
  } catch (error) {
    console.error('GET /api/road-tenders/[id] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
