'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/aurora/Card';
import { AuroraLogo } from '@/components/aurora/AuroraLogo';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push('/');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4">
      <Card className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <AuroraLogo size={120} interactive={true} showNav={true} />
        </div>
        <div className="space-y-2">
          <h1 className="aurora-heading-2">
            Sign In to Aurora
          </h1>
          <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">
            Welcome back to your digital civilization platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="aurora-label p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label htmlFor="email" className="aurora-label block text-slate-600 dark:text-slate-400">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              data-autofocus="true"
              className="aurora-label w-full px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 placeholder:opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="aurora-label block text-slate-600 dark:text-slate-400">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="aurora-label w-full px-3 py-2 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 placeholder:opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="aurora-label px-2 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400">
              Demo Credentials
            </span>
          </div>
        </div>

        <div className="aurora-label bg-slate-50 dark:bg-slate-900/50 rounded p-3 text-xs space-y-1 text-slate-600 dark:text-slate-400">
          <p>
            <span className="aurora-label font-semibold">Email:</span> aurora@example.com
          </p>
          <p>
            <span className="aurora-label font-semibold">Password:</span> password123
          </p>
        </div>

        <div className="text-center">
          <p className="aurora-label text-sm text-slate-600 dark:text-slate-400">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="aurora-label font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}
