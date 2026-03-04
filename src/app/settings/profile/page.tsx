'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/aurora/Card';
import Link from 'next/link';

interface UserProfile {
  id: string;
  email: string | null;
  name: string | null;
  displayName: string | null;
  image: string | null;
  emailVerified: Date | null;
  createdAt: Date | null;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    name: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Fetch user profile
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }

    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/users/profile');
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          displayName: data.displayName || '',
          name: data.name || '',
        });
      }
    } catch (err) {
      console.error('Failed to fetch profile:', err);
      setError('Failed to load profile');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    setError('');
    setMessage('');
    setIsSaving(true);

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setMessage('Profile updated successfully');
        setIsEditing(false);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="aurora-heading-1">Your Profile</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Manage your Aurora account settings
            </p>
          </div>
          <Link href="/dashboard">
            <Button variant="secondary">← Back to Dashboard</Button>
          </Link>
        </div>

        {/* Messages */}
        {message && (
          <div className="ring-1 ring-green-200 dark:ring-green-800 bg-green-50 dark:bg-green-900/20 p-4 rounded text-sm text-green-700 dark:text-green-400">
            ✓ {message}
          </div>
        )}
        {error && (
          <div className="ring-1 ring-red-200 dark:ring-red-800 bg-red-50 dark:bg-red-900/20 p-4 rounded text-sm text-red-700 dark:text-red-400">
            ✗ {error}
          </div>
        )}

        {/* Profile Card */}
        <Card className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-6">
            {profile.image && (
              <img
                src={profile.image}
                alt={profile.displayName || 'Aurora User'}
                className="w-24 h-24 rounded-full object-cover"
              />
            )}
            <div className="flex-1">
              <h2 className="aurora-heading-2">{profile.displayName || 'Aurora User'}</h2>
              <p className="text-slate-600 dark:text-slate-400">{profile.email}</p>
              {profile.emailVerified && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-2">
                  ✓ Email verified
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700"></div>

          {/* Account Information */}
          {!isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Display Name
                </label>
                <p className="text-slate-900 dark:text-slate-100">
                  {profile.displayName || 'Not set'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <p className="text-slate-900 dark:text-slate-100">
                  {profile.name || 'Not set'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <p className="text-slate-900 dark:text-slate-100">{profile.email}</p>
              </div>
              {profile.createdAt && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Account Created
                  </label>
                  <p className="text-slate-600 dark:text-slate-400">
                    {new Date(profile.createdAt).toLocaleDateString()}
                  </p>
                </div>
              )}
              <Button 
                variant="primary" 
                onClick={() => setIsEditing(true)}
                className="mt-4"
              >
                Edit Profile
              </Button>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 rounded border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      displayName: profile.displayName || '',
                      name: profile.name || '',
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </Card>

        {/* Security Section */}
        <Card className="space-y-6">
          <div>
            <h3 className="aurora-heading-3">Security</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Manage your account security settings
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded bg-slate-50 dark:bg-slate-900/50">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                  Password
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Update your password
                </p>
              </div>
              <Link href="/settings/change-password">
                <Button variant="secondary" size="sm">
                  Change Password
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-between p-4 rounded bg-slate-50 dark:bg-slate-900/50">
              <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-100">
                  Sign Out
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Sign out from this device
                </p>
              </div>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
