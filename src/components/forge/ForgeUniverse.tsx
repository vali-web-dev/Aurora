'use client';

import { useState } from 'react';
import { Card } from '@/components/aurora/Card';
import { Button } from '@/components/aurora/Button';

const blockTypes = [
  { name: 'Hero', icon: '🦸', description: 'Large headline section' },
  { name: 'Text', icon: '📝', description: 'Rich text content' },
  { name: 'Media', icon: '📸', description: 'Images and videos' },
  { name: 'Features', icon: '⭐', description: 'Feature grid' },
  { name: 'Testimonials', icon: '💬', description: 'Social proof' },
  { name: 'CTA', icon: '🎯', description: 'Call-to-action' },
  { name: 'FAQ', icon: '❓', description: 'Questions & answers' },
  { name: 'Pricing', icon: '💰', description: 'Pricing table' },
];

const recentSurfaces = [
  { id: '1', name: 'Product Launch Page', blocks: 8, updated: '2 hours ago' },
  { id: '2', name: 'Service Override', blocks: 5, updated: '1 day ago' },
  { id: '3', name: 'Landing Campaign', blocks: 12, updated: '3 days ago' },
  { id: '4', name: 'Portfolio Showcase', blocks: 6, updated: '1 week ago' },
];

export function ForgeUniverse() {
  const [activeTab, setActiveTab] = useState<'builder' | 'library' | 'templates'>('templates');
  const [selectedBlocks, setSelectedBlocks] = useState<string[]>([]);

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="space-y-3">
        <h1 className="text-5xl font-bold text-slate-900 dark:text-slate-50">
          Forge
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl">
          Build surfaces and components with clarity, beauty, and endless possibility.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        {(['builder', 'library', 'templates'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Builder View */}
      {activeTab === 'builder' && (
        <div className="space-y-6">
          <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
            <div className="text-center space-y-4">
              <p className="text-xl font-semibold text-slate-900 dark:text-slate-50">
                Create a new surface
              </p>
              <Button variant="primary" size="lg">
                ✨ Start Building
              </Button>
            </div>
          </Card>

          {/* Recent Surfaces */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
              Recent Surfaces
            </h3>
            <div className="space-y-2">
              {recentSurfaces.map((surface) => (
                <div
                  key={surface.id}
                  className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-slate-50">
                        {surface.name}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {surface.blocks} blocks • Updated {surface.updated}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Open →
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Library View */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
              Block Library
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Choose blocks to compose your surfaces. Each block is designed for clarity and responsiveness.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {blockTypes.map((block) => (
              <button
                key={block.name}
                onClick={() =>
                  setSelectedBlocks(
                    selectedBlocks.includes(block.name)
                      ? selectedBlocks.filter((b) => b !== block.name)
                      : [...selectedBlocks, block.name]
                  )
                }
                className="text-left"
              >
                <Card
                  hoverable
                  className="cursor-pointer h-full"
                >
                  <div className="space-y-3 text-center">
                  <div className="text-4xl">{block.icon}</div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-50">
                      {block.name}
                    </p>
                    <p className="text-xs text-slate-600 dark:text-slate-400">
                      {block.description}
                    </p>
                  </div>
                  <div className={`h-1 rounded-full ${selectedBlocks.includes(block.name) ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'}`} />
                </div>
              </Card>
              </button>
            ))}
          </div>

          {selectedBlocks.length > 0 && (
            <Card className="bg-blue-50 dark:bg-slate-900 border-blue-200 dark:border-slate-800">
              <div className="space-y-3">
                <p className="font-semibold text-slate-900 dark:text-slate-50">
                  Selected Blocks ({selectedBlocks.length})
                </p>
                <div className="flex gap-2 flex-wrap">
                  {selectedBlocks.map((block) => (
                    <span
                      key={block}
                      className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
                    >
                      {block} ✕
                    </span>
                  ))}
                </div>
                <Button variant="primary" size="lg" className="w-full">
                  Create Surface with {selectedBlocks.length} Block{selectedBlocks.length !== 1 ? 's' : ''}
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Templates View */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
              Pre-built Templates
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Start with professionally designed templates and customize them for your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { name: 'SaaS Landing', blocks: 8, category: 'Product' },
              { name: 'Personal Portfolio', blocks: 6, category: 'Creator' },
              { name: 'Blog Post', blocks: 5, category: 'Content' },
              { name: 'Event Page', blocks: 7, category: 'Community' },
              { name: 'Course Intro', blocks: 9, category: 'Learning' },
              { name: 'Shop Showcase', blocks: 10, category: 'Commerce' },
            ].map((template, idx) => (
              <Card key={idx} hoverable>
                <div className="space-y-4">
                  <div className="h-40 bg-gradient-to-br from-purple-400 to-blue-600 rounded-lg" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-50">
                      {template.name}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {template.blocks} blocks • {template.category}
                    </p>
                  </div>
                  <Button variant="primary" size="sm" className="w-full">
                    Use Template
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
