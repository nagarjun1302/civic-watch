import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PotholeReport from '@/lib/models/PotholeReport';
import { haversineDistance } from '@/lib/helpers';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseFloat(searchParams.get('radius') || '3');

    if (!lat || !lng) {
      return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
    }

    const reports = await PotholeReport.find({
      lat: { $ne: null },
      lng: { $ne: null },
    }).lean();

    const nearby = reports
      .filter((r) => typeof r.lat === 'number' && typeof r.lng === 'number')
      .map((report) => ({
        ...report,
        distance: haversineDistance(lat, lng, report.lat as number, report.lng as number),
      }))
      .filter((r) => r.distance <= radius)
      .sort((a, b) => a.distance - b.distance);

    return NextResponse.json(nearby);
  } catch (error) {
    console.error('GET /api/reports/nearby error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
