import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PotholeReport from '@/lib/models/PotholeReport';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const { status } = await req.json();

    if (!['Open', 'In Review', 'Resolved'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
    }

    const report = await PotholeReport.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    ).lean();

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error) {
    console.error('PATCH /api/reports/[id]/status error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
