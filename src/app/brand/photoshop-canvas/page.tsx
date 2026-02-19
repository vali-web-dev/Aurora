import { PhotoshopCanvas } from '@/components/brand/PhotoshopCanvas';

export const metadata = {
  title: 'Photoshop Canvas - Aurora',
  description: 'Professional vector and raster editing canvas with full Photoshop-like features.',
};

export default function PhotoshopCanvasPage() {
  return (
    <div className="h-screen w-screen overflow-hidden bg-slate-900">
      <PhotoshopCanvas />
    </div>
  );
}
