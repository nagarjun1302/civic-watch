import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import RoadTender from '@/lib/models/RoadTender';

import { haversineDistance } from '@/lib/helpers';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const lat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : null;
    const lng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : null;
    const radius = searchParams.get('radius') ? parseFloat(searchParams.get('radius')!) : null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (status && status !== 'All') query.status = status;
    if (category && category !== 'All' && category !== 'All Categories') {
      query.category = { $regex: category, $options: 'i' };
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { tenderId: { $regex: search, $options: 'i' } },
        { 'roadLocation.locationName': { $regex: search, $options: 'i' } },
        { organisation: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
        { contractorName: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }

    const rawTenders = await RoadTender.find(query).lean();
    let resultList: any[] = rawTenders;

    if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
      const enriched = rawTenders.map((tender) => {
        const dist = haversineDistance(
          lat,
          lng,
          tender.roadLocation.lat,
          tender.roadLocation.lng
        );
        return { ...tender, distance: Math.round(dist * 10) / 10 };
      });

      if (radius !== null && !isNaN(radius)) {
        resultList = enriched.filter((t) => t.distance <= radius);
      } else {
        resultList = enriched;
      }

      resultList.sort((a, b) => a.distance - b.distance);
    }

    return NextResponse.json(resultList);

  } catch (error) {
    console.error('GET /api/road-tenders error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

