import { Metadata } from 'next';
import { ArcPanelStudioPro } from '@/components/brand/ArcPanelStudioPro';

export const metadata: Metadata = {
  title: 'Aurora Design Studio Pro | Aurora',
  description: 'Professional integrated design environment with Arc Panel, Photoshop Canvas, and advanced workflows.',
};

export default function StudioProPage() {
  return <ArcPanelStudioPro />;
}
