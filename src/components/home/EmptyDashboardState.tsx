'use client';

import { useState } from 'react';
import { Card } from '@/components/aurora/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import clsx from 'clsx';

interface EmptyDashboardStateProps {
  onSampleDataCreated?: () => void;
}

export function EmptyDashboardState({ onSampleDataCreated }: EmptyDashboardStateProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleCreateSampleData = async () => {
    setIsCreating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/users/seed-sample-data', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onSampleDataCreated?.();
        }, 1500);
      } else {
        setError(data.error || 'Failed to create sample data');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  if (success) {
    return (
      <Card className="p-12 text-center">
        <div className="text-6xl mb-4">✨</div>
        <h3 className="aurora-label text-2xl font-bold text-slate-900 dark:text-slate-50 mb-2">
          Sample Data Created!
        </h3>
        <p className="aurora-label text-slate-600 dark:text-slate-400 mb-6">
          Your dashboard is now populated with sample content. Refreshing...
        </p>
        <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin transform-gpu" />
      </Card>
    );
  }

  return (
    <Card className="p-12">
      <div className="max-w-2xl mx-auto text-center space-y-6">
        {/* Icon */}
        <div className="text-7xl mb-6">🌟</div>
        
        {/* Heading */}
        <div>
          <h2 className="aurora-heading-1 mb-3">
            Welcome to Your Aurora Dashboard!
          </h2>
          <p className="aurora-label text-lg text-slate-600 dark:text-slate-400">
            Your personal command center awaits. Start exploring the universes and watch your dashboard come to life.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="aurora-label text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Quick start options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
          <div className={clsx(
            'p-6 rounded-xl text-left',
            'bg-gradient-to-br from-blue-50 to-purple-50',
            'dark:from-blue-900/20 dark:to-purple-900/20',
            'border-2 border-blue-200 dark:border-blue-800'
          )}>
            <div className="text-3xl mb-3">🚀</div>
            <h3 className="aurora-label text-slate-900 dark:text-slate-50 mb-2">
              Start Fresh
            </h3>
            <p className="aurora-label text-sm text-slate-600 dark:text-slate-400 mb-4">
              Explore Aurora universes and create your own content organically
            </p>
            <div className="flex flex-wrap gap-2">
              <Link href="/social">
                <Button variant="secondary" size="sm">
                  Social 👥
                </Button>
              </Link>
              <Link href="/entertainment">
                <Button variant="secondary" size="sm">
                  Entertainment 🎬
                </Button>
              </Link>
              <Link href="/learning">
                <Button variant="secondary" size="sm">
                  Learning 📚
                </Button>
              </Link>
            </div>
          </div>

          <div className={clsx(
            'p-6 rounded-xl text-left',
            'bg-gradient-to-br from-emerald-50 to-teal-50',
            'dark:from-emerald-900/20 dark:to-teal-900/20',
            'border-2 border-emerald-200 dark:border-emerald-800'
          )}>
            <div className="text-3xl mb-3">✨</div>
            <h3 className="aurora-label text-slate-900 dark:text-slate-50 mb-2">
              Try Sample Data
            </h3>
            <p className="aurora-label text-sm text-slate-600 dark:text-slate-400 mb-4">
              See how Aurora works with sample posts, communities, and activity
            </p>
            <Button
              variant="aurora"
              size="sm"
              onClick={handleCreateSampleData}
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin transform-gpu mr-2" />
                  Creating...
                </>
              ) : (
                'Create Sample Data'
              )}
            </Button>
          </div>
        </div>

        {/* Getting started tips */}
        <div className="pt-8 border-t border-slate-200 dark:border-slate-800">
          <h4 className="aurora-label text-slate-900 dark:text-slate-50 mb-4">
            Quick Tips to Get Started:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <div className="text-2xl mb-2">📝</div>
              <div className="aurora-label text-sm text-slate-900 dark:text-slate-50 mb-1">
                Create a Post
              </div>
              <div className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                Share your thoughts in the Social Universe
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <div className="text-2xl mb-2">👥</div>
              <div className="aurora-label text-sm text-slate-900 dark:text-slate-50 mb-1">
                Join a Community
              </div>
              <div className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                Connect with others who share your interests
              </div>
            </div>
            
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <div className="text-2xl mb-2">🛍️</div>
              <div className="aurora-label text-sm text-slate-900 dark:text-slate-50 mb-1">
                Shop & Explore
              </div>
              <div className="aurora-label text-xs text-slate-600 dark:text-slate-400">
                Browse products from multiple providers
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
