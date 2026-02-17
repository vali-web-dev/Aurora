/**
 * Aurora Button System - Advanced Features Showcase
 * Demonstrates all specialized button components and hooks
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { IconButton, ToggleButton, DropdownButton } from '@/components/ui/SpecializedButtons';
import { SplitButton } from '@/components/ui/SplitButton';
import { FloatingActionButton } from '@/components/ui/FloatingActionButton';
import { useButtonState, useKeyboardShortcut } from '@/components/ui/useButtonHooks';

export default function AdvancedButtonShowcase() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [selectedView, setSelectedView] = useState('grid');
  const [notificationCount, setNotificationCount] = useState(3);
  const [selectedSort, setSelectedSort] = useState('date');

  // Button state hook example
  const saveButton = useButtonState({
    asyncFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true };
    },
    onSuccess: () => console.log('Saved!'),
    onError: (error) => console.error('Save failed:', error),
  });

  // Keyboard shortcut example
  useKeyboardShortcut({
    shortcut: 'Ctrl+S',
    onTrigger: () => {
      console.log('Save shortcut triggered!');
      saveButton.execute();
    },
  });

  return (
    <div className={`min-h-screen p-8 ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-slate-950 text-slate-100'}`} data-theme={theme}>
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-4 aurora-text">
            Advanced Button Features
          </h1>
          <p className="text-lg text-slate-400 mb-6">
            Specialized components, hooks, and interactive features
          </p>
          <Button
            variant={theme === 'dark' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            Toggle Theme
          </Button>
        </div>

        {/* Enhanced Buttons with Tooltips & Shortcuts */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Enhanced Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="primary"
              tooltip="Save your changes"
              shortcut="Ctrl+S"
              ripple={true}
              sound="click"
              onClick={() => console.log('Clicked!')}
            >
              Save (Ctrl+S)
            </Button>

            <Button
              variant="success"
              tooltip="Upload file"
              tooltipPosition="bottom"
              ripple={true}
              iconBefore={<span>📤</span>}
            >
              Upload
            </Button>

            <Button
              variant="danger"
              tooltip="This action cannot be undone"
              tooltipPosition="left"
              animation="nervous"
            >
              Delete Account
            </Button>

            <Button
              variant="primary"
              loading={saveButton.loading}
              loadingProgress={saveButton.loading ? 65 : undefined}
              disabled={saveButton.loading}
              onClick={() => saveButton.execute()}
            >
              {saveButton.loading ? 'Saving...' : 'Save with Progress'}
            </Button>
          </div>
        </section>

        {/* Buttons with Badges */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Buttons with Badges</h2>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="secondary"
              badge={notificationCount}
              badgeVariant="danger"
              iconBefore={<span>🔔</span>}
            >
                Notifications
            </Button>

            <Button
              variant="ghost"
              badge="NEW"
              badgeVariant="primary"
            >
              New Feature
            </Button>

            <Button
              variant="secondary"
              badge={12}
              badgeVariant="success"
              iconBefore={<span>💬</span>}
            >
              Messages
            </Button>

            <Button
              variant="primary"
              onClick={() => setNotificationCount(prev => prev + 1)}
            >
              Add Notification
            </Button>
          </div>
        </section>

        {/* Icon Buttons */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Icon Buttons</h2>
          <div className="flex flex-wrap items-center gap-4">
            <IconButton
              icon={<span>⚙️</span>}
              variant="ghost"
              size="sm"
              tooltip="Settings"
              aria-label="Settings"
            />

            <IconButton
              icon={<span>❤️</span>}
              variant="danger"
              size="md"
              tooltip="Like"
              aria-label="Like"
            />

            <IconButton
              icon={<span>⭐</span>}
              variant="warning"
              size="lg"
              animation="glow"
              tooltip="Star"
              aria-label="Star"
            />

            <IconButton
              icon={<span>✓</span>}
              variant="success"
              size="xl"
              tooltip="Confirm"
              aria-label="Confirm"
            />
          </div>
        </section>

        {/* Toggle Buttons */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Toggle Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <ToggleButton
              selected={selectedView === 'grid'}
              onSelectedChange={(selected) => setSelectedView(selected ? 'grid' : 'list')}
              selectedIcon={<span>▦</span>}
              unselectedIcon={<span>▦</span>}
              selectedLabel="Grid View"
              unselectedLabel="Grid View"
            />

            <ToggleButton
              selected={selectedView === 'list'}
              onSelectedChange={(selected) => setSelectedView(selected ? 'list' : 'grid')}
              selectedIcon={<span>☰</span>}
              unselectedIcon={<span>☰</span>}
              selectedLabel="List View"
              unselectedLabel="List View"
            />

            <ToggleButton
              selected={false}
              selectedIcon={<span>🔊</span>}
              unselectedIcon={<span>🔇</span>}
              variant="ghost"
              size="lg"
            />
          </div>
        </section>

        {/* Dropdown Button */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Dropdown Button</h2>
          <div className="flex flex-wrap gap-4">
            <DropdownButton
              label={`Sort by: ${selectedSort.charAt(0).toUpperCase() + selectedSort.slice(1)}`}
              variant="secondary"
              value={selectedSort}
              onSelect={setSelectedSort}
              items={[
                { label: 'Date', value: 'date', icon: <span>📅</span> },
                { label: 'Name', value: 'name', icon: <span>🔤</span> },
                { label: 'Size', value: 'size', icon: <span>📊</span> },
                { label: 'Modified', value: 'modified', icon: <span>⏰</span>, divider: true },
                { label: 'Custom...', value: 'custom', disabled: true },
              ]}
            />

            <DropdownButton
              label="Actions"
              variant="primary"
              onSelect={(value) => console.log('Selected:', value)}
              placement="bottom-end"
              items={[
                { label: 'Edit', value: 'edit', icon: <span>✏️</span>, shortcut: 'Ctrl+E' },
                { label: 'Duplicate', value: 'duplicate', icon: <span>📋</span>, shortcut: 'Ctrl+D' },
                { label: 'Share', value: 'share', icon: <span>🔗</span>, divider: true },
                { label: 'Delete', value: 'delete', icon: <span>🗑️</span>, variant: 'danger', shortcut: 'Del' },
              ]}
            />
          </div>
        </section>

        {/* Split Button */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Split Button</h2>
          <div className="flex flex-wrap gap-4">
            <SplitButton
              label="Deploy"
              variant="success"
              onClick={() => console.log('Deploy clicked')}
              actions={[
                { label: 'Deploy to Production', onClick: () => console.log('Production') },
                { label: 'Deploy to Staging', onClick: () => console.log('Staging') },
                { label: 'Deploy to Development', onClick: () => console.log('Development') },
              ]}
            />

            <SplitButton
              label="Save"
              variant="primary"
              onClick={() => console.log('Save clicked')}
              actions={[
                { label: 'Save', onClick: () => console.log('Save'), shortcut: 'Ctrl+S' },
                { label: 'Save As...', onClick: () => console.log('Save As'), shortcut: 'Ctrl+Shift+S' },
                { label: 'Save All', onClick: () => console.log('Save All') },
              ]}
            />
          </div>
        </section>

        {/* Permission-based Buttons */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Permission-based Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="primary"
              permission="admin"
              tooltip="Requires admin permission"
            >
              Admin Action
            </Button>

            <Button
              variant="danger"
              permission={['admin', 'moderator']}
              tooltip="Requires admin or moderator permission"
            >
              Moderate Content
            </Button>

            <Button
              variant="success"
              permission={(context) => context?.isPremium === true}
              permissionContext={{ isPremium: false }}
              tooltip="Premium feature"
            >
              Premium Feature 💎
            </Button>
          </div>
        </section>

        {/* Analytics Tracking */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Analytics Tracking</h2>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="primary"
              analyticsEvent="button_click"
              analyticsProps={{ location: 'showcase', button: 'sign_up' }}
            >
              Sign Up (Tracked)
            </Button>

            <Button
              variant="success"
              analyticsEvent="purchase_initiated"
              analyticsProps={{ product: 'pro_plan', value: 99 }}
            >
              Buy Now (Tracked)
            </Button>
          </div>
        </section>

        {/* Complex Examples */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Complex Examples</h2>
          <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex gap-2 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <IconButton icon={<span>↶</span>} variant="ghost" aria-label="Undo" tooltip="Undo (Ctrl+Z)" />
              <IconButton icon={<span>↷</span>} variant="ghost" aria-label="Redo" tooltip="Redo (Ctrl+Y)" />
              <div className="w-px h-8 bg-slate-700" />
              <IconButton icon={<span>📄</span>} variant="ghost" aria-label="New" tooltip="New (Ctrl+N)" />
              <IconButton icon={<span>📂</span>} variant="ghost" aria-label="Open" tooltip="Open (Ctrl+O)" />
              <IconButton icon={<span>💾</span>} variant="ghost" aria-label="Save" tooltip="Save (Ctrl+S)" />
              <div className="w-px h-8 bg-slate-700" />
              <ToggleButton
                selected={false}
                selectedIcon={<span>B</span>}
                unselectedIcon={<span>B</span>}
                variant="ghost"
                size="sm"
              />
              <ToggleButton
                selected={false}
                selectedIcon={<span>I</span>}
                unselectedIcon={<span>I</span>}
                variant="ghost"
                size="sm"
              />
              <ToggleButton
                selected={false}
                selectedIcon={<span>U</span>}
                unselectedIcon={<span>U</span>}
                variant="ghost"
                size="sm"
              />
            </div>

            {/* Action Bar */}
            <div className="flex justify-between items-center p-4 bg-slate-900/50 rounded-lg border border-slate-700">
              <div className="flex gap-3">
                <Button variant="ghost" iconBefore={<span>←</span>}>Back</Button>
                <Button variant="primary" animation="shimmer">Save Changes</Button>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary">Preview</Button>
                <SplitButton
                  label="Publish"
                  variant="success"
                  onClick={() => console.log('Publish')}
                  actions={[
                    { label: 'Publish Now', onClick: () => console.log('Now') },
                    { label: 'Schedule...', onClick: () => console.log('Schedule') },
                    { label: 'Save as Draft', onClick: () => console.log('Draft') },
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Documentation */}
        <section className="pb-16">
          <h2 className="text-2xl font-semibold mb-6">New Features</h2>
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-semibold mb-2">✨ Enhanced Button Features</h3>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                <li>Tooltips with automatic keyboard shortcut display</li>
                <li>Ripple effect on click (Material Design inspired)</li>
                <li>Loading progress bar indicator</li>
                <li>Badge support with multiple variants</li>
                <li>Permission-based button enabling</li>
                <li>Analytics event tracking integration</li>
                <li>Haptic feedback support (mobile)</li>
                <li>Sound effects on interaction</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">🎯 Specialized Components</h3>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                <li><strong>IconButton</strong>: Square buttons for icon-only actions</li>
                <li><strong>ToggleButton</strong>: Selected/unselected state management</li>
                <li><strong>DropdownButton</strong>: Menu with checkmarks and keyboard shortcuts</li>
                <li><strong>SplitButton</strong>: Primary action + dropdown menu</li>
                <li><strong>FloatingActionButton</strong>: Positioned FAB with expand option</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">🪝 Custom Hooks</h3>
              <ul className="list-disc list-inside text-slate-400 space-y-1">
                <li><strong>useButtonState</strong>: Async action management with loading states</li>
                <li><strong>useButtonAnalytics</strong>: Event tracking integration</li>
                <li><strong>useKeyboardShortcut</strong>: Global keyboard shortcut registration</li>
                <li><strong>useButtonSound</strong>: Audio feedback management</li>
                <li><strong>useHaptic</strong>: Vibration feedback on supported devices</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Floating Action Button (outside main content) */}
        <FloatingActionButton
          icon={<span style={{ fontSize: '28px' }}>+</span>}
          label="Create New"
          variant="primary"
          position="bottom-right"
          expanded={false}
          onClick={() => console.log('FAB clicked')}
          tooltip="Create new item (Ctrl+N)"
        />
      </div>
    </div>
  );
}
