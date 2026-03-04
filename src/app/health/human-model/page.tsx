import { AuroraShell } from '@/components/os/AuroraShell';
import { Surface, SurfaceHeader, SurfaceSection } from '@/components/aurora/Surface';
import { Anatomy3DExplorer } from '@/components/health/Anatomy3DExplorer';

export const metadata = {
  title: 'Human Model - Aurora',
  description: 'Interactive 3D human model and blueprint explorer.',
};

export default function HumanModelPage() {
  return (
    <AuroraShell>
      <Surface className="py-8">
        <SurfaceHeader
          title="Human Model"
          description="Explore anatomy, systems, and blueprint insights in a dedicated interactive workspace."
        />
        <SurfaceSection
          title="3D Anatomy Explorer"
          description="Full-body model with organ-level details, progress tracking, and guided insight panels."
        >
          <Anatomy3DExplorer />
        </SurfaceSection>
      </Surface>
    </AuroraShell>
  );
}
