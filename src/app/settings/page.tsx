'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { Card } from '@/components/aurora/Card';
import { Button } from '@/components/aurora/Button';
import clsx from 'clsx';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Notification preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [mentionNotifications, setMentionNotifications] = useState(true);

  // Privacy settings
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'private'>('public');
  const [showEmail, setShowEmail] = useState(false);
  const [showActivity, setShowActivity] = useState(true);

  const isLoading = status === 'loading';

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/users/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });

      if (response.ok) {
        setSuccess('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to change password');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Notification preferences saved');
      setTimeout(() => setSuccess(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrivacySave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('Privacy settings saved');
      setTimeout(() => setSuccess(''), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-slate-600 dark:text-slate-400">
          Loading settings...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50">
            Settings
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Manage your account settings and preferences
          </p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-sm text-green-600 dark:text-green-400">
            {success}
          </div>
        )}

        {/* Password Change */}
        <Card className="p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-6">
            Change Password
          </h2>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Current Password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                data-autofocus="true"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                minLength={6}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={isSaving}
            >
              {isSaving ? 'Changing Password...' : 'Change Password'}
            </Button>
          </form>
        </Card>

        {/* Notification Preferences */}
        <Card className="p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-6">
            Notification Preferences
          </h2>
          <div className="space-y-4">
            <label className="flex items-center justify-between py-3 cursor-pointer">
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-50">
                  Email Notifications
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Receive email updates about your activity
                </div>
              </div>
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between py-3 cursor-pointer">
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-50">
                  Push Notifications
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Receive push notifications in your browser
                </div>
              </div>
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={(e) => setPushNotifications(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between py-3 cursor-pointer">
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-50">
                  Message Notifications
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Get notified when you receive new messages
                </div>
              </div>
              <input
                type="checkbox"
                checked={messageNotifications}
                onChange={(e) => setMessageNotifications(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between py-3 cursor-pointer">
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-50">
                  Mention Notifications
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Get notified when someone mentions you
                </div>
              </div>
              <input
                type="checkbox"
                checked={mentionNotifications}
                onChange={(e) => setMentionNotifications(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <Button
              variant="primary"
              onClick={handleNotificationSave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Notification Preferences'}
            </Button>
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card className="p-8">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 mb-6">
            Privacy Settings
          </h2>
          <div className="space-y-4">
            <div className="py-3">
              <label className="block font-medium text-slate-900 dark:text-slate-50 mb-2">
                Profile Visibility
              </label>
              <select
                value={profileVisibility}
                onChange={(e) => setProfileVisibility(e.target.value as 'public' | 'private')}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>

            <label className="flex items-center justify-between py-3 cursor-pointer">
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-50">
                  Show Email Address
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Display your email on your public profile
                </div>
              </div>
              <input
                type="checkbox"
                checked={showEmail}
                onChange={(e) => setShowEmail(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between py-3 cursor-pointer">
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-50">
                  Show Activity Status
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Let others see when you're online
                </div>
              </div>
              <input
                type="checkbox"
                checked={showActivity}
                onChange={(e) => setShowActivity(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
            </label>

            <Button
              variant="primary"
              onClick={handlePrivacySave}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Privacy Settings'}
            </Button>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-8 border-2 border-red-200 dark:border-red-800">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-6">
            Danger Zone
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-50">
                  Delete Account
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Permanently delete your account and all associated data
                </div>
              </div>
              <Button variant="accent" size="sm">
                Delete Account
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
