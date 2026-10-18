import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PotholeReport from '@/lib/models/PotholeReport';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const body = await req.json();
    const { status, adminRemarks, assignedOfficial } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};

    if (status !== undefined) {
      if (!['Open', 'In Review', 'Resolved'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
      }
      updateData.status = status;
      if (status === 'Resolved') {
        updateData.resolvedAt = new Date();
      }
    }

    if (adminRemarks !== undefined) {
      updateData.adminRemarks = adminRemarks;
    }

    if (assignedOfficial !== undefined) {
      updateData.assignedOfficial = assignedOfficial;
    }

    const report = await PotholeReport.findByIdAndUpdate(
      params.id,
      updateData,
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
