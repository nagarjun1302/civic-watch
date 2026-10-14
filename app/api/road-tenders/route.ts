import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import RoadTender from '@/lib/models/RoadTender';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'roadLocation.locationName': { $regex: search, $options: 'i' } },
        { organisation: { $regex: search, $options: 'i' } },
      ];
    }

    const tenders = await RoadTender.find(query).lean();
    return NextResponse.json(tenders);
  } catch (error) {
    console.error('GET /api/road-tenders error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
