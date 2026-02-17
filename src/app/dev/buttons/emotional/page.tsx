/**
 * Aurora Emotional Intelligence Button Showcase
 * Demonstrates context-aware, emotionally responsive buttons
 */

'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function EmotionalButtonShowcase() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDelete = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setDeleteConfirm(false);
    }, 3000);
  };

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
              Emotional Intelligence
            </h1>
            <div className="h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full"></div>
          </div>
          <p className="text-xl text-slate-400 mb-8 max-w-3xl mx-auto">
            Buttons that respond emotionally to user interaction and context
          </p>
          <Button
            variant={theme === 'dark' ? 'primary' : 'secondary'}
            size="lg"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? '☀️' : '🌙'} Switch Theme
          </Button>
        </div>

        {/* Emotional Intelligence Explanation */}
        <section className="bg-slate-900/30 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8">
          <h2 className="text-2xl font-semibold mb-6 aurora-text">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-4xl mb-3">😊</div>
              <h3 className="font-semibold text-lg">Excitement on Hover</h3>
              <p className="text-slate-400 text-sm">
                When you hover over a button, it becomes <strong className="text-purple-400">excited</strong> showing
                immediate enthusiasm for your attention
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl mb-3">😌</div>
              <h3 className="font-semibold text-lg">Calming After 5s</h3>
              <p className="text-slate-400 text-sm">
                After 5 seconds of hovering, it transitions to a calm <strong className="text-blue-400">breathing</strong> state,
                showing patience
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl mb-3">⚠️</div>
              <h3 className="font-semibold text-lg">Context Awareness</h3>
              <p className="text-slate-400 text-sm">
                Danger buttons are <strong className="text-red-400">nervous</strong> by default,
                success buttons <strong className="text-green-400">glow</strong> with confidence
              </p>
            </div>
          </div>
        </section>

        {/* Interactive Demo: Hover Behavior */}
        <section>
          <h2 className="text-3xl font-semibold mb-8 aurora-text">Try Hovering for 5+ Seconds</h2>
          <div className="bg-gradient-to-br from-slate-900/50 to-purple-900/20 backdrop-blur-xl border border-purple-500/20 rounded-xl p-12">
            <div className="flex flex-wrap gap-6 justify-center items-center">
              <div className="text-center space-y-3">
                <Button 
                  variant="primary" 
                  size="lg"
                  emotional
                  emotionalExcitementDuration={5000}
                  emotionalCalmAnimation="breathe"
                >
                  Hover Me!
                </Button>
                <p className="text-sm text-slate-500">
                  Excited → Calm (5s)
                </p>
              </div>

              <div className="text-center space-y-3">
                <Button 
                  variant="success" 
                  size="lg"
                  emotional
                  emotionalExcitementDuration={3000}
                  emotionalCalmAnimation="glow"
                >
                  Quick Calm (3s)
                </Button>
                <p className="text-sm text-slate-500">
                  Faster transition
                </p>
              </div>

              <div className="text-center space-y-3">
                <Button 
                  variant="notice" 
                  size="lg"
                  emotional
                  emotionalExcitementDuration={8000}
                  emotionalCalmAnimation="pulse"
                >
                  Patient (8s)
                </Button>
                <p className="text-sm text-slate-500">
                  Stays excited longer
                </p>
              </div>
            </div>

            <div className="mt-8 text-center text-slate-400">
              <p>Notice the animation transitions as you hover:</p>
              <p className="mt-2 text-sm">
                <span className="text-yellow-400">Excited (bounce)</span> → 
                <span className="mx-2">wait...</span> → 
                <span className="text-blue-400">Calm (breathe/pulse/glow)</span>
              </p>
            </div>
          </div>
        </section>

        {/* Context-Aware Defaults */}
        <section>
          <h2 className="text-3xl font-semibold mb-8 aurora-text">Context-Aware Animations</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900/20 backdrop-blur-sm border border-red-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-red-400">Danger = Nervous</h3>
              <Button 
                variant="danger" 
                size="lg" 
                fullWidth
                emotional
                emotionalContextAware
              >
                Delete Account
              </Button>
              <p className="text-sm text-slate-500 mt-3">
                Automatically nervous to signal caution
              </p>
            </div>

            <div className="bg-slate-900/20 backdrop-blur-sm border border-amber-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-amber-400">Warning = Nervous</h3>
              <Button 
                variant="warning" 
                size="lg" 
                fullWidth
                emotional
                emotionalContextAware
              >
                Proceed with Caution
              </Button>
              <p className="text-sm text-slate-500 mt-3">
                Shares danger&apos;s nervous energy
              </p>
            </div>

            <div className="bg-slate-900/20 backdrop-blur-sm border border-green-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-green-400">Success = Glow</h3>
              <Button 
                variant="success" 
                size="lg" 
                fullWidth
                emotional
                emotionalContextAware
              >
                Confirm & Save
              </Button>
              <p className="text-sm text-slate-500 mt-3">
                Glows with confident energy
              </p>
            </div>

            <div className="bg-slate-900/20 backdrop-blur-sm border border-purple-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-purple-400">Primary = Pulse</h3>
              <Button 
                variant="primary" 
                size="lg" 
                fullWidth
                emotional
                emotionalContextAware
              >
                Get Started
              </Button>
              <p className="text-sm text-slate-500 mt-3">
                Steady, inviting pulse
              </p>
            </div>

            <div className="bg-slate-900/20 backdrop-blur-sm border border-blue-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-blue-400">Notice = Breathe</h3>
              <Button 
                variant="notice" 
                size="lg" 
                fullWidth
                emotional
                emotionalContextAware
              >
                Learn More
              </Button>
              <p className="text-sm text-slate-500 mt-3">
                Calm, informative breathing
              </p>
            </div>

            <div className="bg-slate-900/20 backdrop-blur-sm border border-slate-500/20 rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-slate-400">Ghost = None</h3>
              <Button 
                variant="ghost" 
                size="lg" 
                fullWidth
                emotional
                emotionalContextAware
              >
                Skip
              </Button>
              <p className="text-sm text-slate-500 mt-3">
                Subtle, unobtrusive presence
              </p>
            </div>
          </div>
        </section>

        {/* Loading State Progression */}
        <section>
          <h2 className="text-3xl font-semibold mb-8 aurora-text">Loading State Emotions</h2>
          <div className="bg-slate-900/30 backdrop-blur-xl border border-purple-500/20 rounded-xl p-8">
            <div className="space-y-4">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading={isProcessing}
                emotional
                onClick={() => setIsProcessing(true)}
              >
                {isProcessing ? 'Processing...' : 'Start Long Process'}
              </Button>
              
              <div className="text-center text-slate-400">
                <p className="text-sm">
                  {isProcessing ? (
                    <>
                      <span className="text-purple-400">0-3s:</span> Pulse (starting) → 
                      <span className="text-blue-400 mx-2">3-8s:</span> Breathe (working) → 
                      <span className="text-yellow-400 mx-2">8s+:</span> Shimmer (still working)
                    </>
                  ) : (
                    'Click to see emotional loading progression'
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Real-World Example: Delete Confirmation */}
        <section>
          <h2 className="text-3xl font-semibold mb-8 aurora-text">Real-World Example</h2>
          <div className="bg-gradient-to-br from-red-900/20 to-slate-900/40 backdrop-blur-xl border-2 border-red-500/30 rounded-2xl p-8">
            {!deleteConfirm ? (
              <div className="text-center space-y-6">
                <div className="text-6xl mb-4">🗑️</div>
                <h3 className="text-2xl font-bold">Delete Your Account?</h3>
                <p className="text-slate-400 max-w-md mx-auto">
                  This action cannot be undone. All your data will be permanently removed.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    variant="ghost"
                    size="lg"
                    emotional
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    size="lg"
                    emotional
                    emotionalContextAware
                    onClick={() => setDeleteConfirm(true)}
                  >
                    Yes, Delete My Account
                  </Button>
                </div>
                <p className="text-xs text-slate-500 mt-4">
                  Notice the danger button is naturally nervous
                </p>
              </div>
            ) : (
              <div className="text-center space-y-6">
                <div className="text-6xl mb-4">⚠️</div>
                <h3 className="text-2xl font-bold text-red-400">Are You Absolutely Sure?</h3>
                <p className="text-slate-400 max-w-md mx-auto">
                  Type &quot;DELETE&quot; to confirm this irreversible action.
                </p>
                <div className="flex gap-4 justify-center">
                  <Button
                    variant="secondary"
                    size="lg"
                    onClick={() => setDeleteConfirm(false)}
                    emotional
                  >
                    Go Back
                  </Button>
                  <Button
                    variant="danger"
                    size="lg"
                    emotional
                    emotionalContextAware
                    loading={isProcessing}
                    onClick={handleDelete}
                  >
                    {isProcessing ? 'Deleting...' : 'Confirm Delete'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Configuration Examples */}
        <section>
          <h2 className="text-3xl font-semibold mb-8 aurora-text">Configuration Options</h2>
          <div className="bg-slate-900/20 backdrop-blur-sm border border-purple-500/10 rounded-xl p-8">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-3 text-lg">Basic Usage</h3>
                <pre className="bg-slate-950/50 p-4 rounded-lg text-sm overflow-x-auto">
                  <code className="text-purple-300">{`<Button 
  variant="primary"
  emotional           // Enable emotional intelligence
>
  Click Me
</Button>`}</code>
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-lg">Custom Timing</h3>
                <pre className="bg-slate-950/50 p-4 rounded-lg text-sm overflow-x-auto">
                  <code className="text-purple-300">{`<Button 
  variant="success"
  emotional
  emotionalExcitementDuration={3000}  // 3 seconds instead of 5
  emotionalCalmAnimation="glow"       // Use glow instead of breathe
>
  Quick Response
</Button>`}</code>
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-3 text-lg">Disable Context Awareness</h3>
                <pre className="bg-slate-950/50 p-4 rounded-lg text-sm overflow-x-auto">
                  <code className="text-purple-300">{`<Button 
  variant="danger"
  emotional
  emotionalContextAware={false}  // Don't auto-apply nervous animation
  animation="pulse"               // Use explicit animation instead
>
  Custom Behavior
</Button>`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        <div className="text-center text-slate-500 text-sm pb-16">
          <p>Aurora Emotional Intelligence v1.0</p>
          <p className="mt-2">Buttons that feel, respond, and adapt</p>
        </div>
      </div>
    </div>
  );
}
