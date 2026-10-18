import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RoadWatch — Citizen Road Accountability',
  description:
    'Report potholes, find responsible contractors, and file accountability complaints using government tender data.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🛣️</span>
            <span className="font-bold text-lg text-gray-900">RoadWatch</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/reports" className="text-gray-600 hover:text-gray-900 font-medium">
              Browse Reports
            </Link>
            <Link href="/admin/complaints" className="text-gray-600 hover:text-gray-900 font-medium">
              🛡️ Admin
            </Link>
            <Link
              href="/report"
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
            >
              📸 Report
            </Link>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
