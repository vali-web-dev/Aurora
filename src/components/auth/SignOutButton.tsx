'use client';

import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

export function SignOutButton() {
  const { data: session } = useSession();

  if (!session) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => signOut({ callbackUrl: '/' })}
    >
      Sign Out
    </Button>
  );
}
