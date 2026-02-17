/**
 * Universe Logos Showcase
 * 
 * Displays all Aurora universe logos with interactive preview
 */

'use client';

import { UniverseLogo, UniverseLogoGrid, UNIVERSE_NAMES, type UniverseId } from '@/components/aurora/UniverseLogo';

export default function UniverseLogosPage() {
  const universes = Object.keys(UNIVERSE_NAMES) as UniverseId[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Aurora Universe Logos
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Unique visual identities for each of Aurora&apos;s 15 interconnected universes.
            Each logo shares Aurora&apos;s design DNA with gradient colors, glow effects, and symbolic icons.
          </p>
        </div>

        {/* Interactive Grid */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">All Universes</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <UniverseLogoGrid 
              size={64} 
              showLabels={true}
              onUniverseClick={(universe) => {
                console.log(`Navigating to ${universe} universe`);
                // Add navigation logic here
              }}
            />
          </div>
        </section>

        {/* Size Variants */}
        <section className="mb-16">
          <h2 className="text-2xl font-semibold mb-6">Size Reference</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
            <div className="flex flex-wrap items-end gap-8">
              <div className="flex flex-col items-center gap-2">
                <UniverseLogo universe="home" size={16} />
                <span className="text-xs text-gray-500">16px</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <UniverseLogo universe="home" size={24} />
                <span className="text-xs text-gray-500">24px</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <UniverseLogo universe="home" size={32} />
                <span className="text-xs text-gray-500">32px</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <UniverseLogo universe="home" size={48} />
                <span className="text-xs text-gray-500">48px</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <UniverseLogo universe="home" size={64} />
                <span className="text-xs text-gray-500">64px</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <UniverseLogo universe="home" size={96} />
                <span className="text-xs text-gray-500">96px</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <UniverseLogo universe="home" size={128} />
                <span className="text-xs text-gray-500">128px</span>
              </div>
            </div>
          </div>
        </section>

        {/* Individual Universe Details */}
        <section>
          <h2 className="text-2xl font-semibold mb-6">Universe Details</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {universes.map((universe) => (
              <div 
                key={universe}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <UniverseLogo universe={universe} size={48} />
                  <div>
                    <h3 className="text-lg font-semibold">{UNIVERSE_NAMES[universe]}</h3>
                    <code className="text-xs text-gray-500">{universe}.svg</code>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <UniverseLogo universe={universe} size={16} />
                    <UniverseLogo universe={universe} size={24} />
                    <UniverseLogo universe={universe} size={32} />
                    <UniverseLogo universe={universe} size={48} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Usage Examples */}
        <section className="mt-16">
          <h2 className="text-2xl font-semibold mb-6">Usage Examples</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 space-y-8">
            {/* Navigation Example */}
            <div>
              <h3 className="text-lg font-medium mb-4">Navigation Bar</h3>
              <div className="flex gap-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
                {['home', 'social', 'entertainment', 'productivity', 'create'].map((universe) => (
                  <button
                    key={universe}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
                  >
                    <UniverseLogo universe={universe as UniverseId} size={24} />
                    <span className="text-sm font-medium">{UNIVERSE_NAMES[universe as UniverseId]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Card Example */}
            <div>
              <h3 className="text-lg font-medium mb-4">Universe Card</h3>
              <div className="max-w-sm p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                <UniverseLogo universe="gaming" size={64} className="mb-4" />
                <h4 className="text-xl font-bold mb-2">Gaming Universe</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Explore competitive gaming, casual play, and social gaming experiences.
                </p>
              </div>
            </div>

            {/* Inline Icon Example */}
            <div>
              <h3 className="text-lg font-medium mb-4">Inline Text</h3>
              <p className="text-base">
                Navigate to{' '}
                <span className="inline-flex items-center gap-1">
                  <UniverseLogo universe="travel" size={16} />
                  <strong>Travel</strong>
                </span>
                {' '}to plan your next adventure, or visit{' '}
                <span className="inline-flex items-center gap-1">
                  <UniverseLogo universe="learning" size={16} />
                  <strong>Learning</strong>
                </span>
                {' '}to discover new courses.
              </p>
            </div>
          </div>
        </section>

        {/* Code Snippets */}
        <section className="mt-16 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Code Examples</h2>
          <div className="space-y-4">
            <div className="bg-gray-900 text-gray-100 rounded-xl p-6 overflow-x-auto">
              <pre className="text-sm">
{`import { UniverseLogo } from '@/components/aurora/UniverseLogo';

// Basic usage
<UniverseLogo universe="home" size={32} />

// With label
<UniverseLogo 
  universe="social" 
  size={48}
  showLabel={true}
  labelPosition="right"
/>

// In navigation
<nav className="flex gap-4">
  <UniverseLogo universe="home" size={24} />
  <UniverseLogo universe="productivity" size={24} />
  <UniverseLogo universe="entertainment" size={24} />
</nav>`}
              </pre>
            </div>

            <div className="bg-gray-900 text-gray-100 rounded-xl p-6 overflow-x-auto">
              <pre className="text-sm">
{`// Display all universes in a grid
import { UniverseLogoGrid } from '@/components/aurora/UniverseLogo';

<UniverseLogoGrid 
  size={64}
  showLabels={true}
  onUniverseClick={(universe) => {
    router.push(\`/\${universe}\`);
  }}
/>`}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
