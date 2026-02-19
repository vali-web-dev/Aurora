import { PhotoshopCanvasAdvanced } from '@/components/brand/PhotoshopCanvasAdvanced';

export const metadata = {
  title: 'Photoshop Canvas Advanced - Aurora',
  description: 'Advanced Photoshop editor with Smart Objects, Adjustment Layers, and Masks.',
};

export default function PhotoshopCanvasAdvancedPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-900">
      <PhotoshopCanvasAdvanced />
    </div>
  );
}
