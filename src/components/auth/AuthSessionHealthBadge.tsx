'use client';

import { useEffect, useState } from 'react';
import { Badge } from '@/components/aurora/Badge';

type HealthState = 'checking' | 'ok' | 'error';

export function AuthSessionHealthBadge() {
  const [healthState, setHealthState] = useState<HealthState>('checking');
  const [checkVersion, setCheckVersion] = useState(0);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    let cancelled = false;

    const checkSession = async () => {
      setHealthState('checking');
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          cache: 'no-store',
          credentials: 'same-origin',
        });

        if (cancelled) return;
        setHealthState(response.ok ? 'ok' : 'error');
      } catch {
        if (cancelled) return;
        setHealthState('error');
      }
    };

    void checkSession();

    const onFocus = () => void checkSession();
    window.addEventListener('focus', onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener('focus', onFocus);
    };
  }, [checkVersion]);

  if (process.env.NODE_ENV !== 'development') return null;

  const variant = healthState === 'ok'
    ? 'success'
    : healthState === 'error'
      ? 'error'
      : 'warning';

  const text = healthState === 'ok'
    ? 'Auth Session OK'
    : healthState === 'error'
      ? 'Auth Session Error'
      : 'Auth Session Checking';

  return (
    <div className="fixed bottom-3 right-3 z-50 pointer-events-none" aria-live="polite" aria-label="Auth session health">
      <Badge size="sm" variant={variant}>
        <button
          type="button"
          className="pointer-events-auto bg-transparent"
          onClick={() => setCheckVersion((current) => current + 1)}
          aria-label="Re-check auth session health"
          title="Click to re-check auth session"
        >
          {text}
        </button>
      </Badge>
    </div>
  );
}
