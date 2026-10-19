import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CivicWatch — Government Tenders & Civic Accountability',
  description:
    'Explore public works tenders (buildings, construction, roads, water supply, drainage) near your location and hold contractors accountable under Defect Liability Periods.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-xs">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="text-2xl">🏛️</span>
            <div>
              <span className="font-extrabold text-base sm:text-lg text-gray-900 tracking-tight block leading-tight">
                CivicWatch
              </span>
              <span className="text-[10px] text-gray-500 font-medium block">
                Public Tenders & Accountability
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <Link
              href="/"
              className="text-gray-600 hover:text-gray-900 font-medium px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              📍 Tenders Near Me
            </Link>
            <Link
              href="/reports"
              className="text-gray-600 hover:text-gray-900 font-medium px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
              📋 Reports
            </Link>
            <Link
              href="/admin/complaints"
              className="text-gray-600 hover:text-gray-900 font-medium px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors hidden sm:inline"
            >
              🛡️ Admin
            </Link>
            <Link
              href="/report"
              className="bg-blue-600 text-white px-3.5 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-xs flex items-center gap-1.5"
            >
              <span>📸</span>
              <span>Report Issue</span>
            </Link>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
