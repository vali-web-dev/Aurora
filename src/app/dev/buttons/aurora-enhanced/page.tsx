/**
 * Aurora Enhanced Button System
 * Showcasing the Aurora-inspired water droplet design with emotional intelligence
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { IconButton, ToggleButton } from '@/components/ui/SpecializedButtons';

export default function AuroraEnhancedShowcase() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  return (
    <div 
      className={`min-h-screen p-8 ${theme === 'light' ? 'bg-gradient-to-br from-slate-50 via-purple-50 to-slate-100' : 'bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900'}`} 
      data-theme={theme}
    >
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center">
          <div className="inline-block mb-6">
            <h1 className="text-6xl font-bold mb-2 aurora-text">
              Aurora Enhanced
            </h1>
            <div className="h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full"></div>
          </div>
          <p className="text-xl text-slate-400 mb-8 max-w-3xl mx-auto">
            Experience the complete water droplet aesthetic with enhanced contrast,
            emotional warmth, and Aurora&apos;s signature luminous flow
          </p>
          <Button
            variant={theme === 'dark' ? 'primary' : 'secondary'}
            size="lg"
            animation="shimmer"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? '☀️' : '🌙'} Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode
          </Button>
        </div>

        {/* Aurora Principles */}
        <section className="bg-slate-900/30 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8">
          <h2 className="text-2xl font-semibold mb-6 aurora-text">Aurora Design Principles</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-4xl mb-3">💧</div>
              <h3 className="font-semibold text-lg">Water Droplet Flow</h3>
              <p className="text-slate-400 text-sm">
                Smooth gradients, reflective surfaces, curved edges that mimic
                the natural beauty of water
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl mb-3">✨</div>
              <h3 className="font-semibold text-lg">Emotional Intelligence</h3>
              <p className="text-slate-400 text-sm">
                Warm, inviting colors with purposeful animations that respond
                to user intent and context
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="font-semibold text-lg">Enhanced Contrast</h3>
              <p className="text-slate-400 text-sm">
                WCAG AAA compliant text readability with luminous glows that
                enhance rather than obscure
              </p>
            </div>
          </div>
        </section>

        {/* Primary Actions - The Hero Buttons */}
        <section>
          <h2 className="text-3xl font-semibold mb-8 aurora-text">Primary Actions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-900/20 backdrop-blur-sm border border-purple-500/10 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-6">Primary Button</h3>
              <div className="space-y-4">
                <Button variant="primary" size="xl" fullWidth animation="shimmer">
                  Get Started with Aurora
                </Button>
                <p className="text-sm text-slate-400">
                  Enhanced 3-stop gradient • Luminous glow • WCAG AAA text • Premium feel
                </p>
              </div>
            </div>

            <div className="bg-slate-900/20 backdrop-blur-sm border border-purple-500/10 rounded-xl p-8">
              <h3 className="text-xl font-semibold mb-6">Secondary Button</h3>
              <div className="space-y-4">
                <Button variant="secondary" size="xl" fullWidth>
                  Learn More
                </Button>
                <p className="text-sm text-slate-400">
                  Glass morphism • Backdrop blur • Subtle Aurora presence • Clean & minimal
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Emotional State Buttons */}
        <section>
          <h2 className="text-3xl font-semibold mb-8 aurora-text">Emotional States</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-4">
              <Button variant="success" size="lg" fullWidth iconBefore={<span>✓</span>}>
                Success Action
              </Button>
              <p className="text-sm text-slate-400 text-center">
                Positive reinforcement with warm emerald glow
              </p>
            </div>

            <div className="space-y-4">
              <Button variant="warning" size="lg" fullWidth iconBefore={<span>⚠️</span>}>
                Warning State
              </Button>
              <p className="text-sm text-slate-400 text-center">
                Dark text on bright amber for maximum visibility
              </p>
            </div>

            <div className="space-y-4">
              <Button variant="danger" size="lg" fullWidth iconBefore={<span>✕</span>}>
                Danger Zone
              </Button>
              <p className="text-sm text-slate-400 text-center">
                Critical actions with confident red luminance
              </p>
            </div>

            <div className="space-y-4">
              <Button variant="notice" size="lg" fullWidth iconBefore={<span>ℹ</span>}>
                Information
              </Button>
              <p className="text-sm text-slate-400 text-center">
                Calm blue for neutral, informative actions
              </p>
            </div>
          </div>
        </section>

        {/* Refined Ghost Buttons */}
        <section>
          <h2 className="text-3xl font-semibold mb-8 aurora-text">Ghost & Subtle Actions</h2>
          <div className="bg-gradient-to-br from-slate-900/50 to-purple-900/20 backdrop-blur-xl border border-purple-500/20 rounded-xl p-12">
            <div className="flex flex-wrap gap-4 justify-center items-center">
              <Button variant="ghost" size="sm">Skip</Button>
              <Button variant="ghost" size="md">Maybe Later</Button>
              <Button variant="ghost" size="lg">View Details</Button>
              <Button variant="ghost" size="xl" iconBefore={<span>→</span>}>Continue</Button>
            </div>
            <p className="text-center text-slate-400 mt-6">
              Transparent with backdrop blur • Subtle Aurora glow on hover • Non-intrusive presence
            </p>
          </div>
        </section>

        {/* Cancel to Danger Transform */}
        <section>
          <h2 className="text-3xl font-semibold mb-8 aurora-text">Contextual Transforms</h2>
          <div className="bg-slate-900/30 backdrop-blur-xl border border-purple-500/20 rounded-xl p-8">
            <div className="flex flex-wrap gap-4 justify-center items-center mb-4">
              <Button variant="cancel" size="lg">
                Cancel
              </Button>
              <span className="text-slate-500">→ Hover →</span>
              <div className="text-slate-400 text-sm">
                Transforms to danger red
              </div>
            </div>
            <p className="text-center text-slate-400">
              Emotional intelligence: muted gray → warning red on hover
            </p>
          </div>
        </section>

        {/* Animation Showcase */}
        <section>
          <h2 className="text-3xl font-semibold mb-8 aurora-text">Aurora Animations</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="primary" animation="pulse" size="lg" fullWidth>
              Pulse
            </Button>
            <Button variant="success" animation="breathe" size="lg" fullWidth>
              Breathe
            </Button>
            <Button variant="warning" animation="shimmer" size="lg" fullWidth>
              Shimmer
            </Button>
            <Button variant="notice" animation="glow" size="lg" fullWidth>
              Glow
            </Button>
          </div>
          <p className="text-center text-slate-400 mt-6">
            Subtle, purposeful motion that enhances without distracting
          </p>
        </section>

        {/* Size Spectrum */}
        <section>
          <h2 className="text-3xl font-semibold mb-8 aurora-text">Size Spectrum</h2>
          <div className="flex flex-wrap gap-6 items-end justify-center bg-slate-900/20 backdrop-blur-sm border border-purple-500/10 rounded-xl p-12">
            <div className="flex flex-col items-center gap-2">
              <Button variant="primary" size="sm">Small</Button>
              <span className="text-xs text-slate-500">32px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Button variant="primary" size="md">Medium</Button>
              <span className="text-xs text-slate-500">40px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Button variant="primary" size="lg">Large</Button>
              <span className="text-xs text-slate-500">48px</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Button variant="primary" size="xl">Extra Large</Button>
              <span className="text-xs text-slate-500">56px</span>
            </div>
          </div>
        </section>

        {/* Contrast Compliance */}
        <section className="bg-gradient-to-br from-purple-900/30 to-slate-900/30 backdrop-blur-xl border border-purple-400/30 rounded-2xl p-8">
          <h2 className="text-2xl font-semibold mb-6 aurora-text">✅ Enhanced Accessibility</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-semibold mb-3 text-lg">Contrast Ratios</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Primary buttons: 7.2:1 (AAA)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Secondary buttons: 8.1:1 (AAA)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> Warning buttons: 9.5:1 (AAA)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-400">✓</span> All text readable with glow effects
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3 text-lg">Aurora Enhancements</h3>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✨</span> 3-stop gradients for depth
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✨</span> Overlay blend modes for shimmer
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✨</span> Backdrop blur glass morphism
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-purple-400">✨</span> Emotionally intelligent color shifts
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Interactive Playground */}
        <section>
          <h2 className="text-3xl font-semibold mb-8 aurora-text text-center">Try It Yourself</h2>
          <div className="bg-gradient-to-br from-purple-900/20 to-slate-900/40 backdrop-blur-xl border-2 border-purple-400/30 rounded-2xl p-12">
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="primary" size="lg" animation="shimmer" ripple>
                Click Me!
              </Button>
              <Button variant="success" size="lg" iconBefore={<span>🎉</span>}>
                Celebrate
              </Button>
              <Button variant="notice" size="lg" animation="breathe">
                Inform
              </Button>
              <Button variant="ghost" size="lg">
                Ghost Action
              </Button>
            </div>
            <p className="text-center text-slate-400 mt-8">
              Notice the enhanced glows, smoother gradients, and improved text readability
            </p>
          </div>
        </section>

        <div className="text-center text-slate-500 text-sm pb-16">
          <p>Aurora Button System v2.0 • Enhanced Water Droplet Design</p>
          <p className="mt-2">Inspired by 15 interconnected digital universes</p>
        </div>
      </div>
    </div>
  );
}
