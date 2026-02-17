/**
 * Aurora Button System Showcase
 * Comprehensive demonstration of all button variants, states, sizes, and animations
 */

'use client';

import React, { useState } from 'react';
import { Button, ButtonGroup } from '@/components/ui/Button';

export default function ButtonShowcase() {
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark' | 'gray' | 'illuminated'>('dark');

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  return (
    <div className={`min-h-screen p-8 ${theme === 'light' ? 'theme-light bg-white' : theme === 'gray' ? 'theme-gray bg-gray-900' : theme === 'illuminated' ? 'theme-illuminated bg-slate-950' : 'theme-dark bg-slate-950'}`} data-theme={theme}>
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-4 aurora-text">
          Aurora Button System
        </h1>
        <p className="text-lg text-slate-400 mb-6">
          Water droplet-inspired button design with transparency, smoothness, shininess, flow, reflection, and curvature
        </p>

        {/* Theme Switcher */}
        <div className="flex gap-3 mb-8">
          <Button
            variant={theme === 'dark' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setTheme('dark')}
          >
            Dark
          </Button>
          <Button
            variant={theme === 'light' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setTheme('light')}
          >
            Light
          </Button>
          <Button
            variant={theme === 'gray' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setTheme('gray')}
          >
            Gray
          </Button>
          <Button
            variant={theme === 'illuminated' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setTheme('illuminated')}
          >
            Illuminated
          </Button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-16">
        {/* Button Variants */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-slate-200">Button Variants</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="danger">Danger</Button>
            <Button variant="notice">Notice</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="cancel">Cancel</Button>
            <Button variant="exit">Exit</Button>
          </div>
        </section>

        {/* Button Sizes */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-slate-200">Button Sizes</h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" size="sm">Small</Button>
            <Button variant="primary" size="md">Medium</Button>
            <Button variant="primary" size="lg">Large</Button>
            <Button variant="primary" size="xl">Extra Large</Button>
          </div>
        </section>

        {/* Button States */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-slate-200">Button States</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary">Default</Button>
            <Button variant="primary" disabled>Disabled</Button>
            <Button variant="primary" blocked>Blocked</Button>
            <Button variant="primary" loading disabled>
              {loading ? 'Loading...' : 'Load Demo'}
            </Button>
            <Button variant="secondary" onClick={handleLoadingDemo}>
              Trigger Loading
            </Button>
          </div>
        </section>

        {/* Button Animations */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-slate-200">Button Animations</h2>
          <div className="flex flex-wrap gap-4">
            <Button variant="primary" animation="pulse">Pulse</Button>
            <Button variant="primary" animation="breathe">Breathe</Button>
            <Button variant="primary" animation="excited">Excited (Hover)</Button>
            <Button variant="warning" animation="nervous">Nervous</Button>
            <Button variant="primary" animation="shimmer">Shimmer (Hover)</Button>
            <Button variant="notice" animation="glow">Glow</Button>
            <Button variant="success" animation="float">Float</Button>
            <Button variant="secondary" animation="liquid">Liquid Morph</Button>
          </div>
        </section>

        {/* Buttons with Icons */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-slate-200">Buttons with Icons</h2>
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="primary" 
              iconBefore={<span>🚀</span>}
            >
              Launch
            </Button>
            <Button 
              variant="success" 
              iconAfter={<span>✓</span>}
            >
              Confirm
            </Button>
            <Button 
              variant="danger" 
              iconBefore={<span>🗑️</span>}
            >
              Delete
            </Button>
            <Button 
              variant="notice" 
              iconBefore={<span>ℹ️</span>}
            >
              Info
            </Button>
          </div>
        </section>

        {/* Icon Only Buttons */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-slate-200">Icon Only Buttons</h2>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary" iconOnly size="sm">❤️</Button>
            <Button variant="secondary" iconOnly size="md">⭐</Button>
            <Button variant="success" iconOnly size="lg">✓</Button>
            <Button variant="danger" iconOnly size="xl">✕</Button>
          </div>
        </section>

        {/* Full Width Buttons */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-slate-200">Full Width Buttons</h2>
          <div className="space-y-3 max-w-md">
            <Button variant="primary" fullWidth>Full Width Primary</Button>
            <Button variant="secondary" fullWidth>Full Width Secondary</Button>
            <Button variant="success" fullWidth iconBefore={<span>✓</span>}>
              Full Width with Icon
            </Button>
          </div>
        </section>

        {/* Button Groups */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-slate-200">Button Groups</h2>
          <div className="space-y-4">
            <ButtonGroup>
              <Button variant="secondary">Left</Button>
              <Button variant="secondary">Middle</Button>
              <Button variant="secondary">Right</Button>
            </ButtonGroup>

            <ButtonGroup>
              <Button variant="primary">First</Button>
              <Button variant="primary">Second</Button>
              <Button variant="primary">Third</Button>
              <Button variant="primary">Fourth</Button>
            </ButtonGroup>

            <ButtonGroup>
              <Button variant="ghost" iconOnly>📄</Button>
              <Button variant="ghost" iconOnly>📋</Button>
              <Button variant="ghost" iconOnly>✂️</Button>
              <Button variant="ghost" iconOnly>📎</Button>
            </ButtonGroup>
          </div>
        </section>

        {/* Complex Examples */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-slate-200">Complex Examples</h2>
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex gap-3">
              <Button variant="primary" animation="shimmer" iconBefore={<span>💾</span>}>
                Save Changes
              </Button>
              <Button variant="secondary">Preview</Button>
              <Button variant="ghost">Discard</Button>
              <Button variant="danger" iconBefore={<span>🗑️</span>}>
                Delete
              </Button>
            </div>

            {/* Loading States */}
            <div className="flex gap-3">
              <Button 
                variant="primary" 
                loading={loading} 
                disabled={loading}
                onClick={handleLoadingDemo}
              >
                {loading ? 'Processing...' : 'Start Process'}
              </Button>
              <Button variant="secondary" disabled={loading}>
                Secondary Action
              </Button>
            </div>

            {/* Mixed Sizes and Variants */}
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" size="xl" animation="glow">
                Primary Action
              </Button>
              <Button variant="secondary" size="lg">
                Secondary
              </Button>
              <Button variant="ghost" size="md">
                Tertiary
              </Button>
              <Button variant="danger" size="sm" iconOnly>
                ✕
              </Button>
            </div>
          </div>
        </section>

        {/* Color Palette Overview */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-slate-200">Complete State Matrix</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(['primary', 'secondary', 'success', 'warning', 'danger', 'notice'] as const).map((variant) => (
              <div key={variant} className="space-y-3">
                <h3 className="text-sm font-medium text-slate-400 capitalize">{variant}</h3>
                <div className="space-y-2">
                  <Button variant={variant} fullWidth>Default</Button>
                  <Button variant={variant} fullWidth disabled>Disabled</Button>
                  <Button variant={variant} fullWidth blocked>Blocked</Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Documentation */}
        <section className="pb-16">
          <h2 className="text-2xl font-semibold mb-6 text-slate-200">Usage</h2>
          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
            <pre className="text-sm text-slate-300 overflow-x-auto">
              <code>{`import { Button, ButtonGroup } from '@/components/ui/Button';

// Basic usage
<Button variant="primary">Click me</Button>

// With icons
<Button 
  variant="success" 
  iconBefore={<Icon />}
  animation="shimmer"
>
  Save
</Button>

// Loading state
<Button loading disabled>Saving...</Button>

// Button group
<ButtonGroup>
  <Button variant="secondary">Left</Button>
  <Button variant="secondary">Right</Button>
</ButtonGroup>

// Available variants
'primary' | 'secondary' | 'success' | 'warning' | 
'danger' | 'notice' | 'ghost' | 'cancel' | 'exit'

// Available sizes
'sm' | 'md' | 'lg' | 'xl'

// Available animations
'pulse' | 'breathe' | 'excited' | 'nervous' | 
'shimmer' | 'glow' | 'float' | 'liquid' | 'none'`}</code>
            </pre>
          </div>
        </section>
      </div>
    </div>
  );
}
