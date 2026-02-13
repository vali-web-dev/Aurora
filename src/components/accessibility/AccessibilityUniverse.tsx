'use client';

import { AccessibilityPanel } from './AccessibilityPanel';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';

export function AccessibilityUniverse() {
  return (
    <Surface className="py-8">
      <SurfaceHeader
        title="Accessibility Universe"
        description="Customize Aurora to meet your accessibility needs. Changes are applied immediately."
      />
      <SurfaceSection title="Preferences">
        <AccessibilityPanel showHeader={false} />
      </SurfaceSection>
    </Surface>
  );
}
