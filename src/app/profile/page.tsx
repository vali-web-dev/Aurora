'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/aurora/Card';
import { Button } from '@/components/ui/Button';
import { InlineNotice } from '@/components/ui/InlineNotice';
import { AuroraShell } from '@/components/os/AuroraShell';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(session?.user?.name || '');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState<{ message: string; tone: 'success' | 'error' | 'info' | 'warning' } | null>(null);
  const nameInputRef = useRef<HTMLInputElement | null>(null);

  const isLoading = status === 'loading';

  useEffect(() => {
    if (!isEditing) return;
    const handle = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 0);
    return () => clearTimeout(handle);
  }, [isEditing]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const loadProfile = async () => {
      try {
        const [profileResponse, settingsResponse] = await Promise.all([
          fetch('/api/users/profile'),
          fetch('/api/users/settings'),
        ]);

        if (profileResponse.ok) {
          const profile = await profileResponse.json();
          if (typeof profile?.name === 'string') {
            setName(profile.name);
          }
        }

        if (settingsResponse.ok) {
          const settings = await settingsResponse.json();
          const extras = settings?.profile;
          if (extras && typeof extras === 'object') {
            setBio(typeof extras.bio === 'string' ? extras.bio : '');
            setLocation(typeof extras.location === 'string' ? extras.location : '');
            setWebsite(typeof extras.website === 'string' ? extras.website : '');
          }
        }
      } catch (error) {
        console.error('Failed to load profile settings:', error);
      }
    };

    loadProfile();
  }, [session?.user?.id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const [profileResponse, settingsResponse] = await Promise.all([
        fetch('/api/users/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        }),
        fetch('/api/users/settings', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile: { bio, location, website },
          }),
        }),
      ]);

      if (profileResponse.ok && settingsResponse.ok) {
        setIsEditing(false);
        setNotice({ message: 'Profile updated successfully.', tone: 'success' });
      } else {
        const profileError = profileResponse.ok ? null : await profileResponse.json().catch(() => null);
        const settingsError = settingsResponse.ok ? null : await settingsResponse.json().catch(() => null);
        const message =
          profileError?.error ||
          settingsError?.error ||
          'Failed to update profile.';
        setNotice({ message, tone: 'error' });
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      setNotice({ message: 'Failed to update profile.', tone: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="aurora-label animate-pulse transform-gpu text-slate-600 dark:text-slate-400">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <AuroraShell>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="aurora-heading-1">
            Your Profile
          </h1>
          {!isEditing && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </div>

        {notice && <InlineNotice message={notice.message} tone={notice.tone} />}

        {/* Profile Card */}
        <Card className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="aurora-label w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                {session?.user?.name?.charAt(0)?.toUpperCase() || session?.user?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              {isEditing && (
                <Button variant="secondary" size="sm">
                  Change Photo
                </Button>
              )}
            </div>

            {/* Profile Details */}
            <div className="flex-1 space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="aurora-label text-slate-700 dark:text-slate-300">
                  Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    ref={nameInputRef}
                    data-autofocus="true"
                    className="aurora-label w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="aurora-label text-lg font-semibold text-slate-900 dark:text-slate-50">
                    {session?.user?.name || 'Not set'}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="aurora-label text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <div className="aurora-label text-slate-600 dark:text-slate-400">
                  {session?.user?.email}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="aurora-label text-slate-700 dark:text-slate-300">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="aurora-label w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 placeholder:opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <div className="aurora-label text-slate-600 dark:text-slate-400">
                    {bio || 'No bio yet'}
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="aurora-label text-slate-700 dark:text-slate-300">
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="aurora-label w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 placeholder:opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City, Country"
                  />
                ) : (
                  <div className="aurora-label text-slate-600 dark:text-slate-400">
                    {location || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Website */}
              <div className="space-y-2">
                <label className="aurora-label text-slate-700 dark:text-slate-300">
                  Website
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="aurora-label w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 placeholder:opacity-70 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://yourwebsite.com"
                  />
                ) : (
                  <div className="aurora-label text-slate-600 dark:text-slate-400">
                    {website ? (
                      <a 
                        href={website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="aurora-label text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        {website}
                      </a>
                    ) : (
                      'Not specified'
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="primary"
                    onClick={handleSave}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsEditing(false);
                      setNotice(null);
                    }}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Account Information */}
        <Card className="p-8">
          <h2 className="aurora-label text-xl font-bold text-slate-900 dark:text-slate-50 mb-6">
            Account Information
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-700">
              <div>
                <div className="aurora-label text-slate-900 dark:text-slate-50">
                  Member Since
                </div>
                <div className="aurora-label text-sm text-slate-600 dark:text-slate-400">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-700">
              <div>
                <div className="aurora-label text-slate-900 dark:text-slate-50">
                  Account Status
                </div>
                <div className="aurora-label text-sm text-green-600 dark:text-green-400">
                  Active
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center py-3">
              <div>
                <div className="aurora-label text-slate-900 dark:text-slate-50">
                  Email Verified
                </div>
                <div className="aurora-label text-sm text-green-600 dark:text-green-400">
                  Verified
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
    </AuroraShell>
  );
}
