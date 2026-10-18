import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import AdminUser from '@/lib/models/AdminUser';
import { verifyPassword, hashPassword, signAdminToken, COOKIE_NAME } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { identifier, password } = body;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Username/Email and password are required' },
        { status: 400 }
      );
    }

    const cleanIdentifier = identifier.trim().toLowerCase();

    // Auto-initialize default admin if no admin accounts exist yet
    const adminCount = await AdminUser.countDocuments();
    if (adminCount === 0) {
      const defaultPasswordHash = await hashPassword('admin123');
      await AdminUser.create({
        username: 'admin',
        email: 'admin@roadwatch.gov.in',
        passwordHash: defaultPasswordHash,
        name: 'Municipal Administrator',
        role: 'admin',
      });
      console.log('Default admin created: admin@roadwatch.gov.in / admin123');
    }

    const admin = await AdminUser.findOne({
      $or: [{ email: cleanIdentifier }, { username: cleanIdentifier }],
    });

    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, admin.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = await signAdminToken({
      userId: admin._id.toString(),
      username: admin.username,
      email: admin.email,
      role: admin.role,
      name: admin.name,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        name: admin.name,
        role: admin.role,
      },
    });

    // Set HTTP-Only Cookie
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Admin Login Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
