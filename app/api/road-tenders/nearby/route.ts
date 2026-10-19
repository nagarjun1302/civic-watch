import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import RoadTender from '@/lib/models/RoadTender';
import { haversineDistance } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lng = parseFloat(searchParams.get('lng') || '0');
    const radius = parseFloat(searchParams.get('radius') || '5');

    if (!lat || !lng) {
      return NextResponse.json({ error: 'lat and lng are required' }, { status: 400 });
    }

    const category = searchParams.get('category');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (category && category !== 'All' && category !== 'All Categories') {
      query.category = { $regex: category, $options: 'i' };
    }

    const tenders = await RoadTender.find(query).lean();

    const nearby = tenders
      .map((tender) => {
        const distance = haversineDistance(
          lat,
          lng,
          tender.roadLocation.lat,
          tender.roadLocation.lng
        );
        return { ...tender, distance: Math.round(distance * 10) / 10 };
      })
      .filter((t) => t.distance <= radius + (t.roadLocation?.radiusKm || 0))
      .sort((a, b) => a.distance - b.distance);

    return NextResponse.json(nearby);

  } catch (error) {
    console.error('GET /api/road-tenders/nearby error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
