'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Card } from '@/components/aurora/Card';
import { Button } from '@/components/aurora/Button';
import clsx from 'clsx';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(session?.user?.name || '');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isLoading = status === 'loading';

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement API call to update profile
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio, location, website }),
      });

      if (response.ok) {
        setIsEditing(false);
        // TODO: Show success message
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      // TODO: Show error message
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-600 dark:text-slate-400">
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
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

        {/* Profile Card */}
        <Card className="p-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Avatar */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-4xl font-bold shadow-xl">
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
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    {session?.user?.name || 'Not set'}
                  </div>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Email
                </label>
                <div className="text-slate-600 dark:text-slate-400">
                  {session?.user?.email}
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Bio
                </label>
                {isEditing ? (
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <div className="text-slate-600 dark:text-slate-400">
                    {bio || 'No bio yet'}
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Location
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="City, Country"
                  />
                ) : (
                  <div className="text-slate-600 dark:text-slate-400">
                    {location || 'Not specified'}
                  </div>
                )}
              </div>

              {/* Website */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Website
                </label>
                {isEditing ? (
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://yourwebsite.com"
                  />
                ) : (
                  <div className="text-slate-600 dark:text-slate-400">
                    {website ? (
                      <a 
                        href={website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline"
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
                      setName(session?.user?.name || '');
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
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-6">
            Account Information
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-700">
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-50">
                  Member Since
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-slate-200 dark:border-slate-700">
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-50">
                  Account Status
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Active
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center py-3">
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-50">
                  Email Verified
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Verified
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
