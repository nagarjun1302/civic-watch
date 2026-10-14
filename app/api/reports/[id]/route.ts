import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PotholeReport from '@/lib/models/PotholeReport';

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const report = await PotholeReport.findById(params.id).lean();
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('GET /api/reports/[id] error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
