import { ArcPanelLogoLabIntegrated } from '@/components/brand/ArcPanelLogoLabIntegrated';

export const metadata = {
  title: 'Aurora Logo Studio - Integrated',
  description: 'Professional logo editing with Arc Panel and Photoshop Canvas integration.',
};

export default function IntegratedStudioPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-900">
      <ArcPanelLogoLabIntegrated />
    </div>
  );
}
