import { auth } from './auth';
import { redirect } from 'next/navigation';

/**
 * Get the current user session
 * Redirects to signin if not authenticated
 */
export async function getSession() {
  const session = await auth();
  
  if (!session) {
    redirect('/auth/signin');
  }

  return session;
}

/**
 * Get the current user with optional redirect
 * @param redirectTo - URL to redirect to if not authenticated
 */
export async function getCurrentUser(redirectTo?: string) {
  const session = await auth();

  if (!session?.user) {
    if (redirectTo) {
      redirect(redirectTo);
    }
    return null;
  }

  return session.user;
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session;
}

/**
 * Get current user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id || null;
}
