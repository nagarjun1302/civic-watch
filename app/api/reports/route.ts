import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import PotholeReport from '@/lib/models/PotholeReport';

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const tenderId = searchParams.get('tenderId');
    const city = searchParams.get('city');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = {};
    if (status) query.status = status;
    if (tenderId) query.matchedTenderId = tenderId;
    if (city) {
      query.$or = [
        { city: { $regex: city, $options: 'i' } },
        { locationAddress: { $regex: city, $options: 'i' } },
      ];
    }

    const reports = await PotholeReport.find(query)
      .sort({ reportedAt: -1 })
      .lean();

    return NextResponse.json(reports);
  } catch (error) {
    console.error('GET /api/reports error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const {
      photoUrl,
      lat,
      lng,
      city,
      locationAddress,
      description,
      severity,
      dangerLevel,
      matchedTenderId,
      matchedTenderTitle,
      contractorName,
      responsibleOfficerName,
    } = body;

    const report = await PotholeReport.create({
      photoUrl,
      lat: lat ?? null,
      lng: lng ?? null,
      city: city || locationAddress || '',
      locationAddress: locationAddress || city || 'Unknown Location',
      description: description || '',
      severity,
      dangerLevel,
      matchedTenderId: matchedTenderId || null,
      matchedTenderTitle: matchedTenderTitle || '',
      contractorName: contractorName || '',
      responsibleOfficerName: responsibleOfficerName || '',
      status: 'Open',
      reportedAt: new Date(),
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('POST /api/reports error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
