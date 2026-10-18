'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      setError('Please enter your username/email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed. Please check credentials.');
        setLoading(false);
        return;
      }

      router.push('/admin/complaints');
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-8 bg-gray-50">
      <Card className="w-full max-w-md shadow-sm border border-gray-200">
        <CardContent className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <span className="text-4xl block mb-2">🛡️</span>
            <h1 className="text-2xl font-bold text-gray-900">Admin Portal</h1>
            <p className="text-sm text-gray-500 mt-1">
              Sign in to review and manage citizen road complaints
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide block mb-1">
                Username or Email
              </label>
              <Input
                type="text"
                placeholder="admin@roadwatch.gov.in"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="bg-white"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 uppercase tracking-wide block mb-1">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white"
                autoComplete="current-password"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 rounded-lg transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In to Dashboard'}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t border-gray-100 text-center text-xs text-gray-500">
            <p className="mb-2">Default demo login: <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">admin@roadwatch.gov.in</code> / <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-800">admin123</code></p>
            <Link href="/" className="text-blue-600 hover:underline">
              ← Return to Citizen View
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
