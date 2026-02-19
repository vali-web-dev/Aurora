import { Metadata } from 'next';
import { PhotoshopCanvasEnhanced } from '@/components/brand/PhotoshopCanvasEnhanced';

export const metadata: Metadata = {
  title: 'Aurora Design Studio Enhanced | Aurora',
  description: 'Professional Photoshop-like design editor with advanced tools, guides, alignment, presets, and filters.',
};

export default function PhotoshopEnhancedPage() {
  return <PhotoshopCanvasEnhanced />;
}
